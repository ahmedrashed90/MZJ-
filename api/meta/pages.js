import { getPages, getUserToken, json } from '../_meta-utils.js';

export default async function handler(req, res) {
  try {
    const token = getUserToken(req);
    if (!token) return json(res, 401, { ok: false, connected: false, error: 'Facebook is not connected yet.' });
    const pages = await getPages(token);
    return json(res, 200, { ok: true, connected: true, pages: pages.map(page => ({
      id: page.id,
      name: page.name,
      category: page.category,
      instagram: page.instagram_business_account || null
    })) });
  } catch (error) {
    return json(res, 500, { ok: false, connected: false, error: error.message });
  }
}
