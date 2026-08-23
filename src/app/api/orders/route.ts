/**
 * /api/orders — Order creation and listing API
 *
 * Proxies requests to deployed API server (https://api-zenov.bornobyte.com/api/orders)
 * with automatic fallback to Supabase Admin and Resend email notification if primary API is unreachable.
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { supabaseAdmin } from '@/lib/supabase-server';
import { sendOrderNotificationEmail } from '@/lib/resend';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function parseOrderNotes(rawOrder: any) {
  let customerName = rawOrder.customerName || (rawOrder.userId === 'guest' ? 'Guest Customer' : 'Customer');
  let customerPhone = rawOrder.customerPhone || '';
  let senderNumber = rawOrder.senderNumber || '';
  let ipAddress = rawOrder.ipAddress || '';
  let cleanNotes = rawOrder.notes || '';

  if (rawOrder.notes && typeof rawOrder.notes === 'string') {
    try {
      if (rawOrder.notes.startsWith('{') && rawOrder.notes.endsWith('}')) {
        const parsed = JSON.parse(rawOrder.notes);
        if (parsed.customerName) customerName = parsed.customerName;
        if (parsed.customerPhone) customerPhone = parsed.customerPhone;
        if (parsed.senderNumber) senderNumber = parsed.senderNumber;
        if (parsed.ipAddress) ipAddress = parsed.ipAddress;
        cleanNotes = parsed.adminNotes || parsed.notes || '';
      }
    } catch {
      // plain string note
    }
  }

  return {
    ...rawOrder,
    customerName,
    customerPhone,
    senderNumber,
    ipAddress,
    notes: cleanNotes,
    createdAt: rawOrder.createdAt || rawOrder.created_at || new Date().toISOString(),
    updatedAt: rawOrder.updatedAt || rawOrder.updated_at || new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const apiRes = await fetch(`${API_BASE_URL}/orders`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && Array.isArray(data.orders)) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    console.warn('[API Proxy /orders GET] Primary API server error, switching to Supabase fallback:', err?.message || err);
  }

  try {
    if (!supabaseAdmin) {
      console.warn('[API /orders GET] supabaseAdmin is not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
      return NextResponse.json({ success: true, orders: [] });
    }

    let { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      const fallback = await supabaseAdmin.from('orders').select('*');
      orders = fallback.data ?? [];
      error = fallback.error;
    }

    if (error) {
      return NextResponse.json({ success: false, orders: [], message: error.message }, { status: 500 });
    }

    const formattedOrders = (orders ?? [])
      .map(parseOrderNotes)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, orders: formattedOrders });
  } catch (error: any) {
    console.error('[API /orders GET] Fallback error:', error);
    return NextResponse.json({ success: false, orders: [], message: error.message }, { status: 500 });
  }
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();
  return '127.0.0.1';
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const clientIp = getClientIp(request);

  try {
    const apiRes = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, ipAddress: clientIp }),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    console.warn('[API Proxy /orders POST] Primary API server error, using Supabase fallback:', err?.message || err);
  }

  // Fallback save to Supabase + Resend email
  try {
    const id = body.id || 'ord_' + Date.now();
    const orderNumber =
      body.orderNumber ||
      'ZNG-' + Math.floor(100000 + Math.random() * 900000) + '-' + Date.now().toString().slice(-3);
    const transactionId =
      body.transactionId?.trim() ||
      'TX-' + Math.random().toString(36).slice(2, 10).toUpperCase();

    const customerName = body.customerName || body.userName || (body.userId === 'guest' || !body.userId ? 'Guest Gamer' : 'Customer');
    const customerPhone = body.customerPhone || body.phone || '';
    const senderNumber = body.senderNumber || '';
    const userEmail = body.customerEmail || body.userEmail || (body.userId === 'guest' ? 'guest@zenovgames.com' : 'user@zenovgames.com');
    const playerId = body.playerId || body.items?.[0]?.playerId || 'PLAYER_GUEST';
    const serverId = body.serverId || body.items?.[0]?.serverId || '';

    const metaObj = {
      customerName,
      customerPhone,
      senderNumber,
      ipAddress: clientIp,
      adminNotes: body.notes || body.adminNotes || '',
    };

    const dbOrder = {
      id,
      orderNumber,
      userId: body.userId || 'guest',
      userEmail,
      items: body.items || [],
      totalUSD: Number(body.totalUSD) || 0,
      currency: body.currency || 'BDT',
      paidAmountCurrency: Number(body.paidAmountCurrency) || Number(body.totalUSD) || 0,
      paymentMethod: body.paymentMethod || 'bKash',
      paymentStatus: body.paymentStatus || 'Pending Verification',
      fulfillmentStatus: body.fulfillmentStatus || 'Processing',
      playerId,
      serverId,
      transactionId,
      notes: JSON.stringify(metaObj),
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: body.updatedAt || new Date().toISOString(),
    };

    let savedOrder: any = dbOrder;
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .insert([dbOrder])
        .select()
        .single();

      if (error) {
        console.error('[API /orders POST] Supabase insert error:', error.message);
      } else if (data) {
        savedOrder = data;
      }
    }

    const formattedSavedOrder = parseOrderNotes(savedOrder);

    try {
      await sendOrderNotificationEmail({
        ...formattedSavedOrder,
        customerName,
        customerPhone,
        senderNumber,
        ipAddress: clientIp,
      });
    } catch (mailErr: any) {
      console.error('[API /orders POST] Order email notification exception:', mailErr?.message || mailErr);
    }

    return NextResponse.json({ success: true, orderNumber, order: formattedSavedOrder });
  } catch (error: any) {
    console.error('[API /orders POST] Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: error.message, orderNumber: 'ZNG-' + Date.now() },
      { status: 500 }
    );
  }
}
