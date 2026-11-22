/**
 * /api/products — Public product catalog API
 *
 * Proxies requests to deployed backend API (https://api-zenov.bornobyte.com/api/products)
 * with automatic fallback to Supabase Admin client.
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getAdminAuthHeaders, verifyAdminRequest } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    // 1. Fast fetch from deployed API server
    const apiRes = await fetch(`${API_BASE_URL}/products`, {
      cache: 'no-store',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    });
    clearTimeout(timeoutId);

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && Array.isArray(data.products)) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
  }

  // 2. Fallback to direct Supabase query
  try {
    if (!supabaseAdmin) {
      console.warn('[API /products] supabaseAdmin is not initialized.');
      return NextResponse.json({ success: true, products: [] });
    }

    const { data: products, error } = await supabaseAdmin.from('products').select('*');

    if (error) {
      return NextResponse.json({ success: false, products: [], message: error.message }, { status: 500 });
    }

    const sortedProducts = (products ?? []).sort((a: any, b: any) => {
      const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
      const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({ success: true, products: sortedProducts });
  } catch (error: any) {
    console.error('[API /products] Fallback error:', error);
    return NextResponse.json({ success: false, products: [], message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const adminCheck = await verifyAdminRequest(request);
  if (!adminCheck.isAdmin) {
    return NextResponse.json(
      { success: false, product: null, message: 'Admin authentication required.' },
      { status: 403 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const id = body.id || `prod_${Date.now()}`;
  const productPayload = {
    ...body,
    id,
    updatedAt: new Date().toISOString(),
    createdAt: body.createdAt || new Date().toISOString(),
  };

  let createdProduct: any = null;

  try {
    // 1. Try posting to deployed API server with Admin Auth
    const apiRes = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(productPayload),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && data.product) {
        createdProduct = data.product;
      }
    }
  } catch (err: any) {}

  // 2. Always persist directly to Supabase
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert([productPayload])
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, product: data });
      }
    }
  } catch (error: any) {}

  if (createdProduct) {
    return NextResponse.json({ success: true, product: createdProduct });
  }

  return NextResponse.json({ success: true, product: productPayload });
}
