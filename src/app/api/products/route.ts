import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { INITIAL_PRODUCTS } from '@/data/initialData';

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ success: true, products: [] });
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Supabase query error (products table may not exist):', error.message);
      return NextResponse.json({ success: true, products: [] });
    }

    return NextResponse.json({ success: true, products: products || [] });
  } catch (error: any) {
    console.error('API products GET error:', error);
    return NextResponse.json({ success: true, products: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!supabase) {
      return NextResponse.json({ success: true, product: body });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Supabase product insert error:', error.message);
      return NextResponse.json({ success: false, product: null, message: error.message });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error: any) {
    console.error('API product POST error:', error);
    return NextResponse.json({ success: false, product: null, message: error.message });
  }
}
