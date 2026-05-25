import crypto from 'crypto';
import { getRequiredEnv, setCookie, STATE_COOKIE } from '../_meta-utils.js';

// TEMP TEST MODE: force Facebook Login to use only public_profile.
// Do not read META_SCOPES from Vercel while the app is not approved for Page/Instagram scopes.
const FORCED_SCOPES = ['public_profile'];

export default async function handler(req, res) {
  try {
    const appId = getRequiredEnv('META_APP_ID');
    const redirectUri = getRequiredEnv('META_REDIRECT_URI');
    const state = crypto.randomBytes(18).toString('hex');
    res.setHeader('Set-Cookie', setCookie(STATE_COOKIE, state, 600));
    const url = new URL('https://www.facebook.com/dialog/oauth');
    url.searchParams.set('client_id', appId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('state', state);
    url.searchParams.set('scope', FORCED_SCOPES.join(','));
    url.searchParams.set('response_type', 'code');
    return res.redirect(302, url.toString());
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
