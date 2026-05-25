import crypto from 'crypto';
import {
  GRAPH_BASE,
  SUCCESS_REDIRECT,
  TOKEN_COOKIE,
  STATE_COOKIE,
  clearCookie,
  encryptToken,
  getDefaultPageId,
  getPages,
  getUserToken,
  graphGet,
  graphPost,
  json,
  parseCookies,
  setCookie,
  getRequiredEnv,
  findPage
} from '../lib/meta-utils.js';

const DEFAULT_SCOPES = [
  'public_profile',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'pages_manage_metadata'
];

const DEFAULT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwSfhr2jxN8zAHpvtebkOzffb5M5p4k9AW25vfQHIoqQfaKsTTHEVjFZJwVqTmvmYHx/exec';

function getPath(req) {
  const raw = (req.query && req.query.path) || [];
  if (Array.isArray(raw)) return raw.join('/');
  if (raw) return String(raw);
  return String(req.url || '').split('?')[0].replace(/^\/api\/?/, '').replace(/^\//, '');
}

function getScopes() {
  const raw = process.env.META_SCOPES || DEFAULT_SCOPES.join(',');
  return raw.split(',').map(item => item.trim()).filter(Boolean);
}

async function fetchJson(url) {
  const response = await fetch(url.toString());
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) throw new Error(payload.error?.message || `Meta OAuth error: ${response.status}`);
  return payload;
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeUpstreamResponse(upstreamOk, text) {
  try {
    const parsed = JSON.parse(text || '{}');
    return isPlainObject(parsed) ? parsed : { ok: upstreamOk, success: upstreamOk, data: parsed };
  } catch (_) {
    return { ok: upstreamOk, success: false, error: 'Zoho proxy returned non JSON response', raw: text || '' };
  }
}

async function safe(fn) {
  try { return { ok: true, result: await fn() }; }
  catch (error) { return { ok: false, error: error.message }; }
}

async function handleLogin(req, res) {
  const appId = getRequiredEnv('META_APP_ID');
  const redirectUri = getRequiredEnv('META_REDIRECT_URI');
  const state = crypto.randomBytes(18).toString('hex');
  const scopes = getScopes();
  res.setHeader('Set-Cookie', setCookie(STATE_COOKIE, state, 600));
  const url = new URL('https://www.facebook.com/dialog/oauth');
  url.searchParams.set('client_id', appId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  url.searchParams.set('scope', scopes.join(','));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('auth_type', 'rerequest');
  return res.redirect(302, url.toString());
}

async function handleCallback(req, res) {
  const { code, state, error, error_description } = req.query || {};
  if (error) throw new Error(error_description || error);
  if (!code) throw new Error('Missing Facebook OAuth code.');
  const cookies = parseCookies(req);
  if (!state || !cookies[STATE_COOKIE] || String(state) !== String(cookies[STATE_COOKIE])) {
    throw new Error('Invalid OAuth state. Please try connecting Facebook again.');
  }
  const appId = getRequiredEnv('META_APP_ID');
  const appSecret = getRequiredEnv('META_APP_SECRET');
  const redirectUri = getRequiredEnv('META_REDIRECT_URI');
  const shortUrl = new URL(`${GRAPH_BASE}/oauth/access_token`);
  shortUrl.searchParams.set('client_id', appId);
  shortUrl.searchParams.set('client_secret', appSecret);
  shortUrl.searchParams.set('redirect_uri', redirectUri);
  shortUrl.searchParams.set('code', code);
  const shortToken = await fetchJson(shortUrl);
  const longUrl = new URL(`${GRAPH_BASE}/oauth/access_token`);
  longUrl.searchParams.set('grant_type', 'fb_exchange_token');
  longUrl.searchParams.set('client_id', appId);
  longUrl.searchParams.set('client_secret', appSecret);
  longUrl.searchParams.set('fb_exchange_token', shortToken.access_token);
  const longToken = await fetchJson(longUrl);
  res.setHeader('Set-Cookie', [clearCookie(STATE_COOKIE), setCookie(TOKEN_COOKIE, encryptToken(longToken.access_token))]);
  return res.redirect(302, SUCCESS_REDIRECT + (SUCCESS_REDIRECT.includes('?') ? '&' : '?') + 'meta=connected');
}

async function handlePages(req, res) {
  const token = getUserToken(req);
  if (!token) return json(res, 401, { ok: false, connected: false, error: 'Meta غير متصل. اضغط ربط / إعادة ربط Meta.' });
  try {
    const pages = await getPages(token);
    return json(res, 200, { ok: true, connected: true, pages: pages.map(page => ({
      id: page.id,
      name: page.name,
      category: page.category,
      instagram: page.instagram_business_account || null,
      source: page._source || null,
      hasPageToken: Boolean(page.access_token),
      tokenFallback: Boolean(page._userTokenFallback)
    })) });
  } catch (pagesError) {
    try {
      const me = await graphGet('/me', { fields: 'id,name' }, token);
      return json(res, 200, { ok: true, connected: true, limited: true, user: me, pages: [], note: 'Meta Login متصل · صلاحيات الصفحات لم تتفعل أو الصفحة لم ترجع من Meta', pagesError: pagesError.message });
    } catch (_) {
      return json(res, 401, { ok: false, connected: false, error: 'انتهت جلسة Meta أو لم يكتمل الربط. اضغط إعادة ربط Meta.' });
    }
  }
}

async function handleDebug(req, res) {
  const appId = process.env.META_APP_ID || '';
  return json(res, 200, {
    ok: true,
    deployed: 'meta-rewrite-single-function-v10',
    serverlessFunctions: 1,
    scopes: getScopes(),
    appIdLast4: appId ? appId.slice(-4) : null,
    graphVersion: process.env.META_GRAPH_VERSION || 'v20.0',
    hasMetaAppId: Boolean(process.env.META_APP_ID),
    hasMetaAppSecret: Boolean(process.env.META_APP_SECRET),
    hasMetaRedirectUri: Boolean(process.env.META_REDIRECT_URI),
    redirectUri: process.env.META_REDIRECT_URI || null,
    defaultPageId: getDefaultPageId() || null,
    hasPageAccessToken: Boolean(process.env.META_PAGE_ACCESS_TOKEN || process.env.META_SYSTEM_PAGE_TOKEN)
  });
}

async function handleTokenDebug(req, res) {
  const token = getUserToken(req);
  if (!token) return json(res, 401, { ok: false, connected: false, error: 'No Meta token cookie found.' });
  const me = await graphGet('/me', { fields: 'id,name' }, token);
  let permissions = null;
  try { permissions = (await graphGet('/me/permissions', {}, token)).data || []; }
  catch (error) { permissions = { error: error.message }; }
  return json(res, 200, { ok: true, connected: true, me, permissions });
}

async function handlePagesDebug(req, res) {
  const token = getUserToken(req);
  if (!token) return json(res, 401, { ok: false, connected: false, error: 'No Meta token cookie found.' });
  const fields = 'id,name,access_token,category,link,fan_count,instagram_business_account{id,username,name}';
  const me = await safe(() => graphGet('/me', { fields: 'id,name' }, token));
  const permissions = await safe(() => graphGet('/me/permissions', {}, token));
  const directAccounts = await safe(() => graphGet('/me/accounts', { fields, limit: 100 }, token));
  const nestedAccounts = await safe(() => graphGet('/me', { fields: `accounts.limit(100){${fields}}` }, token));
  const businesses = await safe(() => graphGet('/me/businesses', { fields: 'id,name' }, token));
  return json(res, 200, { ok: true, connected: true, deployed: 'meta-rewrite-single-function-v10', me, permissions, directAccounts, nestedAccounts, businesses });
}

async function handlePageDirectDebug(req, res) {
  const token = getUserToken(req);
  if (!token) return json(res, 401, { ok: false, connected: false, error: 'No Meta token cookie found.' });
  const pageId = (req.query && req.query.pageId) || getDefaultPageId();
  if (!pageId) return json(res, 400, { ok: false, connected: true, error: 'Missing META_DEFAULT_PAGE_ID environment variable.', expected: 'META_DEFAULT_PAGE_ID=mzjcars' });
  const fields = 'id,name,category,link,fan_count,instagram_business_account{id,username,name}';
  const me = await safe(() => graphGet('/me', { fields: 'id,name' }, token));
  const permissions = await safe(() => graphGet('/me/permissions', {}, token));
  const page = await safe(() => graphGet(`/${pageId}`, { fields }, token));
  const pageFeedRead = await safe(() => graphGet(`/${pageId}/feed`, { limit: 1, fields: 'id,message,created_time' }, token));
  return json(res, 200, { ok: true, connected: true, deployed: 'meta-rewrite-single-function-v10', pageId, me, permissions, page, pageFeedRead });
}

async function handleFacebookPublish(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });
  const token = getUserToken(req);
  if (!token) return json(res, 401, { ok: false, error: 'Facebook is not connected yet.' });
  const body = await readBody(req);
  const message = [body.caption, body.link].filter(Boolean).join('\n\n').trim();
  if (!message && !body.mediaUrl) return json(res, 400, { ok: false, error: 'Write post text or add a media URL.' });
  const page = await findPage(token, body.pageId);
  const publishToken = page.access_token || token;
  const payload = body.mediaUrl
    ? await graphPost(`/${page.id}/photos`, { url: body.mediaUrl, caption: message, published: true }, publishToken)
    : await graphPost(`/${page.id}/feed`, { message }, publishToken);
  return json(res, 200, { ok: true, platform: 'facebook', page: { id: page.id, name: page.name }, usedPageAccessToken: Boolean(page.access_token), result: payload });
}

