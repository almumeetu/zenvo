/**
 * /api/categories — Gaming Category listing and creation API
 *
 * Proxies requests to deployed API server (https://api-zenov.bornobyte.com/api/categories)
 * with admin token authorization and Supabase database fallback.
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getAdminAuthHeaders, verifyAdminRequest } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  // 1. Fast fetch from deployed API server
  try {
    const apiRes = await fetch(`${API_BASE_URL}/categories`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && Array.isArray(data.data)) {
        return NextResponse.json({
          success: true,
          categories: data.data,
          total: data.total || data.data.length,
        });
      }
    }
  } catch (err: any) {}

  // 2. Direct Supabase query
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .order('sortOrder', { ascending: true });

      if (!error && Array.isArray(data)) {
        return NextResponse.json({
          success: true,
          categories: data,
          total: data.length,
        });
      }
    }
  } catch (err: any) {}

  return NextResponse.json({
    success: true,
    categories: [],
    total: 0,
  });
}

export async function POST(request: Request) {
  const adminCheck = await verifyAdminRequest(request);
  if (!adminCheck.isAdmin) {
    return NextResponse.json(
      { success: false, message: 'Admin authentication required.' },
      { status: 403 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const categoryPayload = {
    id: body.id || `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: body.name,
    slug: body.slug,
    icon: body.icon || 'Gamepad2',
    description: body.description || '',
    badge: body.badge || '',
    isActive: body.active !== false && body.isActive !== false,
    sortOrder: Number(body.sortOrder) || 10,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  let createdCategory: any = null;

  // 1. Try sync to deployed API
  try {
    const apiRes = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(categoryPayload),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && (data.data || data.category)) {
        createdCategory = data.data || data.category;
      }
    }
  } catch (err: any) {}

  // 2. Always persist directly to Supabase
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .insert([categoryPayload])
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, category: data, data });
      }
    }
  } catch (err: any) {}

  if (createdCategory) {
    return NextResponse.json({ success: true, category: createdCategory, data: createdCategory });
  }

  return NextResponse.json({
    success: true,
    category: categoryPayload,
    data: categoryPayload,
  });
}
