/**
 * /api/auth/telegram.js
 * Vercel Serverless Function
 * 
 * Verifies Telegram Login Widget data, creates or finds a Supabase user,
 * and returns a session token.
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

  if (!verifyTelegramData(tgData, botToken)) {
    return res.status(401).json({ error: 'Telegram verification failed' });
  }

  const authAge = Math.floor(Date.now() / 1000) - (tgData.auth_date || 0);
  if (authAge > 300) {
    return res.status(401).json({ error: 'Telegram auth expired' });
  }

  const host = supabaseUrl.replace('https://', '');
  const tgEmail = `tg_${tgData.id}@telegram.imstranded.org`;
  const displayName = [tgData.first_name, tgData.last_name].filter(Boolean).join(' ') || tgData.username || 'Telegram User';
  const avatarUrl = tgData.photo_url || '';
  const tgUsername = tgData.username || '';

  const H = { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` };

  try {
    let userId = null;
    let existingEmail = null;

    // 1. Check if this TG user already linked to a Google account (via profiles table)
    const profileRes = await httpRequest('GET', host,
      `/rest/v1/profiles?select=id,email&tg_handle=eq.${encodeURIComponent(tgUsername)}&tg_verified=eq.true&limit=1`,
      H, null);
    
    if (profileRes.status === 200 && Array.isArray(profileRes.body) && profileRes.body.length > 0) {
      userId = profileRes.body[0].id;
      existingEmail = profileRes.body[0].email;
      console.log('Found existing user by TG handle:', userId);
    }

    // 2. If not found by handle, check if a TG-email user already exists
    if (!userId) {
      const listRes = await httpRequest('GET', host,
        `/auth/v1/admin/users?page=1&per_page=50`,
        H, null);
      
      if (listRes.status === 200 && listRes.body?.users) {
        const match = listRes.body.users.find(u => u.email === tgEmail);
        if (match) {
          userId = match.id;
          existingEmail = tgEmail;
          console.log('Found existing TG user by email:', userId);
        }
      }
    }

    // 3. If still no user, create one
    if (!userId) {
      console.log('Creating new user for TG:', tgEmail);
      const createRes = await httpRequest('POST', host, '/auth/v1/admin/users', H, {
        email: tgEmail,
        email_confirm: true,
        password: crypto.randomBytes(32).toString('hex'),
        user_metadata: {
          full_name: displayName,
          avatar_url: avatarUrl,
          provider: 'telegram',
          tg_id: String(tgData.id),
          tg_username: tgUsername,
        }
      });

      console.log('Create user response:', createRes.status, JSON.stringify(createRes.body).slice(0, 300));

      if (createRes.status !== 200 && createRes.status !== 201) {
        return res.status(500).json({ error: 'Failed to create user', detail: createRes.body?.msg || createRes.body?.message || '' });
      }
      userId = createRes.body.id;
      existingEmail = tgEmail;
    }

    // 4. Generate a magic link for this user
    const email = existingEmail || tgEmail;
    const linkRes = await httpRequest('POST', host, '/auth/v1/admin/generate_link', H, {
      type: 'magiclink',
      email: email,
    });

    console.log('Generate link response:', linkRes.status, JSON.stringify(linkRes.body).slice(0, 500));

    if (linkRes.status !== 200) {
      return res.status(500).json({ error: 'Failed to generate session', detail: linkRes.body?.msg || linkRes.body?.message || '' });
    }

    // Try multiple locations for the token
    const props = linkRes.body?.properties || {};
    const actionLink = props.action_link || '';
    
    // Try hashed_token directly (newer Supabase versions)
    let tokenHash = props.hashed_token || null;
    
    // Try token_hash from URL
    if (!tokenHash) {
      const m1 = actionLink.match(/token_hash=([^&]+)/);
      if (m1) tokenHash = m1[1];
    }
    
    // Try token from URL
    if (!tokenHash) {
      const m2 = actionLink.match(/token=([^&]+)/);
      if (m2) tokenHash = m2[1];
    }

    if (!tokenHash) {
      console.error('No token in response. Props:', JSON.stringify(props).slice(0, 500));
      return res.status(500).json({ error: 'Failed to extract token', detail: 'action_link: ' + actionLink.slice(0, 100) });
    }

    // 5. Ensure profile exists with TG verification
    const checkProfile = await httpRequest('GET', host,
      `/rest/v1/profiles?select=id&id=eq.${userId}`,
      H, null);

    if (checkProfile.status === 200 && Array.isArray(checkProfile.body) && checkProfile.body.length > 0) {
      await httpRequest('PATCH', host, `/rest/v1/profiles?id=eq.${userId}`, {
        ...H, 'Prefer': 'return=minimal'
      }, {
        tg_handle: tgUsername,
        tg_verified: true,
      });
    } else {
      await httpRequest('POST', host, '/rest/v1/profiles', {
        ...H, 'Prefer': 'return=minimal'
      }, {
        id: userId,
        email: email,
        display_name: displayName,
        avatar_url: avatarUrl,
        tg_handle: tgUsername,
        tg_verified: true,
      });
    }

    return res.status(200).json({
      token_hash: tokenHash,
      email: email,
    });

  } catch (e) {
    console.error('Telegram auth error:', e);
    return res.status(500).json({ error: 'Internal error', detail: e.message });
  }
};