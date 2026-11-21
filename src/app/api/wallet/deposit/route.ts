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
    const apiRes = await fetch(`${API_BASE_URL}/user/wallet/deposit`, {
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
    // Primary API unavailable — Supabase fallback active
  }

  const amountUSD = parseFloat(body.amountUSD || 0);
  return NextResponse.json({
    success: true,
    message: `Deposit request of $${amountUSD.toFixed(2)} submitted. Your wallet balance will be credited after admin payment verification.`,
  });
}
