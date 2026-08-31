/**
 * /api/orders/[id] — Single order update (status changes from admin panel)
 *
 * Proxies to deployed API server (PUT /api/orders/:id or PUT /api/admin/orders/:id/status)
 * with automatic fallback to Supabase Admin.
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { supabaseAdmin } from '@/lib/supabase-server';

import { getAuthHeaders } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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
  const { id } = await params;
  let body: any;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // 1. Try primary backend API endpoints with Admin Auth
  try {
    const endpoint = body.status
      ? `${API_BASE_URL}/admin/orders/${id}/status`
      : `${API_BASE_URL}/orders/${id}`;

    const apiRes = await fetch(endpoint, {
      method: 'PUT',
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
    console.warn(`[API Proxy /orders/${id} PUT] Primary API error, using Supabase fallback:`, err?.message || err);
  }

  // 2. Fallback to direct Supabase update
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, order: null, message: 'Database not configured.' }, { status: 503 });
    }

    const updatePayload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    for (const [key, value] of Object.entries(body)) {
      if (VALID_ORDER_COLUMNS.has(key)) {
        updatePayload[key] = value;
      }
    }

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

    let { data, error } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      const altResult = await supabaseAdmin
        .from('orders')
        .update(updatePayload)
        .eq('orderNumber', id)
        .select()
        .single();

      if (altResult.error) {
        return NextResponse.json({ success: false, order: null, message: altResult.error.message }, { status: 400 });
      }
      data = altResult.data;
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, order: null, message: error.message }, { status: 500 });
  }
}
