/**
 * /api/auth/x-login.js
 * Starts X/Twitter OAuth 2.0 PKCE flow
 * 
 * Env vars: X_CLIENT_ID
 */

const crypto = require('crypto');

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

module.exports = async function handler(req, res) {
  const clientId = process.env.X_CLIENT_ID;
  if (!clientId) return res.status(500).json({ error: 'Missing X_CLIENT_ID' });

  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest());
  const state = base64url(crypto.randomBytes(16));

  // mode: 'login' or 'link'
  const mode = req.query.mode || 'login';
  const linkUserId = req.query.user_id || '';

  const cookieData = JSON.stringify({ codeVerifier, state, mode, linkUserId });
  const cookieValue = Buffer.from(cookieData).toString('base64');
  res.setHeader('Set-Cookie', `x_auth=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=600`);

  const callbackUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/auth/x-callback`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: callbackUrl,
    scope: 'tweet.read users.read',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  res.writeHead(302, { Location: `https://twitter.com/i/oauth2/authorize?${params}` });
  res.end();
};