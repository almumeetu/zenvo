import crypto from 'crypto';
import { supabaseAdmin } from './supabase-server';

/**
 * Designated master admin emails permitted full store administration
 */
export const DESIGNATED_ADMIN_EMAILS = [
  'almumeetu@gmail.com',
  'zenovgamesbd@gmail.com',
  'admin@zenov.gg',
  'admin@zenovgames.com',
];

/**
 * Generates an authorized Admin Bearer token for verified server-to-server calls.
 * Uses native Node.js crypto module.
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
 * otherwise forwards standard headers without injecting an unauthorized admin token.
 */
export function getAuthHeaders(incomingRequest?: Request): Record<string, string> {
  const incomingAuth = incomingRequest?.headers.get('authorization');
  if (incomingAuth && incomingAuth.startsWith('Bearer ')) {
    return {
      'Content-Type': 'application/json',
      Authorization: incomingAuth,
    };
  }

  return {
    'Content-Type': 'application/json',
  };
}

/**
 * Resolves explicit Admin authorization headers for privileged server-to-server operations.
 */
export function getAdminAuthHeaders(): Record<string, string> {
  const token = getAdminAuthToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Verifies whether the incoming HTTP request is authenticated with admin privileges.
 * Validates via Supabase Auth session token, local admin JWT, or designated admin email.
 */
export async function verifyAdminRequest(
  incomingRequest?: Request
): Promise<{ isAdmin: boolean; user?: any; reason?: string }> {
  const incomingAuth = incomingRequest?.headers.get('authorization');
  if (!incomingAuth || !incomingAuth.startsWith('Bearer ')) {
    return { isAdmin: false, reason: 'Missing Authorization header' };
  }

  const token = incomingAuth.replace('Bearer ', '').trim();

  // 1. Try local HMAC-SHA256 JWT validation
  try {
    const secret = process.env.API_SERVER_JWT_SECRET || process.env.JWT_SECRET;
    if (secret) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const expectedSig = crypto
          .createHmac('sha256', secret)
          .update(`${parts[0]}.${parts[1]}`)
          .digest('base64url');
        if (expectedSig === parts[2]) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
          const now = Math.floor(Date.now() / 1000);
          if (
            payload.exp &&
            payload.exp > now &&
            (payload.role === 'admin' || payload.role === 'ADMIN' || payload.role === 'SUPER_ADMIN')
          ) {
            return { isAdmin: true, user: payload };
          }
        }
      }
    }
  } catch {
    // Continue to Supabase validation
  }

  // 2. Validate against Supabase Auth
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data?.user) {
        const u = data.user;
        const email = u.email?.toLowerCase().trim() || '';

        // Check if designated admin email
        if (DESIGNATED_ADMIN_EMAILS.includes(email)) {
          return { isAdmin: true, user: u };
        }

        // Check user role in database profiles table
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', u.id)
          .single();

        if (profile?.role === 'admin' || profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
          return { isAdmin: true, user: u };
        }
      }
    } catch (e: any) {
      return { isAdmin: false, reason: e?.message || 'Supabase auth error' };
    }
  }

  return { isAdmin: false, reason: 'Insufficient privileges' };
}

/**
 * Extracts and verifies the authenticated user from the incoming request.
 */
export async function getAuthenticatedUser(incomingRequest?: Request): Promise<any | null> {
  const incomingAuth = incomingRequest?.headers.get('authorization');
  if (!incomingAuth || !incomingAuth.startsWith('Bearer ')) return null;

  const token = incomingAuth.replace('Bearer ', '').trim();
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data?.user) {
        return data.user;
      }
    } catch {}
  }
  return null;
}
