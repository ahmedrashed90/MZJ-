export default async function handler(req, res) {
  const appId = process.env.META_APP_ID || '';
  const scopes = (process.env.META_SCOPES || 'public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

  res.status(200).json({
    ok: true,
    deployed: 'meta-vercel-hobby-safe-v8',
    scopes,
    appIdLast4: appId ? appId.slice(-4) : null,
    graphVersion: process.env.META_GRAPH_VERSION || 'v20.0',
    hasMetaAppId: Boolean(process.env.META_APP_ID),
    hasMetaAppSecret: Boolean(process.env.META_APP_SECRET),
    hasMetaRedirectUri: Boolean(process.env.META_REDIRECT_URI),
    redirectUri: process.env.META_REDIRECT_URI || null
  });
}
