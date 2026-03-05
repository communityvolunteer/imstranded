/**
 * /api/auth/x-callback.js
 * Handles X/Twitter OAuth 2.0 callback
 * 
 * Env vars: X_CLIENT_ID, X_CLIENT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

const crypto = require('crypto');
const https = require('https');

function httpRequest(method, hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = typeof body === 'string' ? body : (body ? JSON.stringify(body) : null);
    const h = { ...headers };
    if (bodyStr) h['Content-Length'] = Buffer.byteLength(bodyStr);
    const opts = { hostname, path, method, headers: h, timeout: 15000 };
    const req = https.request(opts, (res) => {
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

// Helper to redirect with visible error
function errorRedirect(res, step, detail) {
  const msg = encodeURIComponent(`X auth failed at ${step}: ${detail}`);
  return res.redirect(`/#x-error:${msg}`);
}

module.exports = async function handler(req, res) {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!clientId || !clientSecret || !supabaseUrl || !serviceKey) {
    return errorRedirect(res, 'config', 'missing env vars');
  }

  const { code, state, error: oauthError } = req.query;
  if (oauthError) return errorRedirect(res, 'oauth', oauthError);
  if (!code || !state) return errorRedirect(res, 'params', 'missing code or state');

  // Parse cookie
  const cookies = parseCookies(req.headers.cookie);
  let cookieData;
  try {
    cookieData = JSON.parse(Buffer.from(cookies.x_auth || '', 'base64').toString());
  } catch (e) {
    return errorRedirect(res, 'cookie', 'invalid or missing session cookie');
  }

  if (cookieData.state !== state) return errorRedirect(res, 'state', 'mismatch');

  // Clear cookie
  res.setHeader('Set-Cookie', 'x_auth=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0');

  const callbackUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/auth/x-callback`;
  const host = supabaseUrl.replace('https://', '');
  const H = { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json' };

  try {
    // ── 1. Exchange code for token ──
    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: callbackUrl,
      code_verifier: cookieData.codeVerifier,
      client_id: clientId,
    }).toString();

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // Try api.twitter.com first (more reliable), fall back to api.x.com
    let tokenRes = await httpRequest('POST', 'api.twitter.com', '/2/oauth2/token', {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`,
    }, tokenBody);

    if (tokenRes.status !== 200) {
      console.log('api.twitter.com failed, trying api.x.com');
      tokenRes = await httpRequest('POST', 'api.x.com', '/2/oauth2/token', {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      }, tokenBody);
    }

    if (tokenRes.status !== 200 || !tokenRes.body?.access_token) {
      console.error('Token exchange failed:', tokenRes.status, JSON.stringify(tokenRes.body).slice(0, 500));
      return errorRedirect(res, 'token', `status ${tokenRes.status} - ${tokenRes.body?.error_description || tokenRes.body?.error || 'unknown'}`);
    }

    const accessToken = tokenRes.body.access_token;

    // ── 2. Fetch X user profile ──
    let meRes = await httpRequest('GET', 'api.twitter.com', '/2/users/me?user.fields=profile_image_url,username,name', {
      'Authorization': `Bearer ${accessToken}`,
    }, null);

    if (meRes.status !== 200) {
      meRes = await httpRequest('GET', 'api.x.com', '/2/users/me?user.fields=profile_image_url,username,name', {
        'Authorization': `Bearer ${accessToken}`,
      }, null);
    }

    if (meRes.status !== 200 || !meRes.body?.data) {
      console.error('Profile fetch failed:', meRes.status, JSON.stringify(meRes.body).slice(0, 300));
      return errorRedirect(res, 'profile', `status ${meRes.status}`);
    }

    const xUser = meRes.body.data;
    const xUsername = xUser.username || '';
    const xName = xUser.name || xUsername;
    const xAvatar = (xUser.profile_image_url || '').replace('_normal', '_400x400');
    const xId = xUser.id;

    console.log('X user:', xUsername, xId);

    // ── 3. MODE: LINK (add X to existing account) ──
    if (cookieData.mode === 'link' && cookieData.linkUserId) {
      const patchRes = await httpRequest('PATCH', host, `/rest/v1/profiles?id=eq.${cookieData.linkUserId}`, {
        ...H, 'Prefer': 'return=minimal'
      }, {
        x_handle: xUsername,
        x_verified: true,
        avatar_url: xAvatar,
      });
      console.log('Link X result:', patchRes.status);
      if (patchRes.status >= 400) {
        return errorRedirect(res, 'link', `profile update failed: ${patchRes.status}`);
      }
      return res.redirect('/#x-linked');
    }

    // ── 4. MODE: LOGIN or SIGNUP ──
    const xEmail = `x_${xId}@x.imstranded.org`;
    const xPassword = derivePassword(xId, clientSecret);
    const authMode = cookieData.mode || 'login';

    let userId = null;
    let signInEmail = null;

    // Check if X handle already linked to an account
    if (xUsername) {
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
    }

    // Check if x_xxx user exists
    if (!userId) {
      const listRes = await httpRequest('GET', host, `/auth/v1/admin/users?page=1&per_page=50`, H, null);
      if (listRes.status === 200 && listRes.body?.users) {
        const match = listRes.body.users.find(u => u.email === xEmail);
        if (match) {
          userId = match.id;
          signInEmail = xEmail;
          await httpRequest('PUT', host, `/auth/v1/admin/users/${userId}`, H, { password: xPassword });
        }
      }
    }

    // Mode enforcement
    if (authMode === 'login' && !userId) {
      return errorRedirect(res, 'login', 'No account found for this X account. Try signing up first.');
    }
    if (authMode === 'signup' && userId) {
      return errorRedirect(res, 'signup', 'An account with this X already exists. Try logging in instead.');
    }

    // Create new user (signup only)
    if (!userId) {
      const createRes = await httpRequest('POST', host, '/auth/v1/admin/users', H, {
        email: xEmail,
        password: xPassword,
        email_confirm: true,
        user_metadata: { full_name: xName, avatar_url: xAvatar, provider: 'x', x_id: xId, x_username: xUsername }
      });
      if (createRes.status !== 200 && createRes.status !== 201) {
        console.error('Create user failed:', JSON.stringify(createRes.body).slice(0, 300));
        return errorRedirect(res, 'create_user', `${createRes.status} - ${createRes.body?.message || ''}`);
      }
      userId = createRes.body.id;
      signInEmail = xEmail;
    }

    // Ensure profile
    const checkProfile = await httpRequest('GET', host, `/rest/v1/profiles?select=id&id=eq.${userId}`, H, null);
    if (checkProfile.status === 200 && Array.isArray(checkProfile.body) && checkProfile.body.length > 0) {
      await httpRequest('PATCH', host, `/rest/v1/profiles?id=eq.${userId}`, {
        ...H, 'Prefer': 'return=minimal'
      }, { x_handle: xUsername, x_verified: true, avatar_url: xAvatar });
    } else {
      await httpRequest('POST', host, '/rest/v1/profiles', {
        ...H, 'Prefer': 'return=minimal'
      }, { id: userId, email: signInEmail, display_name: xName, avatar_url: xAvatar, x_handle: xUsername, x_verified: true });
    }

    // Redirect with credentials
    return res.redirect(`/#x-login:${signInEmail}:${xPassword}`);

  } catch (e) {
    console.error('X callback error:', e);
    return errorRedirect(res, 'exception', e.message);
  }
};