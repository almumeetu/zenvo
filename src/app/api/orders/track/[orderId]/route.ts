import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getAuthHeaders } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const cleanId = orderId?.trim() || '';

  try {
    const apiRes = await fetch(`${API_BASE_URL}/orders/track/${encodeURIComponent(cleanId)}`, {
      cache: 'no-store',
      headers: getAuthHeaders(request),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && data.order) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    console.warn(`[API Proxy /orders/track/${cleanId} GET] Primary API error, checking Supabase fallback:`, err?.message || err);
  }

  // Supabase fallback
  if (supabaseAdmin && cleanId) {
    try {
      const { data: dbOrder } = await supabaseAdmin
        .from('orders')
        .select('*')
        .or(`orderNumber.eq.${cleanId},id.eq.${cleanId},transactionId.eq.${cleanId}`)
        .maybeSingle();

      if (dbOrder) {
        return NextResponse.json({ success: true, order: dbOrder });
      }
    } catch (e: any) {
      console.warn('[API /orders/track Supabase Fallback]', e?.message || e);
    }
  }

  return NextResponse.json({ success: false, order: null, message: 'Order not found' }, { status: 404 });
}

