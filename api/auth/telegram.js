/**
 * /api/auth/telegram.js
 * Vercel Serverless Function
 * 
 * Receives Telegram Login Widget data, verifies it server-side,
 * creates or finds a Supabase user, and returns a session token.
 * 
 * Environment variables needed:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_KEY
 *   TELEGRAM_BOT_TOKEN
 */

const crypto = require('crypto');
const https = require('https');

function postJSON(hostname, path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = https.request({
      hostname, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...headers },
      timeout: 10000
    }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getJSON(hostname, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname, path, method: 'GET',
      headers: { 'Content-Type': 'application/json', ...headers },
      timeout: 10000
    }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function verifyTelegramData(data, botToken) {
  const secret = crypto.createHash('sha256').update(botToken).digest();
  const checkHash = data.hash;
  const dataCheckString = Object.keys(data)
    .filter(k => k !== 'hash')
    .sort()
    .map(k => `${k}=${data[k]}`)
    .join('\n');
  const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  return hmac === checkHash;
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!botToken || !supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Missing env vars' });
  }

  const tgData = req.body;
  if (!tgData || !tgData.hash || !tgData.id) {
    return res.status(400).json({ error: 'Invalid Telegram data' });
  }

  // Verify the data came from Telegram
  if (!verifyTelegramData(tgData, botToken)) {
    return res.status(401).json({ error: 'Telegram verification failed' });
  }

  // Check auth_date is recent (within 5 minutes)
  const authAge = Math.floor(Date.now() / 1000) - (tgData.auth_date || 0);
  if (authAge > 300) {
    return res.status(401).json({ error: 'Telegram auth expired' });
  }

  const hostname = supabaseUrl.replace('https://', '');
  const tgEmail = `tg_${tgData.id}@telegram.imstranded.org`;
  const displayName = [tgData.first_name, tgData.last_name].filter(Boolean).join(' ') || tgData.username || 'Telegram User';
  const avatarUrl = tgData.photo_url || '';
  const tgUsername = tgData.username || '';

  const authHeaders = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
  };

  try {
    // Check if user exists by looking up email
    const listRes = await getJSON(hostname,
      `/auth/v1/admin/users?page=1&per_page=1&filter=${encodeURIComponent(tgEmail)}`,
      authHeaders
    );

    let userId = null;

    if (listRes.status === 200 && listRes.body?.users?.length > 0) {
      userId = listRes.body.users[0].id;
    } else {
      // Create new user
      const createRes = await postJSON(hostname, '/auth/v1/admin/users', {
        email: tgEmail,
        email_confirm: true,
        user_metadata: {
          full_name: displayName,
          avatar_url: avatarUrl,
          provider: 'telegram',
          tg_id: tgData.id,
          tg_username: tgUsername,
        }
      }, authHeaders);

      if (createRes.status !== 200 && createRes.status !== 201) {
        console.error('Create user failed:', createRes.body);
        return res.status(500).json({ error: 'Failed to create user' });
      }
      userId = createRes.body.id;
    }

    // Generate a magic link token for this user
    const linkRes = await postJSON(hostname, '/auth/v1/admin/generate_link', {
      type: 'magiclink',
      email: tgEmail,
    }, authHeaders);

    if (linkRes.status !== 200) {
      console.error('Generate link failed:', linkRes.body);
      return res.status(500).json({ error: 'Failed to generate session' });
    }

    // Extract the token hash from the action link
    const actionLink = linkRes.body?.properties?.action_link || '';
    const tokenMatch = actionLink.match(/token_hash=([^&]+)/);
    const tokenHash = tokenMatch ? tokenMatch[1] : null;

    if (!tokenHash) {
      console.error('No token hash in link:', actionLink);
      return res.status(500).json({ error: 'Failed to extract token' });
    }

    // Ensure profile exists with TG verification
    const profileRes = await getJSON(hostname,
      `/rest/v1/profiles?select=id&id=eq.${userId}`,
      { ...authHeaders, 'Prefer': 'return=minimal' }
    );

    if (profileRes.status === 200 && Array.isArray(profileRes.body) && profileRes.body.length > 0) {
      // Update existing profile with TG info
      await postJSON(hostname, `/rest/v1/profiles?id=eq.${userId}`, {
        tg_handle: tgUsername,
        tg_verified: true,
        avatar_url: avatarUrl || undefined,
      }, { ...authHeaders, 'Prefer': 'return=minimal', 'X-HTTP-Method-Override': 'PATCH' });
    } else {
      // Create profile
      await postJSON(hostname, '/rest/v1/profiles', {
        id: userId,
        email: tgEmail,
        display_name: displayName,
        avatar_url: avatarUrl,
        tg_handle: tgUsername,
        tg_verified: true,
      }, { ...authHeaders, 'Prefer': 'return=minimal' });
    }

    return res.status(200).json({
      token_hash: tokenHash,
      email: tgEmail,
    });

  } catch (e) {
    console.error('Telegram auth error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
};