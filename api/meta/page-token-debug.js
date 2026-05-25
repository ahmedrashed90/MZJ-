import { getConfiguredPage, getDefaultPageId, getConfiguredPageToken, json } from '../../lib/meta-utils.js';

export default async function handler(req, res) {
  try {
    const pageId = getDefaultPageId();
    const hasPageAccessToken = Boolean(getConfiguredPageToken());
    if (!pageId || !hasPageAccessToken) return json(res, 400, {
      ok: false,
      deployed: 'meta-direct-page-safe-fields-v6',
      pageId: pageId || null,
      hasPageAccessToken,
      error: 'Missing META_DEFAULT_PAGE_ID or META_PAGE_ACCESS_TOKEN.'
    });
    const page = await getConfiguredPage();
    return json(res, 200, {
      ok: true,
      deployed: 'meta-direct-page-safe-fields-v6',
      page: { id: page.id, name: page.name, category: page.category, link: page.link, instagram: page.instagram_business_account || null },
      canUseForPublishing: true
    });
  } catch (error) {
    return json(res, 500, { ok: false, deployed: 'meta-direct-page-safe-fields-v6', error: error.message });
  }
}
