/**
 * /api/orders/[id] — Single order update (status changes from admin panel)
 *
 * Uses supabaseAdmin (service role) to bypass RLS for write operations.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const VALID_ORDER_COLUMNS = new Set([
  'id',
  'orderNumber',
  'userId',
  'userEmail',
  'items',
  'totalUSD',
  'currency',
  'paidAmountCurrency',
  'paymentMethod',
  'paymentStatus',
  'fulfillmentStatus',
  'playerId',
  'serverId',
  'transactionId',
  'notes',
  'updatedAt',
]);

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

    // Build sanitized update payload
    const updatePayload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    for (const [key, value] of Object.entries(body)) {
      if (VALID_ORDER_COLUMNS.has(key)) {
        updatePayload[key] = value;
      }
    }

    // If extra customer metadata is provided, preserve or update in notes
    if (body.customerName || body.customerPhone || body.senderNumber || body.adminNotes) {
      const meta = {
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        senderNumber: body.senderNumber,
        ipAddress: body.ipAddress,
        adminNotes: body.notes || body.adminNotes || '',
      };
      updatePayload.notes = JSON.stringify(meta);
    }

    // Try matching by row id first
    let { data, error } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Fall back to orderNumber match (admin panel may use either)
      const altResult = await supabaseAdmin
        .from('orders')
        .update(updatePayload)
        .eq('orderNumber', id)
        .select()
        .single();

      if (altResult.error) {
        console.error('[API /orders/[id] PUT] Supabase update error:', altResult.error.message);
        return NextResponse.json({ success: false, order: null, message: altResult.error.message }, { status: 400 });
      }
      data = altResult.data;
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error: any) {
    console.error('[API /orders/[id] PUT] Unexpected error:', error);
    return NextResponse.json({ success: false, order: null, message: error.message }, { status: 500 });
  }
}

