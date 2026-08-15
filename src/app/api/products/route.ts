import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { INITIAL_PRODUCTS } from '@/data/initialData';

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ success: true, products: INITIAL_PRODUCTS });
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Supabase query error (likely table not created yet):', error.message);
      return NextResponse.json({ success: true, products: INITIAL_PRODUCTS });
    }

    // Auto-seed if empty
    if (!products || products.length === 0) {
      console.log('Supabase products table is empty. Auto-seeding...');
      const { error: seedError } = await supabase
        .from('products')
        .insert(
          INITIAL_PRODUCTS.map((p) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            image: p.image,
            bannerImage: p.bannerImage || '',
            publisher: p.publisher || '',
            region: p.region || 'US / Global',
            deliveryType: p.deliveryType,
            inStock: p.inStock,
            isHot: p.isHot || false,
            isNew: p.isNew || false,
            discountPercent: p.discountPercent || 0,
            rating: p.rating,
            reviewCount: p.reviewCount,
            description: p.description,
            instructions: p.instructions,
            playerIdLabel: p.playerIdLabel,
            playerIdPlaceholder: p.playerIdPlaceholder || '',
            howToFindPlayerId: p.howToFindPlayerId || [],
            hasServerId: p.hasServerId || false,
            requiresServerId: p.requiresServerId || false,
            serverIdLabel: p.serverIdLabel || '',
            denominations: p.denominations,
            tags: p.tags,
          }))
        );

      if (seedError) {
        console.error('Failed to seed Supabase database:', seedError.message);
        return NextResponse.json({ success: true, products: INITIAL_PRODUCTS });
      }

      // Fetch again after seeding
      const { data: reFetched } = await supabase.from('products').select('*').order('id', { ascending: true });
      return NextResponse.json({ success: true, products: reFetched || INITIAL_PRODUCTS });
    }

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('API products error:', error);
    return NextResponse.json({ success: true, products: INITIAL_PRODUCTS });
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
      return NextResponse.json({ success: true, product: body });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error: any) {
    console.error('API product POST error:', error);
    return NextResponse.json({ success: true, product: null, message: error.message });
  }
}
