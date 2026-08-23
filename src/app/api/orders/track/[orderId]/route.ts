/**
 * /api/orders/track/[orderId] — Order tracking API
 *
 * Proxies tracking requests to deployed API server (GET https://api-zenov.bornobyte.com/api/orders/track/:orderId)
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  try {
    const apiRes = await fetch(`${API_BASE_URL}/orders/track/${encodeURIComponent(orderId)}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    console.warn(`[API Proxy /orders/track/${orderId} GET] Primary API error:`, err?.message || err);
  }

  return NextResponse.json({ success: false, order: null, message: 'Order not found' }, { status: 404 });
}
