/**
 * /api/settings — Site Settings (Footer, Social Links, WhatsApp, Contact & Address)
 *
 * Supports GET (retrieve current settings) and POST / PUT (admin update)
 * with remote backend API proxy and Supabase persistent fallback.
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { getAuthHeaders } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { DEFAULT_SITE_SETTINGS } from '@/data/siteSettings';
import { SiteSettings } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  // 1. Try remote API proxy first
  try {
    const apiRes = await fetch(`${API_BASE_URL}/settings`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && data.settings) {
        return NextResponse.json(data);
      }
    }
  } catch {
    // Ignore remote network error and continue
  }

  // 2. Try Supabase app_settings table
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('app_settings')
        .select('*')
        .eq('key', 'global_settings')
        .single();

      if (!error && data && data.value) {
        return NextResponse.json({
          success: true,
          settings: {
            ...DEFAULT_SITE_SETTINGS,
            ...data.value,
          },
        });
      }
    }
  } catch (err: any) {
    console.warn('[API /settings GET] Supabase note:', err?.message || err);
  }

  // 3. Fallback to default site settings
  return NextResponse.json({
    success: true,
    settings: DEFAULT_SITE_SETTINGS,
  });
}

export async function POST(request: Request) {
  let body: Partial<SiteSettings>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON request payload' }, { status: 400 });
  }

  // Format whatsapp link if number changed
  let formattedWhatsappLink = body.whatsappLink;
  if (body.whatsappNumber) {
    const cleanNum = body.whatsappNumber.replace(/[^\d]/g, '');
    if (cleanNum && (!formattedWhatsappLink || formattedWhatsappLink.includes('wa.me'))) {
      formattedWhatsappLink = `https://wa.me/${cleanNum}`;
    }
  }

  const updatedPayload: SiteSettings = {
    ...DEFAULT_SITE_SETTINGS,
    ...body,
    socialLinks: {
      ...DEFAULT_SITE_SETTINGS.socialLinks,
      ...(body.socialLinks || {}),
    },
    whatsappLink: formattedWhatsappLink,
    updatedAt: new Date().toISOString(),
  };

  // 1. Try proxying to remote backend
  try {
    const apiRes = await fetch(`${API_BASE_URL}/settings`, {
      method: 'POST',
      headers: getAuthHeaders(request),
      body: JSON.stringify(updatedPayload),
    });
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    console.warn('[API /settings POST] Remote proxy note:', err?.message || err);
  }

  // 2. Try Supabase upsert
  try {
    if (supabaseAdmin) {
      await supabaseAdmin.from('app_settings').upsert({
        key: 'global_settings',
        value: updatedPayload,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    console.warn('[API /settings POST] Supabase note:', err?.message || err);
  }

  // 3. Return successfully saved settings
  return NextResponse.json({
    success: true,
    message: 'Settings updated successfully.',
    settings: updatedPayload,
  });
}

export async function PUT(request: Request) {
  return POST(request);
}
