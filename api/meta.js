import crypto from 'crypto';
import {
  GRAPH_BASE,
  SUCCESS_REDIRECT,
  TOKEN_COOKIE,
  STATE_COOKIE,
  clearCookie,
  encryptToken,
  decryptToken,
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
const TIKTOK_TOKEN_COOKIE = 'mzj_tiktok_token';
const TIKTOK_STATE_COOKIE = 'mzj_tiktok_state';
const TIKTOK_DEFAULT_SCOPES = ['user.info.basic', 'video.upload'];
const TIKTOK_SUCCESS_REDIRECT = process.env.TIKTOK_SUCCESS_REDIRECT || SUCCESS_REDIRECT;
const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const TIKTOK_USER_INFO_URL = 'https://open.tiktokapis.com/v2/user/info/';

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

function getTikTokScopes() {
  const raw = process.env.TIKTOK_SCOPES || TIKTOK_DEFAULT_SCOPES.join(',');
  return raw.split(',').map(item => item.trim()).filter(Boolean);
}


function maskValue(value) {
  const text = String(value || '').trim();
  if (!text) return { exists: false, length: 0, start: '', end: '', hasWhitespace: false };
  return {
    exists: true,
    length: text.length,
    start: text.slice(0, 4),
    end: text.slice(-4),
    hasWhitespace: /\s/.test(String(value || '')),
    hasQuotes: /^['"].*['"]$/.test(String(value || '').trim())
  };
}

async function handleTikTokLoginDebug(req, res) {
  const clientKeyRaw = process.env.TIKTOK_CLIENT_KEY || '';
  const redirectUriRaw = process.env.TIKTOK_REDIRECT_URI || '';
  const scopes = getTikTokScopes();
  const clientKey = String(clientKeyRaw).trim().replace(/^['"]|['"]$/g, '');
  const redirectUri = String(redirectUriRaw).trim().replace(/^['"]|['"]$/g, '');
  const authUrl = new URL(TIKTOK_AUTH_URL);
  authUrl.searchParams.set('client_key', clientKey);
  authUrl.searchParams.set('scope', scopes.join(','));
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', 'debug_state_not_for_login');
  return json(res, 200, {
    ok: true,
    deployed: 'meta-linking-and-prep-cleanup-v25',
    note: 'Safe TikTok login diagnostics. Secrets are not returned.',
    clientKey: maskValue(clientKeyRaw),
    clientSecret: maskValue(process.env.TIKTOK_CLIENT_SECRET || ''),
    redirectUri,
    redirectUriExpected: 'https://mzj.vercel.app/api/tiktok/callback',
    redirectUriExactMatch: redirectUri === 'https://mzj.vercel.app/api/tiktok/callback',
    scopes,
    authUrlPreview: authUrl.toString().replace(clientKey, `${clientKey.slice(0,4)}...[REDACTED]...${clientKey.slice(-4)}`)
  });
}

function getTikTokToken(req) {
  const cookies = parseCookies(req);
  try {
    const value = decryptToken(cookies[TIKTOK_TOKEN_COOKIE]);
    if (!value) return null;
    return JSON.parse(value);
  } catch (_) {
    return null;
  }
}

function setTikTokTokenCookie(tokenPayload) {
  return setCookie(TIKTOK_TOKEN_COOKIE, encryptToken(JSON.stringify(tokenPayload)), 60 * 60 * 24 * 55);
}

async function tikTokJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) {
    const message = payload.error?.message || payload.error_description || payload.message || `TikTok API error: ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

async function getTikTokUserInfo(accessToken) {
  const url = new URL(TIKTOK_USER_INFO_URL);
  url.searchParams.set('fields', 'open_id,union_id,avatar_url,display_name');
  const payload = await tikTokJson(url.toString(), { headers: { Authorization: `Bearer ${accessToken}` } });
  return payload.data?.user || payload.data || payload;
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

function redactTokenValue(value) {
  if (!value) return value;
  return '[REDACTED]';
}

function redactString(value) {
  let text = String(value);
  // Redact URL query parameters such as access_token=... and appsecret_proof=...
  text = text.replace(/([?&](?:access_token|appsecret_proof)=)[^&\s"']+/gi, '$1[REDACTED]');
  // Redact Meta token-looking strings that may appear in paging URLs or raw payloads.
  text = text.replace(/EAA[A-Za-z0-9_\-]+/g, '[REDACTED_META_TOKEN]');
  return text;
}

function redactSecrets(value) {
  if (typeof value === 'string') return redactString(value);
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (value && typeof value === 'object') {
    const output = {};
    for (const [key, item] of Object.entries(value)) {
      if (/access[_-]?token/i.test(key) || /appsecret[_-]?proof/i.test(key) || /^token$/i.test(key)) {
        output[key] = item ? redactTokenValue(item) : item;
      } else if (/^(next|previous|paging)$/i.test(key)) {
        output[key] = redactSecrets(item);
      } else {
        output[key] = redactSecrets(item);
      }
    }
    return output;
  }
  return value;
}

function publicPageSummary(page) {
  if (!page || typeof page !== 'object') return page;
  return {
    id: page.id || null,
    name: page.name || null,
    category: page.category || null,
    link: page.link || null,
    fan_count: page.fan_count ?? null,
    instagram_business_account: page.instagram_business_account ? {
      id: page.instagram_business_account.id || null,
      username: page.instagram_business_account.username || null,
      name: page.instagram_business_account.name || null
    } : null,
    hasAccessToken: Boolean(page.access_token)
  };
}

function safeResultSummary(safePayload, mapper = value => value) {
  if (!safePayload || !safePayload.ok) return { ok: false, error: safePayload?.error || 'Request failed' };
  return { ok: true, result: mapper(safePayload.result) };
}

function feedReadSummary(safePayload) {
  if (!safePayload || !safePayload.ok) return { ok: false, error: safePayload?.error || 'Request failed' };
  const data = Array.isArray(safePayload.result?.data) ? safePayload.result.data : [];
  return {
    ok: true,
    count: data.length,
    sample: data.slice(0, 3).map(item => ({
      id: item.id || null,
      created_time: item.created_time || null,
      hasMessage: Boolean(item.message)
    })),
    hasPaging: Boolean(safePayload.result?.paging)
  };
}

function accountsSummary(safePayload) {
  if (!safePayload || !safePayload.ok) return { ok: false, error: safePayload?.error || 'Request failed' };
  const data = Array.isArray(safePayload.result?.data) ? safePayload.result.data : [];
  return { ok: true, count: data.length, data: data.map(publicPageSummary) };
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
    deployed: 'meta-linking-and-prep-cleanup-v25',
    serverlessFunctions: 1,
    scopes: getScopes(),
    appIdLast4: appId ? appId.slice(-4) : null,
    graphVersion: process.env.META_GRAPH_VERSION || 'v20.0',
    hasMetaAppId: Boolean(process.env.META_APP_ID),
    hasMetaAppSecret: Boolean(process.env.META_APP_SECRET),
    hasMetaRedirectUri: Boolean(process.env.META_REDIRECT_URI),
    redirectUri: process.env.META_REDIRECT_URI || null,
    defaultPageId: getDefaultPageId() || null,
    hasPageAccessToken: Boolean(process.env.META_PAGE_ACCESS_TOKEN || process.env.META_SYSTEM_PAGE_TOKEN),
    tikTok: {
      hasClientKey: Boolean(process.env.TIKTOK_CLIENT_KEY),
      hasClientSecret: Boolean(process.env.TIKTOK_CLIENT_SECRET),
      hasRedirectUri: Boolean(process.env.TIKTOK_REDIRECT_URI),
      redirectUri: process.env.TIKTOK_REDIRECT_URI || null,
      scopes: getTikTokScopes()
    }
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
  const fields = 'id,name,category,link,fan_count,instagram_business_account{id,username,name}';
  const me = await safe(() => graphGet('/me', { fields: 'id,name' }, token));
  const permissions = await safe(() => graphGet('/me/permissions', {}, token));
  const directAccounts = await safe(() => graphGet('/me/accounts', { fields, limit: 100 }, token));
  const nestedAccounts = await safe(() => graphGet('/me', { fields: `accounts.limit(100){${fields}}` }, token));
  const businesses = await safe(() => graphGet('/me/businesses', { fields: 'id,name' }, token));
  return json(res, 200, {
    ok: true,
    connected: true,
    deployed: 'meta-linking-and-prep-cleanup-v25',
    note: 'Debug output is redacted and summarized. Tokens, paging URLs, and secrets are never returned by this endpoint.',
    me: safeResultSummary(me),
    permissions: safeResultSummary(permissions, result => ({ data: result?.data || [] })),
    directAccounts: accountsSummary(directAccounts),
    nestedAccounts: safeResultSummary(nestedAccounts, result => ({
      accounts: { data: (result?.accounts?.data || []).map(publicPageSummary), count: (result?.accounts?.data || []).length }
    })),
    businesses: safeResultSummary(businesses, result => ({ data: result?.data || [] }))
  });
}
async function handlePageDirectDebug(req, res) {
  const token = getUserToken(req);
  if (!token) return json(res, 401, { ok: false, connected: false, error: 'No Meta token cookie found.' });
  const pageId = (req.query && req.query.pageId) || getDefaultPageId();
  if (!pageId) return json(res, 400, { ok: false, connected: true, error: 'Missing META_DEFAULT_PAGE_ID environment variable.', expected: 'META_DEFAULT_PAGE_ID=616836628446846' });
  const fields = 'id,name,category,link,fan_count,instagram_business_account{id,username,name}';
  const me = await safe(() => graphGet('/me', { fields: 'id,name' }, token));
  const permissions = await safe(() => graphGet('/me/permissions', {}, token));
  const page = await safe(() => graphGet(`/${pageId}`, { fields }, token));
  const configuredToken = process.env.META_PAGE_ACCESS_TOKEN || process.env.META_SYSTEM_PAGE_TOKEN || '';
  const configuredPage = configuredToken
    ? await safe(() => graphGet(`/${pageId}`, { fields: `${fields},access_token` }, configuredToken))
    : { ok: false, error: 'No META_PAGE_ACCESS_TOKEN configured' };
  const derivedPageAccessToken = configuredPage.ok && configuredPage.result && configuredPage.result.access_token
    ? configuredPage.result.access_token
    : configuredToken;
  const configuredFeedRead = derivedPageAccessToken
    ? await safe(() => graphGet(`/${pageId}/feed`, { limit: 1, fields: 'id,message,created_time' }, derivedPageAccessToken))
    : { ok: false, error: 'No derived Page access token available' };

  return json(res, 200, {
    ok: true,
    connected: true,
    deployed: 'meta-linking-and-prep-cleanup-v25',
    note: 'Debug output is redacted and summarized. Tokens, paging URLs, and secrets are never returned by this endpoint.',
    pageId,
    me: safeResultSummary(me),
    permissions: safeResultSummary(permissions, result => ({ data: result?.data || [] })),
    page: safeResultSummary(page, publicPageSummary),
    configuredPage: safeResultSummary(configuredPage, publicPageSummary),
    hasConfiguredPageAccessToken: Boolean(configuredToken),
    hasDerivedPageAccessToken: Boolean(configuredPage.ok && configuredPage.result && configuredPage.result.access_token),
    configuredFeedRead: feedReadSummary(configuredFeedRead)
  });
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


async function handleTikTokLogin(req, res) {
  const clientKey = getRequiredEnv('TIKTOK_CLIENT_KEY').trim().replace(/^['\"]|['\"]$/g, '');
  const redirectUri = getRequiredEnv('TIKTOK_REDIRECT_URI').trim().replace(/^['\"]|['\"]$/g, '');
  const state = crypto.randomBytes(18).toString('hex');
  const scopes = getTikTokScopes();
  res.setHeader('Set-Cookie', setCookie(TIKTOK_STATE_COOKIE, state, 600));
  const url = new URL(TIKTOK_AUTH_URL);
  url.searchParams.set('client_key', clientKey);
  url.searchParams.set('scope', scopes.join(','));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  return res.redirect(302, url.toString());
}

async function handleTikTokCallback(req, res) {
  const { code, state, error, error_description } = req.query || {};
  if (error) throw new Error(error_description || error);
  if (!code) throw new Error('Missing TikTok OAuth code.');
  const cookies = parseCookies(req);
  if (!state || !cookies[TIKTOK_STATE_COOKIE] || String(state) !== String(cookies[TIKTOK_STATE_COOKIE])) {
    throw new Error('Invalid TikTok OAuth state. Please try connecting TikTok again.');
  }
  const body = new URLSearchParams();
  body.set('client_key', getRequiredEnv('TIKTOK_CLIENT_KEY'));
  body.set('client_secret', getRequiredEnv('TIKTOK_CLIENT_SECRET'));
  body.set('code', String(code));
  body.set('grant_type', 'authorization_code');
  body.set('redirect_uri', getRequiredEnv('TIKTOK_REDIRECT_URI'));
  const tokenPayload = await tikTokJson(TIKTOK_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const cleanPayload = {
    access_token: tokenPayload.access_token,
    refresh_token: tokenPayload.refresh_token || '',
    expires_in: tokenPayload.expires_in || null,
    refresh_expires_in: tokenPayload.refresh_expires_in || null,
    open_id: tokenPayload.open_id || '',
    scope: tokenPayload.scope || getTikTokScopes().join(','),
    connected_at: new Date().toISOString()
  };
  res.setHeader('Set-Cookie', [clearCookie(TIKTOK_STATE_COOKIE), setTikTokTokenCookie(cleanPayload)]);
  return res.redirect(302, TIKTOK_SUCCESS_REDIRECT + (TIKTOK_SUCCESS_REDIRECT.includes('?') ? '&' : '?') + 'tiktok=connected');
}

async function handleTikTokStatus(req, res) {
  const tokenPayload = getTikTokToken(req);
  if (!tokenPayload || !tokenPayload.access_token) {
    return json(res, 200, {
      ok: true,
      connected: false,
      hasTikTokClientKey: Boolean(process.env.TIKTOK_CLIENT_KEY),
      hasTikTokRedirectUri: Boolean(process.env.TIKTOK_REDIRECT_URI),
      scopes: getTikTokScopes()
    });
  }
  const user = await safe(() => getTikTokUserInfo(tokenPayload.access_token));
  return json(res, 200, {
    ok: true,
    connected: true,
    scopes: String(tokenPayload.scope || '').split(',').filter(Boolean),
    user: user.ok ? user.result : null,
    userInfoOk: Boolean(user.ok),
    userInfoError: user.ok ? null : user.error,
    connectedAt: tokenPayload.connected_at || null,
    token: { present: true, redacted: true }
  });
}

async function handleTikTokLogout(req, res) {
  res.setHeader('Set-Cookie', clearCookie(TIKTOK_TOKEN_COOKIE));
  return json(res, 200, { ok: true, connected: false });
}

export default async function handler(req, res) {
  const path = getPath(req);
  try {
    if (path === 'login') return await handleLogin(req, res);
    if (path === 'callback') {
      try { return await handleCallback(req, res); }
      catch (error) {
        const target = SUCCESS_REDIRECT + (SUCCESS_REDIRECT.includes('?') ? '&' : '?') + 'meta_error=' + encodeURIComponent(error.message);
        return res.redirect(302, target);
      }
    }
    if (path === 'logout') { res.setHeader('Set-Cookie', clearCookie(TOKEN_COOKIE)); return json(res, 200, { ok: true, connected: false }); }
    if (path === 'pages') return await handlePages(req, res);
    if (path === 'debug') return await handleDebug(req, res);
    if (path === 'token-debug') return await handleTokenDebug(req, res);
    if (path === 'pages-debug') return await handlePagesDebug(req, res);
    if (path === 'page-direct-debug') return await handlePageDirectDebug(req, res);
    if (path === 'publish/facebook') return await handleFacebookPublish(req, res);
    if (path === 'zoho-upload') return await handleZohoUpload(req, res);
    if (path === 'tiktok/login-debug') return await handleTikTokLoginDebug(req, res);
    if (path === 'tiktok/login') return await handleTikTokLogin(req, res);
    if (path === 'tiktok/callback') {
      try { return await handleTikTokCallback(req, res); }
      catch (error) {
        const target = TIKTOK_SUCCESS_REDIRECT + (TIKTOK_SUCCESS_REDIRECT.includes('?') ? '&' : '?') + 'tiktok_error=' + encodeURIComponent(error.message);
        return res.redirect(302, target);
      }
    }
    if (path === 'tiktok/status') return await handleTikTokStatus(req, res);
    if (path === 'tiktok/logout') return await handleTikTokLogout(req, res);
    return json(res, 404, { ok: false, error: 'Unknown API route', path, deployed: 'meta-linking-and-prep-cleanup-v25' });
  } catch (error) {
    return json(res, 500, { ok: false, connected: false, error: error.message, path });
  }
}
