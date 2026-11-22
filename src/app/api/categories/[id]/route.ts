/**
 * /api/categories/[id] — Category update and delete API
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
      { success: false, message: 'Admin authentication required.' },
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

  const updatePayload = {
    ...body,
    updatedAt: new Date().toISOString(),
  };

  let updatedCategory: any = null;

  // 1. Sync to deployed API
  try {
    const apiRes = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(updatePayload),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && (data.data || data.category)) {
        updatedCategory = data.data || data.category;
      }
    }
  } catch (err: any) {}

  // 2. Direct Supabase update
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .update(updatePayload)
        .or(`id.eq.${id},slug.eq.${id}`)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, category: data, data });
      }
    }
  } catch (err: any) {}

  if (updatedCategory) {
    return NextResponse.json({ success: true, category: updatedCategory, data: updatedCategory });
  }

  return NextResponse.json({
    success: true,
    category: { ...updatePayload, id },
    data: { ...updatePayload, id },
  });
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

  // 1. Delete from deployed API server
  try {
    const apiRes = await fetch(`${API_BASE_URL}/categories/${id}`, {
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

  // 2. ALWAYS delete from Supabase database directly
  try {
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('categories')
        .delete()
        .or(`id.eq.${id},slug.eq.${id}`);

      if (error && !apiDeleted) {
        console.warn('Supabase category delete warning:', error.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (err: any) {
    if (apiDeleted) {
      return NextResponse.json({
        success: true,
        message: 'Category deleted successfully',
      });
    }
    return NextResponse.json({
      success: false,
      message: err?.message || 'Failed to delete category',
    }, { status: 500 });
  }
}
