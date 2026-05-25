import crypto from 'crypto';

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v20.0';
export const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;
export const SUCCESS_REDIRECT = process.env.META_SUCCESS_REDIRECT || 'https://mzj.vercel.app/#social-publisher';
export const TOKEN_COOKIE = 'mzj_meta_token';
export const STATE_COOKIE = 'mzj_meta_state';

export function json(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(payload));
}

export function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function getDefaultPageId() {
  return process.env.META_DEFAULT_PAGE_ID || process.env.META_PAGE_ID || '';
}

export function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(header.split(';').map(part => part.trim()).filter(Boolean).map(part => {
    const index = part.indexOf('=');
    if (index === -1) return [part, ''];
    return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
  }));
}

export function clearCookie(name) {
  return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function setCookie(name, value, maxAgeSeconds = 60 * 60 * 24 * 55) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

function secretKey() {
  const secret = process.env.SESSION_SECRET || process.env.META_APP_SECRET || 'mzj-development-secret';
  return crypto.createHash('sha256').update(String(secret)).digest();
}

export function encryptToken(token) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(token), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

export function decryptToken(value) {
  if (!value) return null;
  const data = Buffer.from(String(value), 'base64url');
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', secretKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

export function getUserToken(req) {
  const cookies = parseCookies(req);
  try { return decryptToken(cookies[TOKEN_COOKIE]); } catch (_) { return null; }
}

export function appSecretProof(token) {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !token) return null;
  return crypto.createHmac('sha256', secret).update(token).digest('hex');
}

export async function graphGet(path, params = {}, token) {
  const url = new URL(`${GRAPH_BASE}${path}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });
  if (token) {
    url.searchParams.set('access_token', token);
    const proof = appSecretProof(token);
    if (proof) url.searchParams.set('appsecret_proof', proof);
  }
  const response = await fetch(url.toString());
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) throw new Error(payload.error?.message || `Meta API error: ${response.status}`);
  return payload;
}

export async function graphPost(path, params = {}, token) {
  const body = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') body.set(key, String(value));
  });
  if (token) {
    body.set('access_token', token);
    const proof = appSecretProof(token);
    if (proof) body.set('appsecret_proof', proof);
  }
  const response = await fetch(`${GRAPH_BASE}${path}`, { method: 'POST', body });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) throw new Error(payload.error?.message || `Meta API error: ${response.status}`);
  return payload;
}

function normalizePages(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.accounts?.data)) return payload.accounts.data;
  return [];
}


export function getConfiguredPageToken() {
  return process.env.META_PAGE_ACCESS_TOKEN || process.env.META_SYSTEM_PAGE_TOKEN || '';
}

export async function getConfiguredPage() {
  const pageId = getDefaultPageId();
  const pageToken = getConfiguredPageToken();
  if (!pageId || !pageToken) return null;
  const fields = 'id,name,category,link,fan_count,instagram_business_account{id,username,name}';
  const page = await graphGet(`/${pageId}`, { fields }, pageToken);
  return { ...page, access_token: pageToken, _source: 'META_DEFAULT_PAGE_ID + META_PAGE_ACCESS_TOKEN' };
}

export async function getDirectPage(userToken, pageId = getDefaultPageId()) {
  if (!pageId) return null;
  const fields = 'id,name,category,link,fan_count,access_token,instagram_business_account{id,username,name}';
  const page = await graphGet(`/${pageId}`, { fields }, userToken);
  // If Meta does not expose a page access token on direct lookup, keep a user-token fallback
  // for diagnostics and for testing page edges. Publishing may still require page.access_token.
  return { ...page, _source: 'META_DEFAULT_PAGE_ID', _userTokenFallback: !page.access_token };
}

export async function getPages(userToken) {
  const fields = 'id,name,access_token,category,link,fan_count,instagram_business_account{id,username,name}';
  const direct = await graphGet('/me/accounts', { fields, limit: 100 }, userToken);
  let pages = normalizePages(direct);
  if (pages.length) return pages.map(page => ({ ...page, _source: '/me/accounts' }));

  const nested = await graphGet('/me', { fields: `accounts.limit(100){${fields}}` }, userToken);
  pages = normalizePages(nested);
  if (pages.length) return pages.map(page => ({ ...page, _source: 'me.accounts' }));

  const configuredPage = await getConfiguredPage().catch(() => null);
  if (configuredPage) return [configuredPage];

  const envPage = await getDirectPage(userToken).catch(() => null);
  if (envPage) return [envPage];

  return [];
}

export async function findPage(userToken, pageId) {
  const selectedPageId = pageId || getDefaultPageId();
  const configuredPage = await getConfiguredPage().catch(() => null);
  if (configuredPage && (!selectedPageId || String(configuredPage.id) === String(selectedPageId) || String(selectedPageId) === String(getDefaultPageId()))) return configuredPage;

  if (selectedPageId) {
    try {
      return await getDirectPage(userToken, selectedPageId);
    } catch (_) {
      // fallback to account list below
    }
  }
  const pages = await getPages(userToken);
  const page = pages.find(item => String(item.id) === String(selectedPageId)) || pages[0];
  if (!page) throw new Error('No Facebook Pages found for this account. Make sure your account manages a Page and granted pages permissions.');
  return page;
}
