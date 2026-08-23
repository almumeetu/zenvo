/**
 * /api/products/[id] — Single product update and delete API
 *
 * Proxies requests to deployed API server with fallback to Supabase Admin.
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: any;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const apiRes = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    console.warn(`[API Proxy /products/${id} PUT] Primary API error, using Supabase fallback:`, err?.message || err);
  }

  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, product: null, message: 'Database not configured.' }, { status: 503 });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, product: null, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, product: null, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const apiRes = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    console.warn(`[API Proxy /products/${id} DELETE] Primary API error, using Supabase fallback:`, err?.message || err);
  }

  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: 'Database not configured.' }, { status: 503 });
    }

    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
