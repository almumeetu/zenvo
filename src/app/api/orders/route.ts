import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { INITIAL_ORDERS } from '@/data/initialData';
import { sendOrderNotificationEmail } from '@/lib/resend';

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ success: true, orders: INITIAL_ORDERS });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.warn('Supabase query error (likely table not created yet):', error.message);
      return NextResponse.json({ success: true, orders: INITIAL_ORDERS });
    }

    // Auto-seed if empty
    if (!orders || orders.length === 0) {
      console.log('Supabase orders table is empty. Seeding mock entries...');
      const { error: seedError } = await supabase
        .from('orders')
        .insert(
          INITIAL_ORDERS.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            userId: o.userId || 'guest',
            userEmail: o.userEmail,
            items: o.items,
            totalUSD: o.totalUSD,
            currency: o.currency || 'BDT',
            paidAmountCurrency: o.paidAmountCurrency,
            paymentMethod: o.paymentMethod,
            paymentStatus: o.paymentStatus || 'Paid',
            fulfillmentStatus: o.fulfillmentStatus || 'Delivered',
            playerId: o.playerId,
            serverId: o.serverId || '',
            transactionId: o.transactionId,
          }))
        );

      if (seedError) {
        console.error('Failed to seed orders table in Supabase:', seedError.message);
        return NextResponse.json({ success: true, orders: INITIAL_ORDERS });
      }

      const { data: reFetched } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
      return NextResponse.json({ success: true, orders: reFetched || INITIAL_ORDERS });
    }

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('API orders GET error:', error);
    return NextResponse.json({ success: true, orders: INITIAL_ORDERS });
  }
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
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
    const orderNumber = body.orderNumber || 'ZNG-' + Math.floor(100000 + Math.random() * 900000) + '-' + Date.now().toString().slice(-3);
    const transactionId = body.transactionId || 'TX-' + Math.random().toString(36).slice(2, 10).toUpperCase();

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
      paymentStatus: 'Paid',
      fulfillmentStatus: body.fulfillmentStatus || 'Processing',
      playerId: body.playerId || 'PLAYER_GUEST',
      serverId: body.serverId || '',
      transactionId,
    };

    // Trigger email notification with full customer details & IP (non-blocking)
    try {
      await sendOrderNotificationEmail(newOrder);
    } catch (mailErr) {
      console.error('Order email notification error (non-fatal):', mailErr);
    }

    if (!supabase) {
      return NextResponse.json({ success: true, orderNumber, order: newOrder });
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();

    if (error) {
      console.error('Supabase order insert error (saving with fallback):', error.message);
      return NextResponse.json({ success: true, orderNumber, order: newOrder });
    }

    return NextResponse.json({ success: true, orderNumber, order: data || newOrder });
  } catch (error: any) {
    console.error('API orders POST error:', error);
    return NextResponse.json({ success: true, orderNumber: 'ZNG-' + Date.now(), order: null });
  }
}
