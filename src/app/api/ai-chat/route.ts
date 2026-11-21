/**
 * /api/ai-chat — AI Support Assistant API
 *
 * Proxies requests to deployed API server (POST https://api-zenov.bornobyte.com/api/ai-chat)
 * with an intelligent offline knowledge base supporting English, Bengali & Banglish queries.
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

function generateSmartFallbackReply(message: string): string {
  const q = (message || '').toLowerCase().trim();

  // 1. Human / Admin Handover queries
  if (
    q.includes('admin') ||
    q.includes('agent') ||
    q.includes('human') ||
    q.includes('support team') ||
    q.includes('manush') ||
    q.includes('kotha bolbo') ||
    q.includes('helpline') ||
    q.includes('call')
  ) {
    return `🎧 **Connect with Live Admin Support**:
You can speak directly with our human support team right now!
• Click the **"Live Admin Chat"** tab at the top of this window.
• Type your inquiry or Order ID (e.g. \`ZNG-10492\`).
• An active Zenvo Support Admin will reply directly to your chat!
• You can also open an official ticket at **/support**.`;
  }

  // 2. Free Fire queries
  if (
    q.includes('free fire') ||
    q.includes('ff') ||
    q.includes('diamond') ||
    q.includes('weekly') ||
    q.includes('monthly')
  ) {
    return `💎 **Free Fire (FF) Top-Up Guide**:
1. Select **Free Fire** from the home page or shop catalog.
2. Choose your diamond package (e.g. 115, 240, 610, 1240 Diamonds, or Weekly/Monthly Pass).
3. Enter your in-game **Player ID (UID)** accurately.
4. Pay instantly using **bKash, Nagad, Rocket, or Zenvo Wallet**.
⚡ **Delivery**: Automated delivery in **15 to 30 seconds** directly to your game account!`;
  }

  // 3. PUBG Mobile queries
  if (
    q.includes('pubg') ||
    q.includes('uc') ||
    q.includes('royale pass')
  ) {
    return `⚡ **PUBG Mobile UC Top-Up**:
• **Instant UC Delivery**: 60 UC, 325 UC, 660 UC, 1800 UC & Royale Pass!
• Enter your numeric **Character ID (UID)** at checkout.
• No game password or account login required!
• Pay via bKash, Nagad, Rocket, Bank or Crypto (USDT). Delivery time is under 1 minute.`;
  }

  // 4. Mobile Legends / MLBB
  if (
    q.includes('mobile legends') ||
    q.includes('mlbb') ||
    q.includes('starlight')
  ) {
    return `⚔️ **Mobile Legends: Bang Bang (MLBB)**:
• Diamonds & Starlight Memberships delivered via **User ID + Zone ID** (found in your in-game profile).
• Delivery is instant and 100% authorized by Moonton.`;
  }

  // 5. Gift Cards & Keys (Steam, PlayStation, Xbox, Apple)
  if (
    q.includes('steam') ||
    q.includes('psn') ||
    q.includes('playstation') ||
    q.includes('xbox') ||
    q.includes('gift card') ||
    q.includes('card')
  ) {
    return `🎮 **Digital Gift Cards & Game Keys**:
• **Steam Wallet**: Global & Region-specific USD / BDT codes.
• **PlayStation (PSN)**: US, UK & UAE region vouchers with instant digital codes.
• **Xbox**: Game Pass Ultimate and wallet gift cards.
Digital codes are displayed immediately on the Order Confirmation page and sent to your email.`;
  }

  // 6. Order Tracking & Status / Delays
  if (
    q.includes('order') ||
    q.includes('track') ||
    q.includes('status') ||
    q.includes('delay') ||
    q.includes('asheni') ||
    q.includes('painai') ||
    q.includes('pai nai') ||
    q.includes('koto khon') ||
    q.includes('late')
  ) {
    return `📦 **Order Status & Tracking**:
• Go to **/orders/track** and paste your Order Number (e.g. \`ZNG-XXXXXX\`).
• If your payment was completed and order status is **Processing**, it typically completes within **1-3 minutes**.
• If you need immediate investigation, switch to the **"Live Admin Chat"** tab above and send your Order ID!`;
  }

  // 7. Payment methods & bKash / Nagad
  if (
    q.includes('bkash') ||
    q.includes('nagad') ||
    q.includes('rocket') ||
    q.includes('payment') ||
    q.includes('pay') ||
    q.includes('taka') ||
    q.includes('dollar') ||
    q.includes('rate') ||
    q.includes('kivabe kinbo') ||
    q.includes('kivabe nibo')
  ) {
    return `💳 **Payment Methods & Instructions**:
We support local & global zero-fee payment gateways:
• 📱 **bKash & Nagad**: Instant automated verification. Send money or pay to our verified merchant number and provide TrxID.
• 🏦 **Rocket & Local Bank Transfer**: City Bank, BRAC Bank, Eastern Bank.
• 👛 **Zenvo Wallet**: 1-click checkout with VIP cashbacks.
• ₿ **Crypto (USDT / TRC20 / BEP20)** for international gamers.`;
  }

  // 8. Refund policy
  if (
    q.includes('refund') ||
    q.includes('ferot') ||
    q.includes('cancel') ||
    q.includes('money back')
  ) {
    return `🛡️ **Refund & Buyer Protection**:
• If a digital code is invalid or a game top-up fails verification, our automated system issues a **100% refund** to your Zenvo Wallet or original payment method within 1 hour.
• For immediate refund assistance, switch to the **Live Admin Chat** tab!`;
  }

  // 9. VIP tiers & discounts
  if (
    q.includes('vip') ||
    q.includes('tier') ||
    q.includes('discount') ||
    q.includes('promo') ||
    q.includes('coupon')
  ) {
    return `👑 **VIP Tiers & Exclusive Cashbacks**:
• **Bronze**: Default level, 1% cashback on every top-up.
• **Silver**: $100 spent, 2% cashback + priority delivery queue.
• **Gold**: $500 spent, 3% cashback + dedicated WhatsApp/Live support.
• **Cyber Elite**: $2,000 spent, 5% cashback + zero-fee top-ups & exclusive gifts!
Use promo code **ZENOV2026** at checkout for up to 20% discount on select games.`;
  }

  // Default friendly gaming concierge response
  return `👋 **ZENOV Cyber AI Assistant**:
I can help you with anything on ZENOV Games!
• **Free Fire & PUBG top-ups** (packages, pricing & instant UID delivery)
• **Live order tracking** & delivery troubleshooting
• **Payment methods** (bKash, Nagad, Rocket, USDT, Cards)
• **Digital gift cards** (Steam, PlayStation, Xbox, Apple)

*Need a human agent? Click the **"Live Admin Chat"** tab above to speak with our support desk right now!*`;
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // 1. Try primary backend API server
  try {
    const apiRes = await fetch(`${API_BASE_URL}/ai-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && data.reply) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    // Fall back to intelligent local engine
  }

  // 2. Intelligent fallback engine
  const reply = generateSmartFallbackReply(body.message || '');
  return NextResponse.json({ success: true, reply });
}
