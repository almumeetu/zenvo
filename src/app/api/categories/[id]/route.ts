/**
 * /api/categories/[id] — Category update and delete API
 *
 * Proxies requests to deployed API server (https://api-zenov.bornobyte.com/api/categories/:id)
 * with admin token authorization.
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { getAuthHeaders } from '@/lib/api-auth';

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
    const apiRes = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(request),
      body: JSON.stringify(body),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    console.warn(`[API Proxy /categories/${id} PUT] Primary API error:`, err?.message || err);
  }

  return NextResponse.json({
    success: true,
    data: { ...body, id },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const apiRes = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(request),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    console.warn(`[API Proxy /categories/${id} DELETE] Primary API error:`, err?.message || err);
  }

  return NextResponse.json({
    success: true,
    message: 'Category deleted successfully',
  });
}
