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
const YOUTUBE_TOKEN_COOKIE = 'mzj_youtube_token';
const YOUTUBE_STATE_COOKIE = 'mzj_youtube_state';
const YOUTUBE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const YOUTUBE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const YOUTUBE_CHANNELS_URL = 'https://www.googleapis.com/youtube/v3/channels';
const YOUTUBE_DEFAULT_SCOPES = ['https://www.googleapis.com/auth/youtube.upload','https://www.googleapis.com/auth/youtube.readonly'];

const FIRESTORE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'mzj-marketing';
const FIRESTORE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyCQYrkIcCkaNr5jJ6i0Mm_jZueMG5xxYfo';
const FIRESTORE_DB = process.env.FIRESTORE_DATABASE || '(default)';
const AUTO_PUBLISH_LIMIT = Number(process.env.AUTO_PUBLISH_LIMIT || 10);


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

function getYouTubeScopes() {
  const raw = process.env.YOUTUBE_SCOPES || YOUTUBE_DEFAULT_SCOPES.join(',');
  return raw.split(/[\s,]+/).map(item => item.trim()).filter(Boolean);
}

function getYouTubeRedirectUri(req) {
  const configured = String(process.env.YOUTUBE_REDIRECT_URI || '').trim();
  if (configured) return configured;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'mzj.vercel.app';
  return `${proto}://${host}/api/youtube/callback`;
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
    deployed: 'meta-structure-approve-button-restore-v54',
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

function getYouTubeToken(req) {
  const cookies = parseCookies(req);
  try {
    const value = decryptToken(cookies[YOUTUBE_TOKEN_COOKIE]);
    if (!value) return null;
    return JSON.parse(value);
  } catch (_) {
    return null;
  }
}

function setYouTubeTokenCookie(tokenPayload) {
  return setCookie(YOUTUBE_TOKEN_COOKIE, encryptToken(JSON.stringify(tokenPayload)), 60 * 60 * 24 * 180);
}

async function googleJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) {
    const message = payload.error_description || payload.error?.message || payload.error || payload.message || `Google API error: ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

async function getYouTubeChannelInfo(accessToken) {
  const url = new URL(YOUTUBE_CHANNELS_URL);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('mine', 'true');
  const payload = await googleJson(url.toString(), { headers: { Authorization: `Bearer ${accessToken}` } });
  const item = Array.isArray(payload.items) ? payload.items[0] : null;
  if (!item) return null;
  return {
    id: item.id || null,
    title: item.snippet?.title || null,
    description: item.snippet?.description || null,
    thumbnails: item.snippet?.thumbnails || null
  };
}

async function handleYouTubeLogin(req, res) {
  const clientId = String(process.env.YOUTUBE_CLIENT_ID || '').trim();
  if (!clientId) throw new Error('YOUTUBE_CLIENT_ID is missing.');
  const redirectUri = getYouTubeRedirectUri(req);
  const state = crypto.randomBytes(16).toString('hex');
  const authUrl = new URL(YOUTUBE_AUTH_URL);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', getYouTubeScopes().join(' '));
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('include_granted_scopes', 'true');
  authUrl.searchParams.set('state', state);
  res.setHeader('Set-Cookie', setCookie(YOUTUBE_STATE_COOKIE, state, 10 * 60));
  return res.redirect(302, authUrl.toString());
}

async function handleYouTubeCallback(req, res) {
  const code = String(req.query?.code || '').trim();
  const state = String(req.query?.state || '').trim();
  const cookies = parseCookies(req);
  if (!code) throw new Error('Missing YouTube authorization code.');
  if (!state || !cookies[YOUTUBE_STATE_COOKIE] || state !== cookies[YOUTUBE_STATE_COOKIE]) throw new Error('Invalid YouTube state.');
  const clientId = String(process.env.YOUTUBE_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.YOUTUBE_CLIENT_SECRET || '').trim();
  if (!clientId || !clientSecret) throw new Error('YouTube OAuth credentials are missing.');
  const body = new URLSearchParams();
  body.set('client_id', clientId);
  body.set('client_secret', clientSecret);
  body.set('code', code);
  body.set('grant_type', 'authorization_code');
  body.set('redirect_uri', getYouTubeRedirectUri(req));
  const tokenPayload = await googleJson(YOUTUBE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const connectedAt = new Date().toISOString();
  let channel = null;
  try { channel = await getYouTubeChannelInfo(tokenPayload.access_token); } catch (_) {}
  const cookiePayload = { ...tokenPayload, connected_at: connectedAt, channel };
  res.setHeader('Set-Cookie', [setYouTubeTokenCookie(cookiePayload), clearCookie(YOUTUBE_STATE_COOKIE)]);
  const target = SUCCESS_REDIRECT + (SUCCESS_REDIRECT.includes('?') ? '&' : '?') + 'youtube_connected=1';
  return res.redirect(302, target);
}

async function handleYouTubeStatus(req, res) {
  const tokenPayload = getYouTubeToken(req);
  if (!tokenPayload || !tokenPayload.access_token) {
    return json(res, 200, {
      ok: true,
      connected: false,
      hasClientId: Boolean(process.env.YOUTUBE_CLIENT_ID),
      hasRedirectUri: Boolean(process.env.YOUTUBE_REDIRECT_URI),
      scopes: getYouTubeScopes()
    });
  }
  let channel = tokenPayload.channel || null;
  let channelOk = Boolean(channel);
  let channelError = null;
  if (!channel) {
    const got = await safe(() => getYouTubeChannelInfo(tokenPayload.access_token));
    channelOk = got.ok;
    channel = got.ok ? got.result : null;
    channelError = got.ok ? null : got.error;
  }
  return json(res, 200, {
    ok: true,
    connected: true,
    scopes: String(tokenPayload.scope || '').split(/\s+/).filter(Boolean),
    channel,
    channelOk,
    channelError,
    connectedAt: tokenPayload.connected_at || null,
    token: { present: true, redacted: true }
  });
}

async function handleYouTubeLogout(req, res) {
  res.setHeader('Set-Cookie', clearCookie(YOUTUBE_TOKEN_COOKIE));
  return json(res, 200, { ok: true, connected: false });
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
    deployed: 'meta-structure-approve-button-restore-v54',
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
    },
    youtube: {
      hasClientId: Boolean(process.env.YOUTUBE_CLIENT_ID),
      hasClientSecret: Boolean(process.env.YOUTUBE_CLIENT_SECRET),
      hasRedirectUri: Boolean(process.env.YOUTUBE_REDIRECT_URI),
      redirectUri: process.env.YOUTUBE_REDIRECT_URI || null,
      scopes: getYouTubeScopes()
    },
    zoho: {
      hasClientId: Boolean(process.env.ZOHO_CLIENT_ID),
      hasClientSecret: Boolean(process.env.ZOHO_CLIENT_SECRET),
      hasRefreshToken: Boolean(process.env.ZOHO_REFRESH_TOKEN),
      hasWorkDriveFolderId: Boolean(process.env.ZOHO_WORKDRIVE_FOLDER_ID),
      accountsDomain: process.env.ZOHO_ACCOUNTS_DOMAIN || 'https://accounts.zoho.sa',
      apiDomain: process.env.ZOHO_API_DOMAIN || null
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
    deployed: 'meta-structure-approve-button-restore-v54',
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
    deployed: 'meta-structure-approve-button-restore-v54',
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


function firestoreBaseUrl() {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(FIRESTORE_PROJECT_ID)}/databases/${encodeURIComponent(FIRESTORE_DB)}/documents`;
}

