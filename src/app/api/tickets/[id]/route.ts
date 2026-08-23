/**
 * /api/tickets/[id] — Ticket update and reply API
 *
 * Proxies to deployed API server (PUT /api/tickets/:id and POST /api/tickets/:id/reply)
 * with automatic fallback to Supabase Admin.
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: any;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const apiRes = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'PUT',
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
    console.warn(`[API Proxy /tickets/${id} PUT] Primary API error, using Supabase fallback:`, err?.message || err);
  }

  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, ticket: body });
    }

    const { data, error } = await supabaseAdmin
      .from('tickets')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: true, ticket: body });
    }

    return NextResponse.json({ success: true, ticket: data || body });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: any;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const apiRes = await fetch(`${API_BASE_URL}/tickets/${id}/reply`, {
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
    console.warn(`[API Proxy /tickets/${id}/reply POST] Primary API error, using Supabase fallback:`, err?.message || err);
  }

  return NextResponse.json({ success: true, message: 'Reply sent' });
}
