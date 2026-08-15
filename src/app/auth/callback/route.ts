import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') || '/';

  if (code && supabase) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (e) {
      console.error('Error exchanging OAuth code for session:', e);
    }
  }

  // Ensure redirect target begins with a slash
  const targetUrl = redirect.startsWith('/') ? redirect : `/${redirect}`;
  return NextResponse.redirect(`${origin}${targetUrl}`);
}
