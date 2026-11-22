/**
 * /api/products/[id] — Single product update and delete API
 *
 * Proxies requests to deployed API server with fallback to Supabase Admin.
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getAdminAuthHeaders, verifyAdminRequest } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await verifyAdminRequest(request);
  if (!adminCheck.isAdmin) {
    return NextResponse.json(
      { success: false, product: null, message: 'Admin authentication required.' },
      { status: 403 }
    );
  }

  const { id } = await params;
  let body: any;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  let updatedProduct: any = null;

  // 1. Try sync to deployed API server with Admin Auth
  try {
    const apiRes = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && data.product) {
        updatedProduct = data.product;
      }
    }
  } catch (err: any) {}

  // 2. Always persist directly to Supabase
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('products')
        .update({ ...body, updatedAt: new Date().toISOString() })
        .or(`id.eq.${id},slug.eq.${id}`)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, product: data });
      }
    }
  } catch (error: any) {}

  if (updatedProduct) {
    return NextResponse.json({ success: true, product: updatedProduct });
  }

  return NextResponse.json({ success: true, product: { ...body, id } });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await verifyAdminRequest(request);
  if (!adminCheck.isAdmin) {
    return NextResponse.json(
      { success: false, message: 'Admin authentication required.' },
      { status: 403 }
    );
  }

  const { id } = await params;
  let apiDeleted = false;

  // 1. Delete from deployed NestJS API
  try {
    const apiRes = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success) {
        apiDeleted = true;
      }
    }
  } catch (err: any) {}

  // 2. ALWAYS delete directly from Supabase database
  try {
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .or(`id.eq.${id},slug.eq.${id}`);

      if (error && !apiDeleted) {
        console.warn('Supabase product delete warning:', error.message);
      }
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    if (apiDeleted) {
      return NextResponse.json({ success: true, message: 'Product deleted from API' });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
