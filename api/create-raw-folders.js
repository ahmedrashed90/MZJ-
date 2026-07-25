export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const rawApiUrl = process.env.MZJ_RAW_API_URL || 'http://152.239.121.92:8080/api/create-raw-folders';
    const rawApiToken = process.env.MZJ_RAW_API_TOKEN || 'MZJ_RAW_SECRET_2026_CHANGE_ME';

    const response = await fetch(rawApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': rawApiToken,
      },
      body: JSON.stringify(req.body || {}),
    });

    let data;
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      data = { ok: false, message: text || 'Invalid response from raw server' };
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error?.message || 'Failed to connect to raw server',
    });
  }
}
