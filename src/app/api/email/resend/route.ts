/**
 * /api/email/resend — Resend Order Invoice Receipt API
 *
 * Re-dispatches the official order confirmation and invoice email to the customer and admin.
 */

import { NextResponse } from 'next/server';
import { sendOrderNotificationEmail, parseOrderData } from '@/lib/resend';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let order = body.order;

    if (!order && body.orderId) {
      if (supabaseAdmin) {
        const { data: dbOrder } = await supabaseAdmin
          .from('orders')
          .select('*')
          .or(`id.eq.${body.orderId},orderNumber.eq.${body.orderId}`)
          .maybeSingle();

        if (dbOrder) {
          order = dbOrder;
        }
      }
    }

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order data or valid orderId is required' }, { status: 400 });
    }

    const parsed = parseOrderData(order);
    const result = await sendOrderNotificationEmail(order);

    return NextResponse.json({
      success: true,
      message: `Order invoice #${parsed.orderNum} sent successfully to ${parsed.customerEmail || 'admin'}!`,
      result,
      orderDetails: {
        orderNumber: parsed.orderNum,
        totalUSD: parsed.totalUSD,
        totalBDT: parsed.totalBDT,
        customerEmail: parsed.customerEmail,
        fulfillmentStatus: parsed.fulfillmentStatus,
        paymentStatus: parsed.paymentStatus,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to resend order email' },
      { status: 500 }
    );
  }
}
