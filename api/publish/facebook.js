import { findPage, getUserToken, graphPost, json } from '../_meta-utils.js';

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
    if (!token) return json(res, 401, { ok: false, error: 'Facebook is not connected yet.' });
    const body = await readBody(req);
    const message = [body.caption, body.link].filter(Boolean).join('\n\n').trim();
    if (!message && !body.mediaUrl) return json(res, 400, { ok: false, error: 'Write post text or add a media URL.' });
    const page = await findPage(token, body.pageId);
    const payload = body.mediaUrl
      ? await graphPost(`/${page.id}/photos`, { url: body.mediaUrl, caption: message, published: true }, page.access_token)
      : await graphPost(`/${page.id}/feed`, { message }, page.access_token);
    return json(res, 200, { ok: true, platform: 'facebook', page: { id: page.id, name: page.name }, result: payload });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message });
  }
}
