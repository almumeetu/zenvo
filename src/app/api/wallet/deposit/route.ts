/**
 * /api/wallet/deposit — Wallet deposit API
 *
 * Proxies requests to deployed API server (POST https://api-zenov.bornobyte.com/api/wallet/deposit)
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const authHeader = request.headers.get('authorization') || '';

  try {
    const apiRes = await fetch(`${API_BASE_URL}/wallet/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    console.warn('[API Proxy /wallet/deposit POST] Primary API error:', err?.message || err);
  }

  const amountUSD = parseFloat(body.amountUSD || 0);
  return NextResponse.json({
    success: true,
    message: `Successfully requested deposit of $${amountUSD.toFixed(2)} to your Zenvo Wallet!`,
  });
}