async function handleZohoUpload(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'GET') return res.status(200).json({ ok: true, success: true, message: 'MZJ Zoho upload proxy is running' });
  if (req.method !== 'POST') return res.status(405).json({ ok: false, success: false, error: 'Method not allowed' });
  const payload = await readBody(req);
  if (process.env.MZJ_ZOHO_AUTH_TOKEN && !payload.authToken) {
    payload.authToken = process.env.MZJ_ZOHO_AUTH_TOKEN;
    payload.token = process.env.MZJ_ZOHO_AUTH_TOKEN;
  }
  if (!payload || !payload.fileName || !(payload.base64 || payload.fileData)) {
    return res.status(400).json({ ok: false, success: false, error: 'Missing file payload. Send JSON with fileName and base64/fileData.' });
  }
  let webAppUrl = process.env.MZJ_DRIVE_UPLOAD_WEB_APP_URL || DEFAULT_WEB_APP_URL;
  if (process.env.MZJ_ZOHO_AUTH_TOKEN && !webAppUrl.includes('token=')) {
    webAppUrl += (webAppUrl.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(process.env.MZJ_ZOHO_AUTH_TOKEN);
  }
  const upstream = await fetch(webAppUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
  const text = await upstream.text();
  const response = normalizeUpstreamResponse(upstream.ok, text);
  return res.status(upstream.ok && response.success !== false && response.ok !== false ? 200 : 502).json(response);
}

export default async function handler(req, res) {
  const path = getPath(req);
  try {
    if (path === 'meta/login') return await handleLogin(req, res);
    if (path === 'meta/callback') {
      try { return await handleCallback(req, res); }
      catch (error) {
        const target = SUCCESS_REDIRECT + (SUCCESS_REDIRECT.includes('?') ? '&' : '?') + 'meta_error=' + encodeURIComponent(error.message);
        return res.redirect(302, target);
      }
    }
    if (path === 'meta/logout') { res.setHeader('Set-Cookie', clearCookie(TOKEN_COOKIE)); return json(res, 200, { ok: true, connected: false }); }
    if (path === 'meta/pages') return await handlePages(req, res);
    if (path === 'meta/debug') return await handleDebug(req, res);
    if (path === 'meta/token-debug') return await handleTokenDebug(req, res);
    if (path === 'meta/pages-debug') return await handlePagesDebug(req, res);
    if (path === 'meta/page-direct-debug') return await handlePageDirectDebug(req, res);
    if (path === 'publish/facebook') return await handleFacebookPublish(req, res);
    if (path === 'zoho-upload') return await handleZohoUpload(req, res);
    return json(res, 404, { ok: false, error: 'Unknown API route', path, deployed: 'meta-rewrite-single-function-v10' });
  } catch (error) {
    return json(res, 500, { ok: false, connected: false, error: error.message, path });
  }
}
