/**
 * /api/auth/telegram.js
 * 
 * Flow:
 * 1. If TG handle is already linked to a Google account → sign into that account
 * 2. If a tg_xxx@telegram user already exists → sign into that
 * 3. Otherwise → create new TG user
 * 
 * Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, TELEGRAM_BOT_TOKEN
 */

const crypto = require('crypto');
const https = require('https');

function httpRequest(method, hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const opts = { hostname, path, method, headers: { 'Content-Type': 'application/json', ...headers }, timeout: 10000 };
    const req = https.request(opts, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function verifyTelegramData(data, botToken) {
  const secret = crypto.createHash('sha256').update(botToken).digest();
  const dataCheckString = Object.keys(data)
    .filter(k => k !== 'hash').sort()
    .map(k => `${k}=${data[k]}`).join('\n');
  return crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex') === data.hash;
}

function derivePassword(tgId, botToken) {
  return crypto.createHmac('sha256', botToken).update('tg_pwd_' + tgId).digest('hex');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!botToken || !supabaseUrl || !serviceKey) return res.status(500).json({ error: 'Missing env vars' });

  const tgData = req.body;
  if (!tgData || !tgData.hash || !tgData.id) return res.status(400).json({ error: 'Invalid data' });
  if (!verifyTelegramData(tgData, botToken)) return res.status(401).json({ error: 'Verification failed' });

  const authAge = Math.floor(Date.now() / 1000) - (tgData.auth_date || 0);
  if (authAge > 300) return res.status(401).json({ error: 'Auth expired' });

  const host = supabaseUrl.replace('https://', '');
  const tgEmail = `tg_${tgData.id}@telegram.imstranded.org`;
  const tgPassword = derivePassword(tgData.id, botToken);
  const displayName = [tgData.first_name, tgData.last_name].filter(Boolean).join(' ') || tgData.username || 'Telegram User';
  const avatarUrl = tgData.photo_url || '';
  const tgUsername = tgData.username || '';
  const mode = tgData.mode || 'login'; // 'login' or 'signup'
  const H = { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` };

  try {
    let userId = null;
    let signInEmail = null;

    // ── STEP 1: Check if TG handle is linked to an existing account ──
    if (tgUsername) {
      const profileRes = await httpRequest('GET', host,
        `/rest/v1/profiles?select=id,email&tg_handle=eq.${encodeURIComponent(tgUsername)}&tg_verified=eq.true&limit=1`, H, null);
      if (profileRes.status === 200 && Array.isArray(profileRes.body) && profileRes.body.length > 0) {
        userId = profileRes.body[0].id;
        const userRes = await httpRequest('GET', host, `/auth/v1/admin/users/${userId}`, H, null);
        if (userRes.status === 200 && userRes.body?.email) {
          signInEmail = userRes.body.email;
          await httpRequest('PUT', host, `/auth/v1/admin/users/${userId}`, H, { password: tgPassword });
        }
      }
    }

    // ── STEP 2: Check if a TG-specific user already exists ──
    if (!userId) {
      const listRes = await httpRequest('GET', host, `/auth/v1/admin/users?page=1&per_page=50`, H, null);
      if (listRes.status === 200 && listRes.body?.users) {
        const match = listRes.body.users.find(u => u.email === tgEmail);
        if (match) {
          userId = match.id;
          signInEmail = tgEmail;
          await httpRequest('PUT', host, `/auth/v1/admin/users/${userId}`, H, { password: tgPassword });
        }
      }
    }

    // ── MODE ENFORCEMENT ──
    if (mode === 'login' && !userId) {
      return res.status(404).json({ error: 'No account found for this Telegram. Try signing up first.' });
    }
    if (mode === 'signup' && userId) {
      return res.status(409).json({ error: 'An account with this Telegram already exists. Try logging in instead.' });
    }

    // ── STEP 3: Create new user (signup only) ──
    if (!userId) {
      console.log('Creating new TG user:', tgEmail);
      const createRes = await httpRequest('POST', host, '/auth/v1/admin/users', H, {
        email: tgEmail,
        password: tgPassword,
        email_confirm: true,
        user_metadata: {
          full_name: displayName,
          avatar_url: avatarUrl,
          provider: 'telegram',
          tg_id: String(tgData.id),
          tg_username: tgUsername,
        }
      });
      if (createRes.status !== 200 && createRes.status !== 201) {
        console.error('Create failed:', JSON.stringify(createRes.body).slice(0, 300));
        return res.status(500).json({ error: 'Failed to create user', detail: createRes.body?.msg || createRes.body?.message || '' });
      }
      userId = createRes.body.id;
      signInEmail = tgEmail;
    }

    // ── STEP 4: Ensure profile has TG verified ──
    const checkProfile = await httpRequest('GET', host, `/rest/v1/profiles?select=id&id=eq.${userId}`, H, null);
    if (checkProfile.status === 200 && Array.isArray(checkProfile.body) && checkProfile.body.length > 0) {
      await httpRequest('PATCH', host, `/rest/v1/profiles?id=eq.${userId}`,
        { ...H, 'Prefer': 'return=minimal' },
        { tg_handle: tgUsername, tg_verified: true });
    } else {
      await httpRequest('POST', host, '/rest/v1/profiles',
        { ...H, 'Prefer': 'return=minimal' },
        { id: userId, email: signInEmail, display_name: displayName, avatar_url: avatarUrl, tg_handle: tgUsername, tg_verified: true });
    }

    // ── STEP 5: Return credentials ──
    return res.status(200).json({ email: signInEmail, password: tgPassword });

  } catch (e) {
    console.error('TG auth error:', e);
    return res.status(500).json({ error: 'Internal error', detail: e.message });
  }
};