function firestoreUrl(path) {
  const sep = path.includes('?') ? '&' : '?';
  return `${firestoreBaseUrl()}/${path}${sep}key=${encodeURIComponent(FIRESTORE_API_KEY)}`;
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === 'object') return { mapValue: { fields: toFirestoreFields(value) } };
  return { stringValue: String(value) };
}

function toFirestoreFields(obj = {}) {
  const fields = {};
  Object.entries(obj || {}).forEach(([key, value]) => {
    if (value !== undefined) fields[key] = toFirestoreValue(value);
  });
  return fields;
}

function fromFirestoreValue(value) {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  if ('mapValue' in value) return fromFirestoreFields(value.mapValue.fields || {});
  return null;
}

function fromFirestoreFields(fields = {}) {
  const obj = {};
  Object.entries(fields || {}).forEach(([key, value]) => { obj[key] = fromFirestoreValue(value); });
  return obj;
}

function firestoreDocId(name = '') {
  return String(name || '').split('/').pop();
}

async function firestoreList(collection) {
  const response = await fetch(firestoreUrl(`${collection}?pageSize=100`));
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.message || `Firestore list error: ${response.status}`);
  return (payload.documents || []).map(doc => ({ id: firestoreDocId(doc.name), name: doc.name, ...fromFirestoreFields(doc.fields || {}) }));
}

