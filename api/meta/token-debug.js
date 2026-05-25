import { getUserToken, graphGet, json } from '../_meta-utils.js';

export default async function handler(req, res) {
  try {
    const token = getUserToken(req);
    if (!token) return json(res, 401, { ok: false, connected: false, error: 'No Meta token cookie found.' });
    const me = await graphGet('/me', { fields: 'id,name' }, token);
    let permissions = null;
    try {
      const perms = await graphGet('/me/permissions', {}, token);
      permissions = perms.data || [];
    } catch (error) {
      permissions = { error: error.message };
    }
    return json(res, 200, { ok: true, connected: true, me, permissions });
  } catch (error) {
    return json(res, 500, { ok: false, connected: false, error: error.message });
  }
}
