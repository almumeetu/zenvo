/**
 * /api/tickets — Support ticket creation and listing
 *
 * Uses supabaseAdmin (service role) for reliable read/write access.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { sendContactUsEmail } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      console.warn('[API /tickets GET] supabaseAdmin is not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
      return NextResponse.json({ success: true, tickets: [] });
    }

    const { data: tickets, error } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .order('updatedAt', { ascending: false });

    if (error) {
      console.error('[API /tickets GET] Supabase query error:', error.message);
      return NextResponse.json({ success: true, tickets: [] });
    }

    return NextResponse.json({ success: true, tickets: tickets ?? [] });
  } catch (error: any) {
    console.error('[API /tickets GET] Unexpected error:', error);
    return NextResponse.json({ success: true, tickets: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

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

    // Send email notification (non-blocking)
    try {
      const emailResult = await sendContactUsEmail(newTicket);
      if (!emailResult.success) {
        console.error('[API /tickets POST] Contact email failed. Resend error:', JSON.stringify(emailResult.error || emailResult.message));
      }
    } catch (mailErr: any) {
      console.error('[API /tickets POST] Contact email threw an exception:', mailErr?.message || mailErr);
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
      console.error('[API /tickets POST] Supabase insert error:', error.message);
      return NextResponse.json({ success: true, ticketNumber, ticket: newTicket });
    }

    return NextResponse.json({ success: true, ticketNumber, ticket: data || newTicket });
  } catch (error: any) {
    console.error('[API /tickets POST] Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: error.message, ticketNumber: 'TCK-' + Date.now() },
      { status: 500 }
    );
  }
}
