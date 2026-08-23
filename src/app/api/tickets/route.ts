/**
 * /api/tickets — Support ticket creation and listing API
 *
 * Proxies to deployed API server (https://api-zenov.bornobyte.com/api/tickets)
 * with automatic fallback to Supabase Admin and Resend email.
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { supabaseAdmin } from '@/lib/supabase-server';
import { sendContactUsEmail } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiRes = await fetch(`${API_BASE_URL}/tickets`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && Array.isArray(data.tickets)) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    console.warn('[API Proxy /tickets GET] Primary API error, using Supabase fallback:', err?.message || err);
  }

  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, tickets: [] });
    }

    const { data: tickets, error } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .order('updatedAt', { ascending: false });

    if (error) {
      return NextResponse.json({ success: true, tickets: [] });
    }

    return NextResponse.json({ success: true, tickets: tickets ?? [] });
  } catch (error: any) {
    return NextResponse.json({ success: true, tickets: [] });
  }
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const apiRes = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    console.warn('[API Proxy /tickets POST] Primary API error, using Supabase fallback:', err?.message || err);
  }

  try {
    const id = body.id || 'tkt_' + Date.now();
    const ticketNumber =
      body.ticketNumber ||
      'TCK-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);

    const newTicket = {
      id,
      ticketNumber,
      userId: body.userId || 'guest',
      userEmail: body.userEmail || 'guest@zenov.gg',
      userName: body.userName || 'Gamer',
      subject: body.subject || 'Support Request',
      category: body.category || 'General Query',
      status: body.status || 'Open',
      priority: body.priority || 'Medium',
      messages: body.messages || [],
    };

    try {
      await sendContactUsEmail(newTicket);
    } catch (mailErr: any) {
      console.error('[API /tickets POST] Email notification exception:', mailErr?.message || mailErr);
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, ticketNumber, ticket: newTicket });
    }

    const { data, error } = await supabaseAdmin
      .from('tickets')
      .insert([newTicket])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: true, ticketNumber, ticket: newTicket });
    }

    return NextResponse.json({ success: true, ticketNumber, ticket: data || newTicket });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message, ticketNumber: 'TCK-' + Date.now() },
      { status: 500 }
    );
  }
}