async function firestorePatch(collection, docId, data) {
  const clean = {};
  Object.entries(data || {}).forEach(([key, value]) => { if (value !== undefined) clean[key] = value; });
  const mask = Object.keys(clean).map(key => `updateMask.fieldPaths=${encodeURIComponent(key)}`).join('&');
  const path = `${collection}/${encodeURIComponent(docId)}${mask ? '?' + mask : ''}`;
  const response = await fetch(firestoreUrl(path), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFirestoreFields(clean) })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.message || `Firestore patch error: ${response.status}`);
  return payload;
}

async function firestoreCreate(collection, data, docId = '') {
  const qs = docId ? `?documentId=${encodeURIComponent(docId)}` : '';
  const response = await fetch(firestoreUrl(`${collection}${qs}`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFirestoreFields(data) })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.message || `Firestore create error: ${response.status}`);
  return payload;
}

function normalizePlatformApi(platform) {
  const text = String(platform || '').trim().toLowerCase();
  if (text.includes('facebook') || text.includes('فيس')) return 'facebook';
  if (text.includes('instagram') || text.includes('انست')) return 'instagram';
  if (text.includes('tiktok') || text.includes('تيك')) return 'tiktok';
  if (text.includes('youtube') || text.includes('you tube') || text.includes('يوتيوب')) return 'youtube';
  return text;
}

function parsePlatformListApi(value) {
  const arr = Array.isArray(value) ? value : String(value || '').split(/[,،+]/);
  return [...new Set(arr.map(normalizePlatformApi).filter(Boolean))];
}

function normalizePostTypeApi(value) {
  const text = String(value || '').trim().toLowerCase();
  if (text.includes('photo') || text.includes('image') || text.includes('بوست صور') || text.includes('صورة')) return 'photo_post';
  if (text.includes('story') || text.includes('ستوري')) return 'story';
  if (text.includes('hd') || text.includes('فيديو hd')) return 'hd_video';
  if (text.includes('reel') || text.includes('short') || text.includes('ريل')) return 'reel';
  return text;
}

function postTypeLabelApi(value) {
  const type = normalizePostTypeApi(value);
  return ({ photo_post: 'بوست صور', reel: 'ريل', story: 'ستوري', hd_video: 'فيديو HD' })[type] || type || '';
}

function taskDueForAutoPublish(task, now = new Date()) {
  const status = String(task.status || '').trim();
  if (!task.readyForPublish) return false;
  if (status.includes('تم النشر') || status.includes('منشور')) return false;
  if (task.publishedAt || task.autoPublishedAt || task.autoPublishStartedAt) return false;
  const date = String(task.publishDate || task.scheduleDate || task.taskSnapshot?.publishDate || '').trim();
  if (!date) return false;
  const time = String(task.publishTime || task.scheduleTime || task.taskSnapshot?.publishTime || '').trim();
  const dueText = time ? `${date}T${time.length === 5 ? time + ':00' : time}` : `${date}T00:00:00`;
  const due = new Date(dueText);
  if (Number.isNaN(due.getTime())) return false;
  if (!time) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    return dueDay.getTime() <= today.getTime();
  }
  return due.getTime() <= now.getTime();
}

function taskPayloadForPublishing(task) {
  const snapshot = task.taskSnapshot || {};
  const platforms = parsePlatformListApi(task.platforms || snapshot.platforms || '');
  return {
    taskId: task.taskId || task.id,
    title: task.title || snapshot.title || task.campaignName || snapshot.campaignName || 'تاسك تجهيز نشر',
    contentType: task.contentType || task.type || snapshot.contentType || snapshot.type || task.requiredFile || '',
    postType: normalizePostTypeApi(task.postType || snapshot.postType || ''),
    postTypeLabel: task.postTypeLabel || snapshot.postTypeLabel || postTypeLabelApi(task.postType || snapshot.postType || ''),
    requiredDimensions: task.requiredDimensions || snapshot.requiredDimensions || null,
    platforms,
    caption: String(task.caption || '').trim(),
    hashtags: String(task.hashtags || '').trim(),
    mediaUrl: task.finalFileUrl || task.fileUrl || task.finalFileRecord?.downloadURL || task.finalFileRecord?.fileUrl || '',
    finalFileUrl: task.finalFileUrl || task.fileUrl || '',
    fileName: task.finalFileName || task.fileName || task.finalFileRecord?.fileName || '',
    mimeType: task.mimeType || task.finalFileRecord?.mimeType || task.finalFileRecord?.type || ''
  };
}

