/**
 * /api/auth/x-profile.js
 * Proxies Twitter /2/users/me to solve CORS + retry 503s
 * Called by client with the access token
 */

const https = require('https');

function fetchTwitter(token, hostname) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: hostname,
      path: '/2/users/me?user.fields=profile_image_url,username,name',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'ImStranded/1.0' },
      timeout: 8000
    }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Missing token' });

  const hosts = ['api.twitter.com', 'api.x.com'];
  // Retry up to 3 times, alternating hosts
  for (let i = 0; i < 3; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 800));
    const host = hosts[i % 2];
    try {
      const r = await fetchTwitter(token, host);
      console.log(`Attempt ${i + 1} (${host}): ${r.status}`);
      if (r.status === 200) {
        const data = JSON.parse(r.body);
        return res.status(200).json(data);
      }
      if (r.status !== 503) {
        return res.status(r.status).json({ error: 'Twitter API error', status: r.status, body: r.body.slice(0, 200) });
      }
    } catch (e) {
      console.log(`Attempt ${i + 1} (${host}) error:`, e.message);
    }
  }

  return res.status(503).json({ error: 'Twitter API unavailable after 5 retries' });
};