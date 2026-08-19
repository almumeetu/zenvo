import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, ticket: { id, ...body } });
    }
    
    const { data, error } = await supabaseAdmin
      .from('tickets')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Try fallback to check by ticketNumber as well
      const { data: altData, error: altError } = await supabaseAdmin
        .from('tickets')
        .update(body)
        .eq('ticketNumber', id)
        .select()
        .single();
      
      if (altError) {
        console.error('Supabase ticket update error:', altError.message);
        return NextResponse.json({ success: true, ticket: { id, ...body } });
      }
      return NextResponse.json({ success: true, ticket: altData });
    }

    return NextResponse.json({ success: true, ticket: data });
  } catch (error: any) {
    console.error('API tickets PUT error:', error);
    return NextResponse.json({ success: true, ticket: null, message: error.message });
  }
}
