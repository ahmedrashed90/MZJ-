import { TOKEN_COOKIE, clearCookie, json } from '../../lib/meta-utils.js';

export default async function handler(req, res) {
  res.setHeader('Set-Cookie', clearCookie(TOKEN_COOKIE));
  return json(res, 200, { ok: true, connected: false });
}
