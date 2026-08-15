import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ success: false, message: 'Supabase not connected' }, { status: 503 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('tickets')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Try fallback to check by ticketNumber as well
      const { data: altData, error: altError } = await supabase
        .from('tickets')
        .update(body)
        .eq('ticketNumber', id)
        .select()
        .single();
      
      if (altError) throw altError;
      return NextResponse.json({ success: true, ticket: altData });
    }

    return NextResponse.json({ success: true, ticket: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
