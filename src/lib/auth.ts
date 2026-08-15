import { supabase } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

/**
 * Initiates Google OAuth authentication using Supabase.
 * @param redirectTo Optional path to redirect after successful login (default: '/')
 */
export async function signInWithGoogle(redirectTo: string = '/') {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please check your environment variables.');
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectTarget = `${origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTarget,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Google OAuth error:', error.message);
    throw error;
  }

  return data;
}

/**
 * Signs in user with email and password.
 */
export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    throw new Error('Supabase client is not initialized.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Registers new user with email, password, and metadata.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
  phone?: string
) {
  if (!supabase) {
    throw new Error('Supabase client is not initialized.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || '',
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Signs out the currently authenticated user.
 */
export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Supabase signOut error:', error.message);
    throw error;
  }
}

/**
 * Retrieves the current session.
 */
export async function getSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error fetching session:', error.message);
    return null;
  }
  return session;
}

/**
 * Subscribes to Supabase auth state change events.
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null, user: User | null) => void
) {
  if (!supabase) return { unsubscribe: () => {} };

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session, session?.user || null);
    }
  );

  return {
    unsubscribe: () => subscription.unsubscribe(),
  };
}
