import { getPages, getUserToken, graphGet, json } from '../_meta-utils.js';

export default async function handler(req, res) {
  try {
    const token = getUserToken(req);
    if (!token) return json(res, 401, { ok: false, connected: false, error: 'Meta غير متصل. اضغط ربط / إعادة ربط Meta.' });

    try {
      const pages = await getPages(token);
      return json(res, 200, { ok: true, connected: true, pages: pages.map(page => ({
        id: page.id,
        name: page.name,
        category: page.category,
        instagram: page.instagram_business_account || null
      })) });
    } catch (pagesError) {
      // Login-test mode only has public_profile, so page permissions are expected to fail.
      // Confirm the token is valid with /me and return a connected-but-limited status.
      try {
        const me = await graphGet('/me', { fields: 'id,name' }, token);
        return json(res, 200, {
          ok: true,
          connected: true,
          limited: true,
          user: me,
          pages: [],
          note: 'Meta Login متصل للتجربة فقط · صلاحيات الصفحات والنشر لم تتفعل بعد',
          pagesError: pagesError.message
        });
      } catch (meError) {
        return json(res, 401, { ok: false, connected: false, error: 'انتهت جلسة Meta أو لم يكتمل الربط. اضغط إعادة ربط Meta.' });
      }
    }
  } catch (error) {
    return json(res, 500, { ok: false, connected: false, error: error.message });
  }
}