async function savePublishResultsToLogs(task, publishResponse, mode = 'auto') {
  const publishedAt = publishResponse.publishedAt || new Date().toISOString();
  const results = Array.isArray(publishResponse.results) ? publishResponse.results : [];
  const writes = [];
  for (const platformResult of results) {
    const platform = platformResult.platform || 'platform';
    const docId = `log_${String(task.taskId || task.id || Date.now()).replace(/[^a-zA-Z0-9_-]/g, '-')}_${platform}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    writes.push(firestoreCreate('publish_logs', {
      id: docId,
      taskId: task.taskId || task.id || '',
      sourceType: 'publish-prep',
      title: task.title || task.taskSnapshot?.title || 'تاسك تجهيز نشر',
      caption: task.caption || '',
      hashtags: task.hashtags || '',
      platform,
      platforms: [platform],
      type: task.postType || task.taskSnapshot?.postType || task.contentType || task.taskSnapshot?.contentType || task.type || '',
      postType: normalizePostTypeApi(task.postType || task.taskSnapshot?.postType || ''),
      postTypeLabel: task.postTypeLabel || task.taskSnapshot?.postTypeLabel || postTypeLabelApi(task.postType || task.taskSnapshot?.postType || ''),
      requiredDimensions: task.requiredDimensions || task.taskSnapshot?.requiredDimensions || null,
      mode,
      status: platformResult.ok ? 'تم النشر' : (platformResult.skipped ? 'تم التخطي' : 'فشل النشر'),
      error: platformResult.error || '',
      resultId: platformResult.id || platformResult.postId || platformResult?.result?.id || platformResult?.publish?.id || '',
      publishedUrl: platformResult.url || platformResult.permalink_url || platformResult.permalinkUrl || '',
      createdAt: publishedAt,
      publishedAt
    }, docId).catch(error => ({ ok: false, error: error.message })));
  }
  await Promise.all(writes);
}

function getConfiguredPageToken() {
  return process.env.META_PAGE_ACCESS_TOKEN || process.env.META_SYSTEM_PAGE_TOKEN || '';
}

function configuredPageId() {
  return process.env.META_DEFAULT_PAGE_ID || process.env.DEFAULT_PAGE_ID || getDefaultPageId();
}

function isProbablyVideo(value = '', mimeType = '', contentType = '') {
  const text = String(`${value} ${mimeType} ${contentType}`).toLowerCase();
  return /video|reel|\.mp4|\.mov|\.m4v|\.webm/.test(text);
}

async function getConfiguredPublishingContext() {
  const pageId = configuredPageId();
  const token = getConfiguredPageToken();
  if (!pageId) throw new Error('META_DEFAULT_PAGE_ID is missing.');
  if (!token) throw new Error('META_PAGE_ACCESS_TOKEN is missing.');
  const page = await graphGet(`/${pageId}`, { fields: 'id,name,access_token,instagram_business_account{id,username,name}' }, token);
  const pageToken = page.access_token || token;
  const ig = page.instagram_business_account || null;
  return { pageId, page, pageToken, ig };
}

async function publishFacebookFromReady(ctx, body, message) {
  const mediaUrl = String(body.mediaUrl || body.finalFileUrl || '').trim();
  const contentType = String(body.contentType || body.type || '').trim();
  const mimeType = String(body.mimeType || body.fileType || '').trim();
  const postType = normalizePostTypeApi(body.postType || body.publishType || '');
  if (!mediaUrl) {
    const result = await graphPost(`/${ctx.page.id}/feed`, { message }, ctx.pageToken);
    return { ok: true, platform: 'facebook', type: postType || 'feed', postType, result };
  }
  if (isProbablyVideo(mediaUrl, mimeType, contentType)) {
    const result = await graphPost(`/${ctx.page.id}/videos`, { file_url: mediaUrl, description: message }, ctx.pageToken);
    return { ok: true, platform: 'facebook', type: postType || 'video', postType, result };
  }
  const result = await graphPost(`/${ctx.page.id}/photos`, { url: mediaUrl, caption: message, published: true }, ctx.pageToken);
  return { ok: true, platform: 'facebook', type: postType || 'photo', postType, result };
}

async function publishInstagramFromReady(ctx, body, message) {
  const igId = process.env.META_INSTAGRAM_ACCOUNT_ID || process.env.INSTAGRAM_ACCOUNT_ID || ctx.ig?.id || '';
  if (!igId) throw new Error('Instagram Business Account ID is missing.');
  const mediaUrl = String(body.mediaUrl || body.finalFileUrl || '').trim();
  if (!mediaUrl) throw new Error('Instagram requires a media URL.');
  const contentType = String(body.contentType || body.type || '').trim();
  const mimeType = String(body.mimeType || body.fileType || '').trim();
  const isVideo = isProbablyVideo(mediaUrl, mimeType, contentType);
  const postType = normalizePostTypeApi(body.postType || body.publishType || '');
  const createParams = { caption: message };
  if (postType === 'story') {
    createParams.media_type = 'STORIES';
    if (isVideo) createParams.video_url = mediaUrl;
    else createParams.image_url = mediaUrl;
  } else if (isVideo || postType === 'reel') {
    createParams.media_type = 'REELS';
    createParams.video_url = mediaUrl;
    createParams.share_to_feed = true;
  } else {
    createParams.image_url = mediaUrl;
  }
  const create = await graphPost(`/${igId}/media`, createParams, ctx.pageToken);
  const creationId = create.id || create.creation_id;
  if (!creationId) throw new Error('Instagram did not return a creation id.');
  const publish = await graphPost(`/${igId}/media_publish`, { creation_id: creationId }, ctx.pageToken);
  return { ok: true, platform: 'instagram', type: postType || (isVideo ? 'reel' : 'image'), postType, create, publish };
}

async function refreshYouTubeTokenIfNeeded(req) {
  const tokenPayload = getYouTubeToken(req);
  if (!tokenPayload || !tokenPayload.access_token) throw new Error('YouTube is not connected in this browser.');
  const expiresAt = tokenPayload.expires_at || (tokenPayload.connected_at && tokenPayload.expires_in ? Date.parse(tokenPayload.connected_at) + Number(tokenPayload.expires_in) * 1000 : 0);
  if (expiresAt && Date.now() < expiresAt - 60000) return tokenPayload;
  if (!tokenPayload.refresh_token) return tokenPayload;
  const clientId = String(process.env.YOUTUBE_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.YOUTUBE_CLIENT_SECRET || '').trim();
  if (!clientId || !clientSecret) return tokenPayload;
  const body = new URLSearchParams();
  body.set('client_id', clientId);
  body.set('client_secret', clientSecret);
  body.set('refresh_token', tokenPayload.refresh_token);
  body.set('grant_type', 'refresh_token');
  const refreshed = await googleJson(YOUTUBE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  return { ...tokenPayload, ...refreshed, refresh_token: tokenPayload.refresh_token, connected_at: new Date().toISOString() };
}


function normalizeYouTubePrivacyStatus(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'public' || raw === 'عام') return 'public';
  if (raw === 'private' || raw === 'خاص') return 'private';
  if (raw === 'unlisted' || raw === 'برابط فقط' || raw === 'link' || raw === 'listed') return 'unlisted';
  return 'unlisted';
}

function youtubeVideoTitle(body, message) {
  const title = String(body.title || body.fileName || '').trim() || String(message || 'MZJ Video').split('\n')[0].slice(0, 90) || 'MZJ Video';
  return title.slice(0, 100);
}

async function publishYouTubeFromReady(req, body, message) {
  const mediaUrl = String(body.mediaUrl || body.finalFileUrl || '').trim();
  if (!mediaUrl) throw new Error('YouTube requires a final video URL.');
  if (!isProbablyVideo(mediaUrl, body.mimeType || '', body.contentType || body.type || '')) throw new Error('YouTube publishing requires a video file.');
  const tokenPayload = await refreshYouTubeTokenIfNeeded(req);
  const mediaResponse = await fetch(mediaUrl);
  if (!mediaResponse.ok) throw new Error(`Could not download final video for YouTube: ${mediaResponse.status}`);
  const arrayBuffer = await mediaResponse.arrayBuffer();
  const contentType = body.mimeType || mediaResponse.headers.get('content-type') || 'video/mp4';
  const boundary = `mzj_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const metadata = {
    snippet: {
      title: youtubeVideoTitle(body, message),
      description: message || '',
      categoryId: process.env.YOUTUBE_CATEGORY_ID || '22'
    },
    status: {
      privacyStatus: normalizeYouTubePrivacyStatus(body.youtubePrivacyStatus || process.env.YOUTUBE_PRIVACY_STATUS || 'unlisted'),
      selfDeclaredMadeForKids: false
    }
  };
  const encoder = new TextEncoder();
  const head = encoder.encode(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`);
  const tail = encoder.encode(`\r\n--${boundary}--\r\n`);
  const bodyBytes = new Uint8Array(head.byteLength + arrayBuffer.byteLength + tail.byteLength);
  bodyBytes.set(head, 0);
  bodyBytes.set(new Uint8Array(arrayBuffer), head.byteLength);
  bodyBytes.set(tail, head.byteLength + arrayBuffer.byteLength);
  const url = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status';
  const result = await googleJson(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenPayload.access_token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
      'Content-Length': String(bodyBytes.byteLength)
    },
    body: bodyBytes
  });
  const postType = normalizePostTypeApi(body.postType || body.publishType || '');
  return { ok: true, platform: 'youtube', type: postType || 'video', postType, id: result.id, url: result.id ? `https://youtu.be/${result.id}` : '', result };
}

async function publishReadyPayload(body, req = null) {
  const platforms = parsePlatformListApi(body.platforms || '');
  const caption = String(body.caption || '').trim();
  const hashtags = String(body.hashtags || '').trim();
  const message = [caption, hashtags].filter(Boolean).join('\n\n').trim();
  if (!platforms.length) throw new Error('No platforms selected.');
  if (!message && !(body.mediaUrl || body.finalFileUrl)) throw new Error('Missing caption/hashtags and media URL.');
  const ctx = await getConfiguredPublishingContext();
  const results = [];
  for (const platform of platforms) {
    try {
      if (['facebook', 'fb', 'فيسبوك'].includes(platform)) {
        results.push(await publishFacebookFromReady(ctx, body, message));
      } else if (['instagram', 'ig', 'انستجرام', 'انستغرام'].includes(platform)) {
        results.push(await publishInstagramFromReady(ctx, body, message));
      } else if (['youtube', 'yt', 'يوتيوب'].includes(platform)) {
        if (!req) throw new Error('YouTube publish requires browser connection context.');
        results.push(await publishYouTubeFromReady(req, body, message));
      } else if (['tiktok', 'تيك توك'].includes(platform)) {
        results.push({ ok: false, platform: 'tiktok', type: normalizePostTypeApi(body.postType || ''), postType: normalizePostTypeApi(body.postType || ''), skipped: true, error: 'TikTok auto publish is not enabled yet. Current connection is Sandbox/Draft mode.' });
      } else {
        results.push({ ok: false, platform, skipped: true, error: 'Unsupported platform.' });
      }
    } catch (error) {
      results.push({ ok: false, platform, error: error.message || 'Publish failed' });
    }
  }
  const ok = results.some(item => item.ok);
  return { ok, deployed: 'meta-structure-approve-button-restore-v54', taskId: body.taskId || null, results, publishedAt: new Date().toISOString() };
}

async function handleReadyPublish(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });
  try {
    const body = await readBody(req);
    const result = await publishReadyPayload(body, req);
    return json(res, result.ok ? 200 : 502, result);
  } catch (error) {
    return json(res, 400, { ok: false, deployed: 'meta-structure-approve-button-restore-v54', error: error.message || 'Publish failed' });
  }
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

function getZohoAccountsDomain() {
  return (process.env.ZOHO_ACCOUNTS_DOMAIN || 'https://accounts.zoho.sa').replace(/\/$/, '');
}

function getZohoApiDomain() {
  if (process.env.ZOHO_API_DOMAIN) return process.env.ZOHO_API_DOMAIN.replace(/\/$/, '');
  const accounts = getZohoAccountsDomain();
  if (accounts.includes('zoho.sa')) return 'https://www.zohoapis.sa';
  if (accounts.includes('zoho.eu')) return 'https://www.zohoapis.eu';
  if (accounts.includes('zoho.in')) return 'https://www.zohoapis.in';
  if (accounts.includes('zoho.com.au')) return 'https://www.zohoapis.com.au';
  if (accounts.includes('zoho.jp')) return 'https://www.zohoapis.jp';
  return 'https://www.zohoapis.com';
}

function cleanBase64(input) {
  return String(input || '').replace(/^data:[^;]+;base64,/, '').trim();
}

async function getZohoAccessToken() {
  const clientId = getRequiredEnv('ZOHO_CLIENT_ID');
  const clientSecret = getRequiredEnv('ZOHO_CLIENT_SECRET');
  const refreshToken = getRequiredEnv('ZOHO_REFRESH_TOKEN');
  const url = new URL('/oauth/v2/token', getZohoAccountsDomain());
  const body = new URLSearchParams();
  body.set('refresh_token', refreshToken);
  body.set('client_id', clientId);
  body.set('client_secret', clientSecret);
  body.set('grant_type', 'refresh_token');
  const response = await fetch(url.toString(), { method: 'POST', body });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || `Zoho token error: ${response.status}`);
  }
  return payload.access_token;
}

