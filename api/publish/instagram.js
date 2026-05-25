import { findPage, getUserToken, graphPost, json } from '../../lib/meta-utils.js';

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });
  try {
    const token = getUserToken(req);
    if (!token) return json(res, 401, { ok: false, error: 'Facebook/Instagram is not connected yet.' });
    const body = await readBody(req);
    const page = await findPage(token, body.pageId);
    const ig = page.instagram_business_account;
    if (!ig || !ig.id) return json(res, 400, { ok: false, error: 'This Facebook Page has no linked Instagram Business/Creator account.' });
    if (!body.mediaUrl) return json(res, 400, { ok: false, error: 'Instagram publishing requires a public image URL.' });
    if (body.type && body.type !== 'post') return json(res, 400, { ok: false, error: 'This first integration supports Instagram image posts only. Reels/Stories need a separate upload flow.' });
    const caption = [body.caption, body.link].filter(Boolean).join('\n\n').trim();
    const container = await graphPost(`/${ig.id}/media`, { image_url: body.mediaUrl, caption }, page.access_token);
    const published = await graphPost(`/${ig.id}/media_publish`, { creation_id: container.id }, page.access_token);
    return json(res, 200, { ok: true, platform: 'instagram', instagram: ig, result: published });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message });
  }
}
