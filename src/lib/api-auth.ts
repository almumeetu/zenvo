import crypto from 'crypto';

/**
 * Generates an authorized Admin Bearer token for server-to-server calls to zenov-api.
 * Uses native Node.js crypto module (no extra dependencies required).
 */
export function getAdminAuthToken(): string {
  const secret =
    process.env.API_SERVER_JWT_SECRET ||
    process.env.JWT_SECRET ||
    '7f8b9c2d1e0a4f5b6c7d8e9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c';

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'admin-master',
      email: 'almumeetu@gmail.com',
      role: 'admin',
      name: 'Zenvo Admin',
      iat: now,
      exp: now + 3600, // 1 hour validity
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

/**
 * Resolves standard authorization headers for outgoing backend API calls.
 * If the incoming request has an Authorization header, forwards it;
 * otherwise provides the master admin Bearer token.
 */
export function getAuthHeaders(incomingRequest?: Request): Record<string, string> {
  const incomingAuth = incomingRequest?.headers.get('authorization');
  if (incomingAuth && incomingAuth.startsWith('Bearer ')) {
    return {
      'Content-Type': 'application/json',
      Authorization: incomingAuth,
    };
  }

  const token = getAdminAuthToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}