function parseZohoUploadResult(payload) {
  const first = Array.isArray(payload?.data) ? payload.data[0] : payload?.data;
  const attrs = first?.attributes || payload?.attributes || {};
  const fileInfoRaw = attrs['File INFO'] || attrs.File_INFO || attrs.file_info || '';
  let fileInfo = {};
  try { fileInfo = fileInfoRaw ? JSON.parse(fileInfoRaw) : {}; } catch (_) {}
  const auditResource = fileInfo?.AUDIT_INFO?.resource || {};
  const resourceId = attrs.resource_id || first?.id || payload?.resource_id || payload?.id || fileInfo?.RESOURCE_ID || '';
  const fileName = attrs.FileName || attrs.filename || auditResource.name || payload?.fileName || payload?.name || '';
  return { resourceId, fileName, raw: payload };
}

async function uploadToZohoWorkDrive(payload) {
  const folderId = getRequiredEnv('ZOHO_WORKDRIVE_FOLDER_ID');
  const accessToken = await getZohoAccessToken();
  const fileName = String(payload.fileName || payload.name || 'file').trim();
  const base64 = cleanBase64(payload.base64 || payload.fileData);
  if (!fileName || !base64) throw new Error('Missing fileName or base64 payload for Zoho upload.');
  const buffer = Buffer.from(base64, 'base64');
  const blob = new Blob([buffer], { type: payload.mimeType || payload.fileType || 'application/octet-stream' });
  const form = new FormData();
  form.append('filename', fileName);
  form.append('override-name-exist', 'true');
  form.append('parent_id', folderId);
  form.append('content', blob, fileName);
  const uploadUrl = `${getZohoApiDomain()}/workdrive/api/v1/upload`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      Accept: 'application/vnd.api+json'
    },
    body: form
  });
  const text = await response.text();
  let result = {};
  try { result = text ? JSON.parse(text) : {}; } catch (_) { result = { raw: text }; }
  if (!response.ok || result.errors) {
    const error = Array.isArray(result.errors) ? (result.errors[0]?.title || result.errors[0]?.detail) : result.error;
    throw new Error(error || `Zoho WorkDrive upload failed: ${response.status}`);
  }
  const parsed = parseZohoUploadResult(result);
  return {
    ok: true,
    success: true,
    storageProvider: 'zoho',
    fileId: parsed.resourceId,
    resource_id: parsed.resourceId,
    id: parsed.resourceId,
    fileName: parsed.fileName || fileName,
    name: parsed.fileName || fileName,
    fileUrl: parsed.resourceId ? `https://workdrive.zoho.sa/file/${encodeURIComponent(parsed.resourceId)}` : '',
    uploadedAt: new Date().toISOString(),
    uploadKind: payload.uploadKind || 'review',
    kind: payload.kind || payload.uploadKind || 'review',
    isFinal: false,
    raw: result
  };
}

