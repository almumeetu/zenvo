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
import { getAuthHeaders } from '@/lib/api-auth';

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

export async function GET(request: Request) {
  try {
    const apiRes = await fetch(`${API_BASE_URL}/orders`, {
      cache: 'no-store',
      headers: getAuthHeaders(request),
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
    console.log(`[API /orders POST] Sending order #${body.orderNumber || 'new'} to Primary API: ${API_BASE_URL}/orders`);
    const apiRes = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(request),
      body: JSON.stringify({ ...body, ipAddress: clientIp }),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success) {
        console.log(`[API /orders POST] Order successfully processed by Primary API (${API_BASE_URL}/orders)`);
        // Send email confirmation
        try {
          await sendOrderNotificationEmail(data.order || body);
        } catch (mailErr: any) {
          console.warn('[API /orders POST] Email dispatch warning:', mailErr?.message || mailErr);
        }
        return NextResponse.json(data);
      }
    } else {
      const errText = await apiRes.text().catch(() => '');
      console.warn(`[API Proxy /orders POST] Primary API returned status ${apiRes.status}. Details: ${errText}. Switching to Supabase fallback`);
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

    // Accurate USD & BDT calculations
    let calculatedUSD = Number(body.totalUSD) || 0;
    let calculatedBDT = 0;

    if (Array.isArray(body.items) && body.items.length > 0) {
      let sumUSD = 0;
      let sumBDT = 0;
      body.items.forEach((it: any) => {
        const qty = Math.max(1, Number(it.quantity) || 1);
        const uUSD = Number(it.denomination?.amount) || Number(it.amount) || Number(it.price) || 0;
        const uBDT =
          it.denomination?.priceBDT !== undefined && Number(it.denomination.priceBDT) > 0
            ? Number(it.denomination.priceBDT)
            : it.priceBDT !== undefined && Number(it.priceBDT) > 0
            ? Number(it.priceBDT)
            : Math.round(uUSD * 120);
        sumUSD += uUSD * qty;
        sumBDT += uBDT * qty;
      });
      if (!calculatedUSD) calculatedUSD = Number(sumUSD.toFixed(2));
      calculatedBDT = sumBDT;
    }

    if (!calculatedBDT) {
      calculatedBDT = Math.round(calculatedUSD * 120);
    }

    const currency = body.currency || 'BDT';
    const paidAmountCurrency =
      currency === 'BDT'
        ? (Number(body.paidAmountCurrency) && Number(body.paidAmountCurrency) > 10 ? Number(body.paidAmountCurrency) : calculatedBDT)
        : (Number(body.paidAmountCurrency) || calculatedUSD);

    let dbOrder = {
      id,
      orderNumber,
      userId: body.userId || 'guest',
      userEmail,
      items: body.items || [],
      totalUSD: calculatedUSD,
      currency,
      paidAmountCurrency,
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
      let { data, error } = await supabaseAdmin
        .from('orders')
        .insert([dbOrder])
        .select()
        .single();

      if (error) {
        console.error('[API /orders POST] Supabase insert error:', error.message);
        // Handle duplicate transactionId or orderNumber by appending unique suffix
        if (error.message?.includes('orders_transactionId_key') || error.message?.includes('orders_pkey') || error.message?.includes('unique')) {
          const altTrx = `${dbOrder.transactionId}-${Date.now().toString().slice(-4)}`;
          const altId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          const retryObj = { ...dbOrder, id: altId, transactionId: altTrx };
          const retryRes = await supabaseAdmin
            .from('orders')
            .insert([retryObj])
            .select()
            .single();

          if (retryRes.data) {
            savedOrder = retryRes.data;
            console.log('[API /orders POST] Successfully saved to Supabase with unique transactionId:', altTrx);
          }
        }
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
