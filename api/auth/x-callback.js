/**
 * /api/auth/x-callback.js
 * Handles X/Twitter OAuth 2.0 callback
 * 
 * Env vars: X_CLIENT_ID, X_CLIENT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY, TELEGRAM_BOT_TOKEN
 */

const crypto = require('crypto');
const https = require('https');
const { URL } = require('url');

function httpRequest(method, hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const opts = { hostname, path, method, headers: { ...headers }, timeout: 10000 };
    if (!headers['Content-Type'] && body) opts.headers['Content-Type'] = 'application/json';
    const req = https.request(opts, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    if (body) {
      if (typeof body === 'string') req.write(body);
      else req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function parseCookies(cookieHeader) {
  const cookies = {};
  (cookieHeader || '').split(';').forEach(c => {
    const [k, ...v] = c.trim().split('=');
    if (k) cookies[k] = v.join('=');
  });
  return cookies;
}

function derivePassword(xId, secret) {
  return crypto.createHmac('sha256', secret).update('x_pwd_' + xId).digest('hex');
}

module.exports = async function handler(req, res) {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!clientId || !clientSecret || !supabaseUrl || !serviceKey) {
    return res.status(500).send('Missing env vars');
  }

  const { code, state, error: oauthError } = req.query;
  if (oauthError) return res.redirect('/?error=' + oauthError);
  if (!code || !state) return res.status(400).send('Missing code or state');

  // Parse cookie
  const cookies = parseCookies(req.headers.cookie);
  let cookieData;
  try {
    cookieData = JSON.parse(Buffer.from(cookies.x_auth || '', 'base64').toString());
  } catch (e) {
    return res.status(400).send('Invalid session cookie');
  }

  if (cookieData.state !== state) return res.status(401).send('State mismatch');

  // Clear cookie
  res.setHeader('Set-Cookie', 'x_auth=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0');

  const callbackUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/auth/x-callback`;
  const host = supabaseUrl.replace('https://', '');
  const H = { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` };

  try {
    // ── Exchange code for token ──
    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: callbackUrl,
      code_verifier: cookieData.codeVerifier,
      client_id: clientId,
    }).toString();

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenRes = await httpRequest('POST', 'api.x.com', '/2/oauth2/token', {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`,
    }, tokenBody);

    console.log('Token response:', tokenRes.status);

    if (tokenRes.status !== 200 || !tokenRes.body?.access_token) {
      console.error('Token exchange failed:', JSON.stringify(tokenRes.body).slice(0, 300));
      return res.redirect('/?error=token_failed');
    }

    const accessToken = tokenRes.body.access_token;

    // ── Fetch X user profile ──
    const meRes = await httpRequest('GET', 'api.x.com', '/2/users/me?user.fields=profile_image_url,username,name', {
      'Authorization': `Bearer ${accessToken}`,
    }, null);

    console.log('User profile response:', meRes.status);

    if (meRes.status !== 200 || !meRes.body?.data) {
      console.error('Profile fetch failed:', JSON.stringify(meRes.body).slice(0, 300));
      return res.redirect('/?error=profile_failed');
    }

    const xUser = meRes.body.data;
    const xUsername = xUser.username || '';
    const xName = xUser.name || xUsername;
    const xAvatar = (xUser.profile_image_url || '').replace('_normal', '_400x400');
    const xId = xUser.id;

    console.log('X user:', xUsername, xId);

    // ── MODE: LINK (add X to existing account) ──
    if (cookieData.mode === 'link' && cookieData.linkUserId) {
      await httpRequest('PATCH', host, `/rest/v1/profiles?id=eq.${cookieData.linkUserId}`, {
        ...H, 'Content-Type': 'application/json', 'Prefer': 'return=minimal'
      }, {
        x_handle: xUsername,
        x_verified: true,
        avatar_url: xAvatar,
      });
      console.log('Linked X to user:', cookieData.linkUserId);
      return res.redirect('/#profile');
    }

    // ── MODE: LOGIN (sign in with X) ──
    const xEmail = `x_${xId}@x.imstranded.org`;
    const xPassword = derivePassword(xId, clientSecret);

    let userId = null;

    // Check if X handle already linked to an account
    if (xUsername) {
      const profileRes = await httpRequest('GET', host,
        `/rest/v1/profiles?select=id&x_handle=eq.${encodeURIComponent(xUsername)}&x_verified=eq.true&limit=1`,
        { ...H, 'Content-Type': 'application/json' }, null);
      if (profileRes.status === 200 && Array.isArray(profileRes.body) && profileRes.body.length > 0) {
        userId = profileRes.body[0].id;
        const userRes = await httpRequest('GET', host, `/auth/v1/admin/users/${userId}`, H, null);
        if (userRes.status === 200) {
          await httpRequest('PUT', host, `/auth/v1/admin/users/${userId}`, H, { password: xPassword });
          return res.redirect(`/#x-login:${userRes.body.email}:${xPassword}`);
        }
      }
    }

    // Check if x_xxx user exists
    const listRes = await httpRequest('GET', host, `/auth/v1/admin/users?page=1&per_page=50`, H, null);
    if (listRes.status === 200 && listRes.body?.users) {
      const match = listRes.body.users.find(u => u.email === xEmail);
      if (match) {
        userId = match.id;
        await httpRequest('PUT', host, `/auth/v1/admin/users/${userId}`, H, { password: xPassword });
      }
    }

    // Create new user
    if (!userId) {
      const createRes = await httpRequest('POST', host, '/auth/v1/admin/users', H, {
        email: xEmail,
        password: xPassword,
        email_confirm: true,
        user_metadata: { full_name: xName, avatar_url: xAvatar, provider: 'x', x_id: xId, x_username: xUsername }
      });
      if (createRes.status !== 200 && createRes.status !== 201) {
        console.error('Create user failed:', JSON.stringify(createRes.body).slice(0, 300));
        return res.redirect('/?error=create_failed');
      }
      userId = createRes.body.id;
    }

    // Ensure profile
    const checkProfile = await httpRequest('GET', host, `/rest/v1/profiles?select=id&id=eq.${userId}`,
      { ...H, 'Content-Type': 'application/json' }, null);
    if (checkProfile.status === 200 && Array.isArray(checkProfile.body) && checkProfile.body.length > 0) {
      await httpRequest('PATCH', host, `/rest/v1/profiles?id=eq.${userId}`, {
        ...H, 'Content-Type': 'application/json', 'Prefer': 'return=minimal'
      }, { x_handle: xUsername, x_verified: true, avatar_url: xAvatar });
    } else {
      await httpRequest('POST', host, '/rest/v1/profiles', {
        ...H, 'Content-Type': 'application/json', 'Prefer': 'return=minimal'
      }, { id: userId, email: xEmail, display_name: xName, avatar_url: xAvatar, x_handle: xUsername, x_verified: true });
    }

    // Redirect with credentials in hash (client-side picks them up)
    return res.redirect(`/#x-login:${xEmail}:${xPassword}`);

  } catch (e) {
    console.error('X callback error:', e);
    return res.redirect('/?error=internal');
  }
};