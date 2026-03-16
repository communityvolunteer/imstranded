/**
 * /api/auth/x-complete.js
 * Receives X profile data from client (browser fetched it), handles user creation/login
 * 
 * Env vars: X_CLIENT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

const crypto = require('crypto');
const https = require('https');

function httpRequest(method, hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const h = { 'Content-Type': 'application/json', ...headers };
    if (bodyStr) h['Content-Length'] = Buffer.byteLength(bodyStr);
    const req = https.request({ hostname, path, method, headers: h, timeout: 10000 }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function derivePassword(xId, secret) {
  return crypto.createHmac('sha256', secret).update('x_pwd_' + xId).digest('hex');
}

module.exports = async function handler(req, res) {
  const allowedOrigins = ['https://help.imstranded.org', 'https://imstranded.org', 'https://www.imstranded.org'];
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const clientSecret = process.env.X_CLIENT_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!clientSecret || !supabaseUrl || !serviceKey) return res.status(500).json({ error: 'Missing env vars' });

  const { mode, xId, xUsername, xName, avatar } = req.body;
  if (!xId || !xUsername) return res.status(400).json({ error: 'Missing X profile data' });

  const host = supabaseUrl.replace('https://', '');
  const H = { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` };
  const xEmail = `x_${xId}@x.imstranded.org`;
  const xPassword = derivePassword(xId, clientSecret);

  try {
    let userId = null;
    let signInEmail = null;

    // Check if X handle already linked to an account
    const profileRes = await httpRequest('GET', host,
      `/rest/v1/profiles?select=id&x_handle=eq.${encodeURIComponent(xUsername)}&x_verified=eq.true&limit=1`, H, null);
    if (profileRes.status === 200 && Array.isArray(profileRes.body) && profileRes.body.length > 0) {
      userId = profileRes.body[0].id;
      const userRes = await httpRequest('GET', host, `/auth/v1/admin/users/${userId}`, H, null);
      if (userRes.status === 200 && userRes.body?.email) {
        signInEmail = userRes.body.email;
        await httpRequest('PUT', host, `/auth/v1/admin/users/${userId}`, H, { password: xPassword });
      }
    }

    // Check if x_xxx user exists — paginate through all users
    if (!userId) {
      let page = 1;
      const perPage = 50;
      while (!userId) {
        const listRes = await httpRequest('GET', host, `/auth/v1/admin/users?page=${page}&per_page=${perPage}`, H, null);
        if (listRes.status !== 200 || !listRes.body?.users || !listRes.body.users.length) break;
        const match = listRes.body.users.find(u => u.email === xEmail);
        if (match) {
          userId = match.id;
          signInEmail = xEmail;
          await httpRequest('PUT', host, `/auth/v1/admin/users/${userId}`, H, { password: xPassword });
        }
        if (listRes.body.users.length < perPage) break;
        page++;
      }
    }

    // Mode enforcement
    if (mode === 'login' && !userId) {
      return res.status(404).json({ error: 'No account found for this X account.', detail: 'Try signing up first, or log in with Google/Telegram if you linked X to another account.' });
    }
    if (mode === 'signup' && userId) {
      return res.status(409).json({ error: 'Account already exists.', detail: 'An account with this X already exists. Try logging in instead.' });
    }

    // Create new user (signup)
    if (!userId) {
      const createRes = await httpRequest('POST', host, '/auth/v1/admin/users', H, {
        email: xEmail,
        password: xPassword,
        email_confirm: true,
        user_metadata: { full_name: xName, avatar_url: avatar, provider: 'x', x_id: xId, x_username: xUsername }
      });
      if (createRes.status !== 200 && createRes.status !== 201) {
        return res.status(500).json({ error: 'Failed to create user', detail: createRes.body?.message || '' });
      }
      userId = createRes.body.id;
      signInEmail = xEmail;
    }

    // Ensure profile
    const checkProfile = await httpRequest('GET', host, `/rest/v1/profiles?select=id&id=eq.${userId}`, H, null);
    if (checkProfile.status === 200 && Array.isArray(checkProfile.body) && checkProfile.body.length > 0) {
      await httpRequest('PATCH', host, `/rest/v1/profiles?id=eq.${userId}`, {
        ...H, 'Prefer': 'return=minimal'
      }, { x_handle: xUsername, x_verified: true, avatar_url: avatar || undefined });
    } else {
      await httpRequest('POST', host, '/rest/v1/profiles', {
        ...H, 'Prefer': 'return=minimal'
      }, { id: userId, email: signInEmail, display_name: xName, avatar_url: avatar, x_handle: xUsername, x_verified: true });
    }

    return res.status(200).json({ email: signInEmail, password: xPassword });

  } catch (e) {
    console.error('X complete error:', e);
    return res.status(500).json({ error: 'Internal error', detail: e.message });
  }
};