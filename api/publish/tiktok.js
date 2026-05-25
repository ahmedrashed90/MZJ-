import { json } from '../../lib/meta-utils.js';

export default async function handler(req, res) {
  return json(res, 501, {
    ok: false,
    platform: 'tiktok',
    error: 'TikTok publishing needs a separate TikTok Developer App, OAuth callback, and Content Posting API approval. This endpoint is reserved for phase 2.'
  });
}
