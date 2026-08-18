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

export async function GET() {
  try {
    if (!supabaseAdmin) {
      console.warn('[API /orders GET] supabaseAdmin is not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
      return NextResponse.json({ success: true, orders: [] });
    }

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API /orders GET] Supabase query error:', error.message, error.details);
      return NextResponse.json({ success: false, orders: [], message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, orders: orders ?? [] });
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

    // Auto-generate order fields if missing
    const id = body.id || 'ord_' + Date.now();
    const orderNumber =
      body.orderNumber ||
      'ZNG-' + Math.floor(100000 + Math.random() * 900000) + '-' + Date.now().toString().slice(-3);
    const transactionId =
      body.transactionId || 'TX-' + Math.random().toString(36).slice(2, 10).toUpperCase();

    const newOrder = {
      id,
      orderNumber,
      userId: body.userId || 'guest',
      customerName: body.customerName || body.userName || 'Guest Customer',
      customerEmail: body.customerEmail || body.userEmail || 'guest@zenov.gg',
      customerPhone: body.customerPhone || body.phone || '',
      userEmail: body.customerEmail || body.userEmail || 'guest@zenov.gg',
      ipAddress: clientIp,
      items: body.items || [],
      totalUSD: body.totalUSD || 0,
      currency: body.currency || 'BDT',
      paidAmountCurrency: body.paidAmountCurrency || 0,
      paymentMethod: body.paymentMethod || 'bKash',
      paymentStatus: body.paymentStatus || 'Pending Verification',
      fulfillmentStatus: body.fulfillmentStatus || 'Processing',
      playerId: body.playerId || 'PLAYER_GUEST',
      serverId: body.serverId || '',
      transactionId,
      senderNumber: body.senderNumber || '',
      productTitle: body.items?.[0]?.productTitle || body.productTitle || '',
      denominationName: body.items?.[0]?.denomination?.name || body.denominationName || '',
      priceBDT: body.paidAmountCurrency || body.totalUSD || 0,
      quantity: body.items?.[0]?.quantity || body.quantity || 1,
    };

    // 1. Save order to database first
    let savedOrder = newOrder;
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .insert([newOrder])
        .select()
        .single();

      if (error) {
        // Log the real error — don't silently swallow it
        console.error('[API /orders POST] Supabase insert error:', error.message, error.details, error.hint);
        // Still return success to the customer — order is tracked in client state
        // but log clearly so Vercel logs show the DB failure
      } else {
        savedOrder = data || newOrder;
      }
    } else {
      console.warn('[API /orders POST] supabaseAdmin is not initialized. Order not persisted to DB. Check SUPABASE_SERVICE_ROLE_KEY in Vercel env vars.');
    }

    // 2. Send email notification (non-blocking, never fails the order)
    try {
      const emailResult = await sendOrderNotificationEmail({
        ...newOrder,
        ipAddress: clientIp,
      });

      if (!emailResult.success) {
        // Log the actual Resend error for debugging in Vercel Function Logs
        console.error(
          '[API /orders POST] Order email failed. Resend error:',
          JSON.stringify(emailResult?.error || emailResult.message)
        );
        console.error(
          '[API /orders POST] REMINDER: If RESEND_FROM_EMAIL is "onboarding@resend.dev", ' +
            'emails can only be delivered to the Resend account owner email in sandbox mode. ' +
            'Verify a custom domain in Resend dashboard and update RESEND_FROM_EMAIL env var to fix this.'
        );
      } else {
        console.log('[API /orders POST] Order notification email sent successfully for order:', orderNumber);
      }
    } catch (mailErr: any) {
      console.error('[API /orders POST] Order email notification threw an exception:', mailErr?.message || mailErr);
    }

    return NextResponse.json({ success: true, orderNumber, order: savedOrder });
  } catch (error: any) {
    console.error('[API /orders POST] Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: error.message, orderNumber: 'ZNG-' + Date.now() },
      { status: 500 }
    );
  }
}
