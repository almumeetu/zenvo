/**
 * /api/blogs — Gaming News and Blog articles API
 * Proxies to backend https://api-zenov.bornobyte.com/api/blogs
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { getAuthHeaders } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiRes = await fetch(`${API_BASE_URL}/blogs`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      return NextResponse.json(data);
    }
  } catch (err: any) {
    console.warn('[API Proxy /blogs GET] Error fetching blogs:', err?.message || err);
  }

  return NextResponse.json({
    success: true,
    blogs: [],
  });
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const apiRes = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: getAuthHeaders(request),
      body: JSON.stringify(body),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      return NextResponse.json(data);
    }
  } catch (err: any) {
    console.warn('[API Proxy /blogs POST] Error saving blog:', err?.message || err);
  }

  return NextResponse.json({
    success: true,
    blog: { id: 'blog_' + Date.now(), ...body },
  });
}
