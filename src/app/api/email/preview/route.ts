/**
 * /api/email/preview — Live HTML Email Template Preview API
 *
 * Allows viewing real rendered order confirmation invoices in HTML format.
 * Usage:
 *   GET /api/email/preview               -> Renders realistic sample order email
 *   GET /api/email/preview?orderId=...   -> Renders specific order email from database
 */

import { NextResponse } from 'next/server';
import { generateOrderEmailHtml } from '@/lib/resend';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const SAMPLE_ORDER = {
  id: 'ord_sample_preview',
  orderNumber: 'ZNG-894102-BST',
  customerName: 'Saikat Hossain',
  customerEmail: 'almumeetu@gmail.com',
  customerPhone: '+880 1712-345678',
  senderNumber: '01712345678',
  playerId: '2849104820',
  serverId: 'Asia / 2045',
  paymentMethod: 'bKash',
  transactionId: 'TXN-9B7K2M91X',
  paymentStatus: 'Paid',
  fulfillmentStatus: 'Delivered',
  ipAddress: '103.145.78.22',
  notes: JSON.stringify({
    customerName: 'Saikat Hossain',
    customerPhone: '+880 1712-345678',
    senderNumber: '01712345678',
    ipAddress: '103.145.78.22',
    adminNotes: 'Direct UID recharge completed instantly via API Gateway. In-game mailbox credited.',
  }),
  createdAt: new Date().toISOString(),
  currency: 'BDT',
  totalUSD: 8.50,
  paidAmountCurrency: 1020,
  items: [
    {
      productId: 'prod_ff_diamond',
      productTitle: 'Free Fire Diamonds Top-Up',
      productImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400',
      quantity: 1,
      denomination: {
        id: 'ff-520',
        name: '520 + 52 Bonus Diamonds',
        amount: 4.50,
        priceBDT: 540,
        bonus: '+52 Diamonds',
      },
      playerId: '2849104820',
      serverId: 'Asia / 2045',
    },
    {
      productId: 'prod_mlbb',
      productTitle: 'Mobile Legends: Bang Bang',
      productImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=400',
      quantity: 2,
      denomination: {
        id: 'ml-weekly',
        name: 'Weekly Diamond Pass',
        amount: 2.00,
        priceBDT: 240,
      },
      playerId: '2849104820',
      serverId: 'Zone 2045',
    },
  ],
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId') || searchParams.get('orderNumber') || searchParams.get('q');

    let orderData = SAMPLE_ORDER;

    if (orderId && supabaseAdmin) {
      const { data: dbOrder } = await supabaseAdmin
        .from('orders')
        .select('*')
        .or(`id.eq.${orderId},orderNumber.eq.${orderId}`)
        .maybeSingle();

      if (dbOrder) {
        orderData = dbOrder;
      }
    }

    const html = generateOrderEmailHtml(orderData);

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to render email preview' },
      { status: 500 }
    );
  }
}
