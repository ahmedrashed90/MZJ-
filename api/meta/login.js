import crypto from 'crypto';
import { getRequiredEnv, setCookie, STATE_COOKIE } from '../_meta-utils.js';

function resolveScopes() {
  // Safe test mode: Meta currently rejects Page/Instagram publishing scopes until
  // they are added/approved for the app. Keep login working with public_profile.
  // Later, after Meta permissions are available, set META_SCOPES in Vercel to:
  // public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata,instagram_basic,instagram_content_publish
  const raw = process.env.META_SCOPES || 'public_profile';
  return raw
    .split(',')
    .map(scope => scope.trim())
    .filter(Boolean);
}

export default async function handler(req, res) {
  try {
    const appId = getRequiredEnv('META_APP_ID');
    const redirectUri = getRequiredEnv('META_REDIRECT_URI');
    const scopes = resolveScopes();
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
