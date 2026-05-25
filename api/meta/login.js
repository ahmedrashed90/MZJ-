import crypto from 'crypto';
import { getRequiredEnv, setCookie, STATE_COOKIE } from '../_meta-utils.js';

export default async function handler(req, res) {
  try {
    const appId = getRequiredEnv('META_APP_ID');
    const redirectUri = getRequiredEnv('META_REDIRECT_URI');
    const scopes = [
      'public_profile',
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_manage_metadata',
      'instagram_basic',
      'instagram_content_publish'
    ];
    const state = crypto.randomBytes(18).toString('hex');
    res.setHeader('Set-Cookie', setCookie(STATE_COOKIE, state, 600));
    const url = new URL('https://www.facebook.com/dialog/oauth');
    url.searchParams.set('client_id', appId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('state', state);
    url.searchParams.set('scope', scopes.join(','));
    url.searchParams.set('response_type', 'code');
    return res.redirect(302, url.toString());
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
