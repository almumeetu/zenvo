/**
 * /api/products — Public product catalog API
 *
 * Proxies requests to the deployed backend API (https://api-zenov.bornobyte.com/api/products)
 * with a automatic fallback to Supabase Admin client if the backend API is unreachable.
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { supabaseAdmin } from '@/lib/supabase-server';

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
    console.warn('[API Proxy /products GET] Primary API server warning (falling back):', err?.message || err);
  }


  // 2. Fallback to direct Supabase query
  try {
    if (!supabaseAdmin) {
      console.warn('[API /products] supabaseAdmin is not initialized.');
      return NextResponse.json({ success: true, products: [] });
    }

    let { data: products, error } = await supabaseAdmin.from('products').select('*');

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

import { getAuthHeaders } from '@/lib/api-auth';

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    // 1. Try posting to deployed API server with Admin Auth
    const apiRes = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(request),
      body: JSON.stringify(body),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    console.warn('[API Proxy /products POST] Primary API error, using Supabase fallback:', err?.message || err);
  }

  // 2. Fallback to Supabase insert
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, product: null, message: 'Database not configured.' }, { status: 503 });
    }

    const { data, error } = await supabaseAdmin.from('products').insert([body]).select().single();

    if (error) {
      return NextResponse.json({ success: false, product: null, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, product: null, message: error.message }, { status: 500 });
  }
}
