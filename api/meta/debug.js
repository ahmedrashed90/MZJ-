export default async function handler(req, res) {
  res.status(200).json({
    ok: true,
    deployed: 'meta-login-force-public-profile-v2',
    forcedScopes: ['public_profile'],
    hasMetaAppId: Boolean(process.env.META_APP_ID),
    hasMetaRedirectUri: Boolean(process.env.META_REDIRECT_URI),
    redirectUri: process.env.META_REDIRECT_URI || null
  });
}
