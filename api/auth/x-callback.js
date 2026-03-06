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
    console.log('Token type:', tokenRes.body.token_type, 'scope:', tokenRes.body.scope);

    // Get xId from JWT if possible (fallback for login/signup)
    let xId = '';
    try {
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (payload.length % 4) payload += '=';
        const claims = JSON.parse(Buffer.from(payload, 'base64').toString());
        xId = claims.sub || '';
      }
    } catch (e) {}
    if (!xId) {
      xId = 'xauth_' + crypto.createHash('sha256').update(accessToken).digest('hex').slice(0, 16);
    }

    // Pass token to client — browser will call Twitter API (Vercel IPs are blocked)
    const tokenB64 = Buffer.from(accessToken).toString('base64url');

    if (cookieData.mode === 'link' && cookieData.linkUserId) {
      return res.redirect(`/#x-link-finish:${cookieData.linkUserId}:${tokenB64}`);
    }

    const authMode = cookieData.mode || 'login';
    return res.redirect(`/#x-auth-finish:${authMode}:${xId}:${tokenB64}`);

  } catch (e) {
    console.error('X callback error:', e);
    return errorRedirect(res, 'exception', e.message);
  }
};