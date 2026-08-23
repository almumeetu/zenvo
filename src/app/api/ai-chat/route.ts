/**
 * /api/ai-chat — AI Support Assistant API
 *
 * Proxies requests to deployed API server (POST https://api-zenov.bornobyte.com/api/ai-chat)
 * with automatic fallback response if backend AI service is unavailable.
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

  try {
    const apiRes = await fetch(`${API_BASE_URL}/ai-chat`, {
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
    console.warn('[API Proxy /ai-chat POST] Primary API error, using intelligent fallback:', err?.message || err);
  }

  // Fallback AI response
  const userMsg = (body.message || '').toLowerCase();
  let reply = "Hello! I am ZENOV Support AI. How can I assist you with your game top-ups, orders, or wallet today?";

  if (userMsg.includes('order') || userMsg.includes('track') || userMsg.includes('status')) {
    reply = "You can track your order live using the 'Track Order' option in the header or in your Account Dashboard using your Order Number (e.g. ZNG-XXXXXX).";
  } else if (userMsg.includes('wallet') || userMsg.includes('deposit') || userMsg.includes('bkash') || userMsg.includes('nagad')) {
    reply = "You can deposit funds into your ZENOV Wallet via bKash, Nagad, Rocket, Bank Transfer, or Crypto/USDT. Go to your Account -> Wallet tab to start!";
  } else if (userMsg.includes('pubg') || userMsg.includes('free fire') || userMsg.includes('game')) {
    reply = "We offer instant top-ups for PUBG Mobile, Free Fire, Mobile Legends, Roblox, Steam, and PlayStation! Select your game from the homepage to view denominations.";
  }

  return NextResponse.json({ success: true, reply });
}
