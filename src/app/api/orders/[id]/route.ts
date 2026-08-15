import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!supabase) {
      return NextResponse.json({ success: true, order: { id, ...body } });
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Try fallback to check by orderNumber as well
      const { data: altData, error: altError } = await supabase
        .from('orders')
        .update(body)
        .eq('orderNumber', id)
        .select()
        .single();
      
      if (altError) {
        console.error('Supabase order update error:', altError.message);
        return NextResponse.json({ success: true, order: { id, ...body } });
      }
      return NextResponse.json({ success: true, order: altData });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error: any) {
    console.error('API orders PUT error:', error);
    return NextResponse.json({ success: true, order: null, message: error.message });
  }
}
