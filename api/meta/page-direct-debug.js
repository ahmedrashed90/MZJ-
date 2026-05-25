import { getDefaultPageId, getUserToken, graphGet, json } from '../_meta-utils.js';

async function safe(label, fn) {
  try { return { ok: true, result: await fn() }; }
  catch (error) { return { ok: false, error: error.message }; }
}

export default async function handler(req, res) {
  try {
    const token = getUserToken(req);
    if (!token) return json(res, 401, { ok: false, connected: false, error: 'No Meta token cookie found.' });

    const pageId = (req.query && req.query.pageId) || getDefaultPageId();
    if (!pageId) return json(res, 400, {
      ok: false,
      connected: true,
      error: 'Missing META_DEFAULT_PAGE_ID environment variable.',
      expected: 'META_DEFAULT_PAGE_ID=mzjcars'
    });

    const fields = 'id,name,category,access_token,fan_count,link,instagram_business_account{id,username,name}';
    const me = await safe('me', () => graphGet('/me', { fields: 'id,name' }, token));
    const permissions = await safe('permissions', () => graphGet('/me/permissions', {}, token));
    const page = await safe('page', () => graphGet(`/${pageId}`, { fields }, token));
    const pageFeedRead = await safe('pageFeedRead', () => graphGet(`/${pageId}/feed`, { limit: 1, fields: 'id,message,created_time' }, token));
    const pageRoles = await safe('pageRoles', () => graphGet(`/${pageId}/roles`, { limit: 20 }, token));

    return json(res, 200, {
      ok: true,
      connected: true,
      deployed: 'meta-direct-page-safe-fields-v6',
      pageId,
      note: 'If page.ok is true, the app can access the page directly. If page.result.access_token exists, posting can use it. If access_token is missing, publishing may still require Meta to expose a Page access token through /me/accounts.',
      me,
      permissions,
      page,
      pageFeedRead,
      pageRoles
    });
  } catch (error) {
    return json(res, 500, { ok: false, connected: false, error: error.message });
  }
}
