import { GRAPH_BASE, SUCCESS_REDIRECT, TOKEN_COOKIE, STATE_COOKIE, clearCookie, encryptToken, getRequiredEnv, parseCookies, setCookie } from '../../lib/meta-utils.js';

async function fetchJson(url) {
  const response = await fetch(url.toString());
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) throw new Error(payload.error?.message || `Meta OAuth error: ${response.status}`);
  return payload;
}

export default async function handler(req, res) {
  try {
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

    res.setHeader('Set-Cookie', [
      clearCookie(STATE_COOKIE),
      setCookie(TOKEN_COOKIE, encryptToken(longToken.access_token))
    ]);
    return res.redirect(302, SUCCESS_REDIRECT + (SUCCESS_REDIRECT.includes('?') ? '&' : '?') + 'meta=connected');
  } catch (error) {
    const target = SUCCESS_REDIRECT + (SUCCESS_REDIRECT.includes('?') ? '&' : '?') + 'meta_error=' + encodeURIComponent(error.message);
    return res.redirect(302, target);
  }
}
