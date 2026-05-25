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

export async function graphGet(path, params = {}, token) {
  const url = new URL(`${GRAPH_BASE}${path}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });
  if (token) url.searchParams.set('access_token', token);
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
  if (token) body.set('access_token', token);
  const response = await fetch(`${GRAPH_BASE}${path}`, { method: 'POST', body });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) throw new Error(payload.error?.message || `Meta API error: ${response.status}`);
  return payload;
}

export async function getPages(userToken) {
  const result = await graphGet('/me/accounts', {
    fields: 'id,name,access_token,category,instagram_business_account{id,username,name}'
  }, userToken);
  return Array.isArray(result.data) ? result.data : [];
}

export async function findPage(userToken, pageId) {
  const pages = await getPages(userToken);
  const page = pages.find(item => String(item.id) === String(pageId)) || pages[0];
  if (!page) throw new Error('No Facebook Pages found for this account. Make sure your account manages a Page and granted pages permissions.');
  return page;
}
