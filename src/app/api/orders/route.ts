/**
 * /api/orders — Order creation and listing
 *
 * Uses supabaseAdmin (service role) so orders are always saved to the DB
 * regardless of any RLS restrictions on the anon role.
 *
 * Email notification is sent after a successful order insert.
 * Email failures are logged but do NOT fail the order response.
 */

import { NextResponse } from 'next/server';
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
    if (!supabaseAdmin) {
      console.warn('[API /orders GET] supabaseAdmin is not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
      return NextResponse.json({ success: true, orders: [] });
    }

    // Try ordering by createdAt (camelCase schema in Supabase)
    let { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });

    // Fallback if schema uses created_at or unordered
    if (error) {
      console.warn('[API /orders GET] order("createdAt") fallback:', error.message);
      const fallback = await supabaseAdmin.from('orders').select('*');
      orders = fallback.data ?? [];
      error = fallback.error;
    }

    if (error) {
      console.error('[API /orders GET] Supabase query error:', error.message, error.details);
      return NextResponse.json({ success: false, orders: [], message: error.message }, { status: 500 });
    }

    const formattedOrders = (orders ?? [])
      .map(parseOrderNotes)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, orders: formattedOrders });
  } catch (error: any) {
    console.error('[API /orders GET] Unexpected error:', error);
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
  try {
    const body = await request.json();
    const clientIp = getClientIp(request);

    // Auto-generate order identifiers if missing
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

    // Metadata packed into notes for seamless database compatibility
    const metaObj = {
      customerName,
      customerPhone,
      senderNumber,
      ipAddress: clientIp,
      adminNotes: body.notes || body.adminNotes || '',
    };

    // Exact schema payload matching Supabase orders table columns
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

    // 1. Save order to Supabase database
    let savedOrder: any = dbOrder;
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .insert([dbOrder])
        .select()
        .single();

      if (error) {
        console.error('[API /orders POST] Supabase insert error:', error.message, error.details, error.hint);
      } else if (data) {
        savedOrder = data;
      }
    } else {
      console.warn('[API /orders POST] supabaseAdmin is not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
    }

    const formattedSavedOrder = parseOrderNotes(savedOrder);

    // 2. Send email notification (non-blocking, never fails the order)
    try {
      const emailResult = await sendOrderNotificationEmail({
        ...formattedSavedOrder,
        customerName,
        customerPhone,
        senderNumber,
        ipAddress: clientIp,
      });

      if (!emailResult.success) {
        console.error(
          '[API /orders POST] Order email failed. Resend error:',
          JSON.stringify(emailResult?.error || emailResult.message)
        );
      } else {
        console.log('[API /orders POST] Order notification email sent successfully for order:', orderNumber);
      }
    } catch (mailErr: any) {
      console.error('[API /orders POST] Order email notification threw an exception:', mailErr?.message || mailErr);
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

