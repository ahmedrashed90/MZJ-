import { getUserToken, graphGet, json } from '../_meta-utils.js';

async function safe(name, fn) {
  try {
    return { ok: true, result: await fn() };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export default async function handler(req, res) {
  try {
    const token = getUserToken(req);
    if (!token) return json(res, 401, { ok: false, connected: false, error: 'No Meta token cookie found.' });

    const fields = 'id,name,access_token,category,tasks,perms,instagram_business_account{id,username,name}';
    const me = await safe('me', () => graphGet('/me', { fields: 'id,name' }, token));
    const permissions = await safe('permissions', () => graphGet('/me/permissions', {}, token));
    const directAccounts = await safe('directAccounts', () => graphGet('/me/accounts', { fields, limit: 100 }, token));
    const nestedAccounts = await safe('nestedAccounts', () => graphGet('/me', { fields: `accounts.limit(100){${fields}}` }, token));
    const businesses = await safe('businesses', () => graphGet('/me/businesses', { fields: 'id,name' }, token));

    return json(res, 200, {
      ok: true,
      connected: true,
      note: 'Diagnostics for Meta pages. If permissions are granted but accounts data is empty, the Facebook user has not exposed any manageable Pages to this app token.',
      me,
      permissions,
      directAccounts,
      nestedAccounts,
      businesses
    });
  } catch (error) {
    return json(res, 500, { ok: false, connected: false, error: error.message });
  }
}
