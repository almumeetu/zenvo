/**
 * /api/orders/[id] — Single order update (status changes from admin panel)
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
      console.warn('[API /orders/[id] PUT] supabaseAdmin is not initialized. Order status not updated in DB.');
      return NextResponse.json({ success: false, order: null, message: 'Database not configured. Check SUPABASE_SERVICE_ROLE_KEY.' }, { status: 503 });
    }

    // Try matching by row id first
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Fall back to orderNumber match (admin panel may use either)
      const { data: altData, error: altError } = await supabaseAdmin
        .from('orders')
        .update(body)
        .eq('orderNumber', id)
        .select()
        .single();

      if (altError) {
        console.error('[API /orders/[id] PUT] Supabase update error (both id and orderNumber failed):', altError.message);
        return NextResponse.json({ success: false, order: null, message: altError.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, order: altData });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error: any) {
    console.error('[API /orders/[id] PUT] Unexpected error:', error);
    return NextResponse.json({ success: false, order: null, message: error.message }, { status: 500 });
  }
}
