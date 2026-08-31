/**
 * /api/banners — Hero Banner listing and management API
 * Proxies to backend https://api-zenov.bornobyte.com/api/banners
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { getAuthHeaders } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiRes = await fetch(`${API_BASE_URL}/banners`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      return NextResponse.json(data);
    }
  } catch (err: any) {
    console.warn('[API Proxy /banners GET] Error fetching banners:', err?.message || err);
  }

  return NextResponse.json({
    success: true,
    banners: [],
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
    const apiRes = await fetch(`${API_BASE_URL}/banners`, {
      method: 'POST',
      headers: getAuthHeaders(request),
      body: JSON.stringify(body),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      return NextResponse.json(data);
    }
  } catch (err: any) {
    console.warn('[API Proxy /banners POST] Error saving banner:', err?.message || err);
  }

  return NextResponse.json({
    success: true,
    banner: { id: 'banner_' + Date.now(), ...body },
  });
}
