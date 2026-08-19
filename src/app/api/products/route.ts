/**
 * /api/products — Public product catalog API
 *
 * Uses the SERVICE ROLE key (supabaseAdmin) so that:
 *  - All products added by the admin panel are visible, regardless of
 *    any Row Level Security (RLS) anon-role restrictions.
 *  - There is no silent empty-array response caused by missing SELECT policies.
 *
 * force-dynamic prevents Next.js from caching this response, ensuring the
 * latest products are always served after admin edits.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// Never cache this route — always fetch fresh data from Supabase
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      console.warn('[API /products] supabaseAdmin is not initialized. Check SUPABASE_SERVICE_ROLE_KEY in env vars.');
      return NextResponse.json({ success: true, products: [] });
    }

    let { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*');

    if (error) {
      console.warn('[API /products] Supabase select error:', error.message);
      return NextResponse.json({ success: false, products: [], message: error.message }, { status: 500 });
    }

    // Sort in JS if created_at or createdAt exists
    const sortedProducts = (products ?? []).sort((a: any, b: any) => {
      const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
      const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({ success: true, products: sortedProducts });
  } catch (error: any) {
    console.error('[API /products] Unexpected error:', error);
    return NextResponse.json({ success: false, products: [], message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!supabaseAdmin) {
      console.warn('[API /products POST] supabaseAdmin is not initialized. Product not saved to DB.');
      return NextResponse.json({ success: false, product: null, message: 'Database not configured. Check SUPABASE_SERVICE_ROLE_KEY.' }, { status: 503 });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('[API /products POST] Supabase insert error:', error.message, error.details);
      return NextResponse.json({ success: false, product: null, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error: any) {
    console.error('[API /products POST] Unexpected error:', error);
    return NextResponse.json({ success: false, product: null, message: error.message }, { status: 500 });
  }
}
