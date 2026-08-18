/**
 * /api/products/[id] — Single product update and delete
 *
 * Uses supabaseAdmin (service role) to bypass RLS for write operations.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!supabaseAdmin) {
      console.warn('[API /products/[id] PUT] supabaseAdmin is not initialized. Product not updated in DB.');
      return NextResponse.json({ success: false, product: null, message: 'Database not configured. Check SUPABASE_SERVICE_ROLE_KEY.' }, { status: 503 });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[API /products/[id] PUT] Supabase update error:', error.message, error.details);
      return NextResponse.json({ success: false, product: null, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error: any) {
    console.error('[API /products/[id] PUT] Unexpected error:', error);
    return NextResponse.json({ success: false, product: null, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!supabaseAdmin) {
      console.warn('[API /products/[id] DELETE] supabaseAdmin is not initialized. Product not deleted from DB.');
      return NextResponse.json({ success: false, message: 'Database not configured. Check SUPABASE_SERVICE_ROLE_KEY.' }, { status: 503 });
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[API /products/[id] DELETE] Supabase delete error:', error.message, error.details);
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('[API /products/[id] DELETE] Unexpected error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
