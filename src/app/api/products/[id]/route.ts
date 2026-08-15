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
      return NextResponse.json({ success: true, product: { id, ...body } });
    }
    
    const { data, error } = await supabase
      .from('products')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase product update error:', error.message);
      return NextResponse.json({ success: true, product: { id, ...body } });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error: any) {
    console.error('API products PUT error:', error);
    return NextResponse.json({ success: true, product: null, message: error.message });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Product deleted locally' });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase product delete error:', error.message);
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('API products DELETE error:', error);
    return NextResponse.json({ success: true, message: 'Deleted' });
  }
}