async function handleZohoUpload(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'GET') return res.status(200).json({
    ok: true,
    success: true,
    deployed: 'meta-structure-approve-button-restore-v54',
    message: 'MZJ Zoho WorkDrive upload proxy is running',
    hasClientId: Boolean(process.env.ZOHO_CLIENT_ID),
    hasClientSecret: Boolean(process.env.ZOHO_CLIENT_SECRET),
    hasRefreshToken: Boolean(process.env.ZOHO_REFRESH_TOKEN),
    hasFolderId: Boolean(process.env.ZOHO_WORKDRIVE_FOLDER_ID),
    accountsDomain: getZohoAccountsDomain(),
    apiDomain: getZohoApiDomain()
  });
  if (req.method !== 'POST') return res.status(405).json({ ok: false, success: false, error: 'Method not allowed' });
  try {
    const payload = await readBody(req);
    if (!payload || !payload.fileName || !(payload.base64 || payload.fileData)) {
      return res.status(400).json({ ok: false, success: false, error: 'Missing file payload. Send JSON with fileName and base64/fileData.' });
    }
    const response = await uploadToZohoWorkDrive(payload);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(502).json({ ok: false, success: false, error: error.message || 'Zoho upload failed' });
  }
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


async function handleAutoPublish(req, res) {
  const secret = process.env.AUTO_PUBLISH_SECRET || '';
  if (secret) {
    const auth = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const querySecret = String(req.query?.secret || '');
    if (auth !== secret && querySecret !== secret) return json(res, 401, { ok: false, error: 'Unauthorized auto publish request.' });
  }
  const now = new Date();
  const all = await firestoreList('publish_prep_tasks');
  const due = all.filter(task => taskDueForAutoPublish(task, now)).slice(0, AUTO_PUBLISH_LIMIT);
  const processed = [];
  for (const task of due) {
    const docId = task.id;
    const startedAt = new Date().toISOString();
    try {
      await firestorePatch('publish_prep_tasks', docId, {
        autoPublishStartedAt: startedAt,
        status: 'جاري النشر التلقائي'
      });
      const payload = taskPayloadForPublishing(task);
      const result = await publishReadyPayload(payload);
      await savePublishResultsToLogs(task, result, 'auto');
      await firestorePatch('publish_prep_tasks', docId, {
        autoPublishedAt: result.publishedAt,
        publishedAt: result.publishedAt,
        publishResult: result,
        status: result.ok ? 'تم النشر' : 'فشل النشر'
      });
      processed.push({ taskId: task.taskId || docId, ok: result.ok, results: result.results });
    } catch (error) {
      const failedAt = new Date().toISOString();
      await firestorePatch('publish_prep_tasks', docId, {
        autoPublishFailedAt: failedAt,
        status: 'فشل النشر',
        autoPublishError: error.message || String(error)
      }).catch(() => null);
      await firestoreCreate('publish_logs', {
        id: `auto_error_${docId}_${Date.now()}`,
        taskId: task.taskId || docId,
        sourceType: 'publish-prep',
        title: task.title || task.taskSnapshot?.title || 'تاسك تجهيز نشر',
        platform: 'auto',
        platforms: ['auto'],
        mode: 'auto',
        status: 'فشل النشر',
        error: error.message || String(error),
        createdAt: failedAt,
        publishedAt: failedAt
      }).catch(() => null);
      processed.push({ taskId: task.taskId || docId, ok: false, error: error.message || String(error) });
    }
  }
  return json(res, 200, { ok: true, deployed: 'meta-structure-approve-button-restore-v54', checked: all.length, due: due.length, processed, ranAt: now.toISOString() });
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
    if (path === 'publish/ready') return await handleReadyPublish(req, res);
    if (path === 'auto-publish') return await handleAutoPublish(req, res);
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
    if (path === 'youtube/login') return await handleYouTubeLogin(req, res);
    if (path === 'youtube/callback') {
      try { return await handleYouTubeCallback(req, res); }
      catch (error) {
        const target = SUCCESS_REDIRECT + (SUCCESS_REDIRECT.includes('?') ? '&' : '?') + 'youtube_error=' + encodeURIComponent(error.message);
        return res.redirect(302, target);
      }
    }
    if (path === 'youtube/status') return await handleYouTubeStatus(req, res);
    if (path === 'youtube/logout') return await handleYouTubeLogout(req, res);
    return json(res, 404, { ok: false, error: 'Unknown API route', path, deployed: 'meta-structure-approve-button-restore-v54' });
  } catch (error) {
    return json(res, 500, { ok: false, connected: false, error: error.message, path });
  }
}
