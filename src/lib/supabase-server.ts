/**
 * Server-only Supabase admin client — uses the SERVICE ROLE KEY.
 *
 * ⚠️  NEVER import this in client components or expose to the browser.
 *      It bypasses Row Level Security (RLS) entirely, so it is suitable
 *      only for trusted server-side API routes.
 *
 * Use cases:
 *  - Reading all products from the DB for public pages (bypasses any
 *    RLS that might block the anon role from reading newly-added products)
 *  - Writing orders, tickets, etc. from API routes where the caller is
 *    not authenticated
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    '[supabase-server] WARNING: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY ' +
      'is not defined. Server-side Supabase admin operations will be skipped. ' +
      'Make sure these env vars are set in Vercel → Settings → Environment Variables → Production.'
  );
}

/**
 * Admin Supabase client. Returns null if env vars are missing so callers
 * can fall back gracefully rather than crashing at module load time.
 */
export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          // Disable auto-refresh and session management — this is a server client
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;
