import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { INITIAL_TICKETS } from '@/data/initialData';

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ success: true, tickets: INITIAL_TICKETS });
    }

    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*')
      .order('updatedAt', { ascending: false });

    if (error) {
      console.warn('Supabase query error (likely table not created yet):', error.message);
      return NextResponse.json({ success: true, tickets: INITIAL_TICKETS });
    }

    // Auto-seed if empty
    if (!tickets || tickets.length === 0) {
      console.log('Supabase tickets table is empty. Seeding mock support tickets...');
      const { error: seedError } = await supabase
        .from('tickets')
        .insert(
          INITIAL_TICKETS.map((t) => ({
            id: t.id,
            ticketNumber: t.ticketNumber,
            userId: t.userId || 'guest',
            userEmail: t.userEmail,
            subject: t.subject,
            category: t.category,
            status: t.status || 'Open',
            priority: t.priority || 'Medium',
            messages: t.messages,
          }))
        );

      if (seedError) {
        console.error('Failed to seed tickets table in Supabase:', seedError.message);
        return NextResponse.json({ success: true, tickets: INITIAL_TICKETS });
      }

      const { data: reFetched } = await supabase.from('tickets').select('*').order('updatedAt', { ascending: false });
      return NextResponse.json({ success: true, tickets: reFetched || INITIAL_TICKETS });
    }

    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    console.error('API tickets GET error:', error);
    return NextResponse.json({ success: true, tickets: INITIAL_TICKETS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const id = body.id || 'tkt_' + Date.now();
    const ticketNumber = body.ticketNumber || 'TCK-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);

    const newTicket = {
      id,
      ticketNumber,
      userId: body.userId || 'guest',
      userEmail: body.userEmail || 'guest@zenvo.gg',
      subject: body.subject || 'Support Request',
      category: body.category || 'General Query',
      status: body.status || 'Open',
      priority: body.priority || 'Medium',
      messages: body.messages || [],
    };

    if (!supabase) {
      return NextResponse.json({ success: true, ticketNumber, ticket: newTicket });
    }

    const { data, error } = await supabase
      .from('tickets')
      .insert([newTicket])
      .select()
      .single();

    if (error) {
      console.error('Supabase ticket insert error:', error.message);
      return NextResponse.json({ success: true, ticketNumber, ticket: newTicket });
    }

    return NextResponse.json({ success: true, ticketNumber, ticket: data });
  } catch (error: any) {
    console.error('API tickets POST error:', error);
    return NextResponse.json({ success: true, ticketNumber: 'TCK-' + Date.now(), ticket: null });
  }
}
