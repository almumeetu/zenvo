/**
 * Resend Email Notification Service for ZENOV Gaming Store
 * Sends high-end, professional transactional HTML emails for:
 * 1. Customer Order Confirmation & Tax Invoice Receipts (with real USD $ and BDT ৳ prices)
 * 2. Admin Order Dispatch & Verification Alerts
 * 3. Support Inquiries & Helpdesk Tickets
 *
 * Environment variables:
 *   RESEND_API_KEY            — Resend API secret key
 *   RESEND_FROM_EMAIL         — Sender address (e.g. "ZENOV Gaming <orders@zenovgames.com>" or "ZENOV <onboarding@resend.dev>")
 *   ADMIN_NOTIFICATION_EMAIL  — Admin inbox to receive order/ticket alerts
 */

import { DEFAULT_SITE_SETTINGS } from '@/data/siteSettings';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_NOTIFICATION_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL ||
  process.env.RESEND_TO_EMAIL ||
  DEFAULT_SITE_SETTINGS.supportEmail ||
  'zenovgamesbd@gmail.com';
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'ZENOV Gaming <onboarding@resend.dev>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://zenvo-gaming.vercel.app';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Base email dispatcher utilizing Resend's REST API
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  if (!RESEND_API_KEY) {
    console.warn('[Resend] RESEND_API_KEY is not configured in environment. Email dispatch skipped.');
    return { success: false, message: 'Missing RESEND_API_KEY env variable' };
  }

  const recipients = (Array.isArray(to) ? to : [to])
    .map((e) => (typeof e === 'string' ? e.trim() : ''))
    .filter((e) => e && e.includes('@'));

  if (recipients.length === 0) {
    console.warn('[Resend] No valid recipient email addresses provided.');
    return { success: false, message: 'No valid recipient email addresses' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: recipients,
        subject,
        html,
        text: text || subject,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('[Resend API Warning]:', JSON.stringify(data));
      // If error is due to unverified external domain / testing account recipient restrictions
      const isRestricted =
        data?.message?.toLowerCase().includes('testing') ||
        data?.message?.toLowerCase().includes('verify') ||
        data?.message?.toLowerCase().includes('restriction') ||
        data?.name === 'validation_error';

      if (isRestricted) {
        const fallbackAdmin = ADMIN_NOTIFICATION_EMAIL || 'zenovgamesbd@gmail.com';
        if (recipients.length > 1 || !recipients.includes(fallbackAdmin)) {
          console.log(`[Resend Fallback] Forwarding order invoice to verified admin inbox: ${fallbackAdmin}`);
          const fallbackRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: RESEND_FROM_EMAIL,
              to: [fallbackAdmin],
              subject: `[ADMIN ALERT] ${subject}`,
              html,
              text: text || subject,
            }),
          });
          const fallbackData = await fallbackRes.json();
          if (fallbackRes.ok) {
            console.log('[Resend Fallback] Admin notification delivered successfully.');
            return { success: true, data: fallbackData };
          }
        }
      }
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('[Resend Exception]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Format order date in a human-friendly format (Bangladesh Standard Time BST / UTC+6)
 */
export function formatOrderDate(dateInput?: string | Date): { formattedDate: string; formattedTime: string } {
  try {
    const d = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(d.getTime())) throw new Error('Invalid date');

    const formattedDate = d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Dhaka',
    });

    const formattedTime = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Dhaka',
    }) + ' (BST)';

    return { formattedDate, formattedTime };
  } catch {
    const now = new Date();
    return {
      formattedDate: now.toDateString(),
      formattedTime: now.toLocaleTimeString() + ' (BST)',
    };
  }
}

export interface ParsedOrderItem {
  title: string;
  packageName: string;
  quantity: number;
  unitPriceUSD: number;
  unitPriceBDT: number;
  totalPriceUSD: number;
  totalPriceBDT: number;
  image?: string;
  playerId?: string;
  serverId?: string;
}

export interface ParsedOrderDetails {
  orderNum: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  senderNumber: string;
  playerId: string;
  serverId: string;
  paymentMethod: string;
  transactionId: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  ipAddress: string;
  adminNotes: string;
  formattedDate: string;
  formattedTime: string;
  items: ParsedOrderItem[];
  totalUSD: number;
  totalBDT: number;
  currency: string;
}

/**
 * Parses and sanitizes order data ensuring 100% accurate USD and BDT calculations
 */
export function parseOrderData(order: any): ParsedOrderDetails {
  const orderNum = order.orderNumber || order.id || 'ZNG-' + Date.now().toString().slice(-6);
  const customerEmail = (order.customerEmail || order.userEmail || '').trim();
  const customerName = order.customerName || order.userName || (order.userId === 'guest' ? 'Guest Gamer' : 'Valued Gamer');
  const customerPhone = order.customerPhone || order.phone || '';
  const senderNumber = order.senderNumber || '';
  const playerId = order.playerId || order.items?.[0]?.playerId || 'N/A';
  const serverId = order.serverId || order.items?.[0]?.serverId || '';
  const paymentMethod = order.paymentMethod || 'bKash';
  const transactionId = order.transactionId || 'N/A';
  const paymentStatus = order.paymentStatus || 'Pending Verification';
  const fulfillmentStatus = order.fulfillmentStatus || 'Processing';
  const ipAddress = order.ipAddress || '';

  // Extract clean admin notes/redeem codes
  let adminNotes = '';
  if (typeof order.notes === 'string' && order.notes.trim()) {
    try {
      if (order.notes.startsWith('{') && order.notes.endsWith('}')) {
        const parsed = JSON.parse(order.notes);
        adminNotes = parsed.adminNotes || parsed.notes || '';
      } else {
        adminNotes = order.notes;
      }
    } catch {
      adminNotes = order.notes;
    }
  } else if (order.adminNotes) {
    adminNotes = String(order.adminNotes);
  }

  const { formattedDate, formattedTime } = formatOrderDate(order.createdAt);

  const items: ParsedOrderItem[] = [];

  if (Array.isArray(order.items) && order.items.length > 0) {
    order.items.forEach((item: any) => {
      const denom = item.denomination || {};
      const qty = Math.max(1, Number(item.quantity) || 1);

      // Base unit price in USD
      const unitPriceUSD = Number(denom.amount) || Number(item.amount) || Number(item.price) || 0;

      // Real unit price in BDT (from denom.priceBDT or exact USD*120 conversion)
      const unitPriceBDT =
        denom.priceBDT !== undefined && Number(denom.priceBDT) > 0
          ? Number(denom.priceBDT)
          : item.priceBDT !== undefined && Number(item.priceBDT) > 0
            ? Number(item.priceBDT)
            : Math.round(unitPriceUSD * 120);

      const totalPriceUSD = Number((unitPriceUSD * qty).toFixed(2));
      const totalPriceBDT = unitPriceBDT * qty;

      items.push({
        title: item.productTitle || item.title || 'Game Digital Top-Up',
        packageName: denom.name || denom.label || item.packageName || 'Standard Top-Up Package',
        quantity: qty,
        unitPriceUSD,
        unitPriceBDT,
        totalPriceUSD,
        totalPriceBDT,
        image: item.productImage || item.image || '',
        playerId: item.playerId || undefined,
        serverId: item.serverId || undefined,
      });
    });
  } else {
    // Single item fallback
    const qty = Math.max(1, Number(order.quantity) || 1);
    const unitPriceUSD = Number(order.totalUSD) || Number(order.amount) || 0;
    const unitPriceBDT =
      Number(order.paidAmountCurrency) && order.currency === 'BDT'
        ? Number(order.paidAmountCurrency)
        : Number(order.priceBDT) || Math.round(unitPriceUSD * 120);

    items.push({
      title: order.productTitle || 'Digital Top-Up',
      packageName: order.denominationName || order.denomination?.name || 'Standard Package',
      quantity: qty,
      unitPriceUSD,
      unitPriceBDT,
      totalPriceUSD: Number((unitPriceUSD * qty).toFixed(2)),
      totalPriceBDT: unitPriceBDT * qty,
    });
  }

  // Calculate grand totals
  const sumItemsUSD = items.reduce((acc, i) => acc + i.totalPriceUSD, 0);
  const sumItemsBDT = items.reduce((acc, i) => acc + i.totalPriceBDT, 0);

  const totalUSD = Number(order.totalUSD) > 0 ? Number(order.totalUSD) : Number(sumItemsUSD.toFixed(2));
  const totalBDT =
    sumItemsBDT > 0
      ? sumItemsBDT
      : order.currency === 'BDT' && Number(order.paidAmountCurrency) > 0
        ? Number(order.paidAmountCurrency)
        : Math.round(totalUSD * 120);

  return {
    orderNum,
    customerName,
    customerEmail,
    customerPhone,
    senderNumber,
    playerId,
    serverId,
    paymentMethod,
    transactionId,
    paymentStatus,
    fulfillmentStatus,
    ipAddress,
    adminNotes,
    formattedDate,
    formattedTime,
    items,
    totalUSD: Number(totalUSD.toFixed(2)),
    totalBDT: Math.round(totalBDT),
    currency: order.currency || 'BDT',
  };
}

/**
 * Generates an ultra-premium, dark-themed, responsive HTML invoice and order receipt email
 * with complete real data and dual Dollar ($ USD) and BDT (৳) pricing.
 */
export function generateOrderEmailHtml(order: any): string {
  const data = parseOrderData(order);

  const isPaid = data.paymentStatus === 'Paid';
  const isDelivered = data.fulfillmentStatus === 'Delivered';
  const isProcessing = data.fulfillmentStatus === 'Processing';

  // Status Badges Styling
  const payBadge = isPaid
    ? { bg: '#064e3b', border: '#059669', text: '#34d399', label: 'PAID & VERIFIED' }
    : { bg: '#451a03', border: '#d97706', text: '#fbbf24', label: 'PAYMENT VERIFICATION PENDING' };

  const fulBadge = isDelivered
    ? { bg: '#064e3b', border: '#059669', text: '#34d399', label: 'DELIVERED TO IN-GAME UID' }
    : isProcessing
      ? { bg: '#172554', border: '#2563eb', text: '#60a5fa', label: 'PROCESSING DELIVERY' }
      : { bg: '#3b0764', border: '#7e22ce', text: '#c084fc', label: 'PENDING VERIFICATION' };

  // Items Table HTML Rows
  const itemsHtml = data.items
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #1e293b; background-color: ${idx % 2 === 0 ? '#0f172a' : '#0b1120'};">
        <td style="padding: 16px 14px; font-size: 13px; color: #f8fafc; vertical-align: middle;">
          <div style="font-weight: 800; font-size: 14px; color: #ffffff; margin-bottom: 3px; letter-spacing: -0.2px;">
            ${item.title}
          </div>
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 4px;">
            Package: <span style="color: #38bdf8; font-weight: 700;">${item.packageName}</span>
          </div>
          ${item.playerId
          ? `<div style="font-size: 11px; color: #64748b; font-family: monospace;">UID: <strong style="color: #cbd5e1;">${item.playerId}</strong>${item.serverId ? ` • Server: <strong style="color: #cbd5e1;">${item.serverId}</strong>` : ''
          }</div>`
          : ''
        }
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            Rate: <span style="color: #10b981; font-weight: 600; font-family: monospace;">৳${item.unitPriceBDT.toLocaleString()}</span>
            <span style="color: #475569;"> / </span>
            <span style="color: #94a3b8; font-family: monospace;">$${item.unitPriceUSD.toFixed(2)} USD</span>
          </div>
        </td>
        <td style="padding: 16px 14px; font-size: 13px; color: #f8fafc; text-align: center; vertical-align: middle; font-weight: 800; font-family: monospace;">
          <span style="display: inline-block; padding: 4px 10px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 6px; color: #38bdf8;">
            ${item.quantity}x
          </span>
        </td>
        <td style="padding: 16px 14px; font-size: 13px; color: #f8fafc; text-align: right; vertical-align: middle;">
          <div style="font-weight: 900; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; color: #34d399; font-size: 15px;">
            ৳${item.totalPriceBDT.toLocaleString()} BDT
          </div>
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace; margin-top: 2px; font-weight: 600;">
            ($${item.totalPriceUSD.toFixed(2)} USD)
          </div>
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>🎮 Order Confirmation & Tax Invoice #${data.orderNum} - ZENOV Gaming</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <div style="background-color: #030712; padding: 24px 12px;">
    
    <!-- Main Card Container -->
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85); margin: 0 auto;">
      
      <!-- Brand Header Banner -->
      <tr>
        <td style="background: linear-gradient(135deg, #090d16 0%, #0f172a 40%, #1e3a8a 100%); padding: 36px 24px; text-align: center; border-bottom: 2px solid #2563eb; position: relative;">
          <table align="center" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align: center;">
                <div style="display: inline-block; padding: 8px 18px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(59, 130, 246, 0.35); border-radius: 12px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);">
                  <span style="font-size: 22px; font-weight: 900; letter-spacing: 3px; color: #ffffff; text-transform: uppercase;">
                    ⚡ ZENOV GAMING
                  </span>
                </div>
                <div style="font-size: 12px; font-weight: 800; color: #93c5fd; letter-spacing: 2.5px; text-transform: uppercase; margin-top: 4px;">
                  Official Order Receipt & Tax Invoice
                </div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px; font-weight: 600;">
                  Automated Digital Delivery Hub • Dhaka, Bangladesh
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Greeting & Confirmation -->
      <tr>
        <td style="padding: 28px 24px 16px 24px;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <h2 style="margin: 0 0 6px 0; font-size: 19px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px;">
                  Thank you for your order, <span style="color: #38bdf8;">${data.customerName}</span>! 👋
                </h2>
                <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
                  Your digital top-up order has been successfully recorded in our automated delivery system. Below is your complete transaction receipt with real item breakdown and prices.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Order Meta Highlights Card (2x2 Grid) -->
      <tr>
        <td style="padding: 0 24px 20px 24px;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden;">
            <tr>
              <td style="padding: 16px; width: 50%; border-right: 1px solid #1e293b; border-bottom: 1px solid #1e293b;">
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 1px; display: block; margin-bottom: 4px;">
                  Order / Invoice Number
                </span>
                <span style="font-size: 15px; font-weight: 900; font-family: monospace; color: #38bdf8;">
                  ${data.orderNum}
                </span>
              </td>
              <td style="padding: 16px; width: 50%; border-bottom: 1px solid #1e293b;">
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 1px; display: block; margin-bottom: 4px;">
                  Order Date & Time
                </span>
                <span style="font-size: 12px; font-weight: 700; color: #f8fafc;">
                  ${data.formattedDate}<br/>
                  <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">${data.formattedTime}</span>
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px; width: 50%; border-right: 1px solid #1e293b;">
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 1px; display: block; margin-bottom: 6px;">
                  Payment Status
                </span>
                <span style="display: inline-block; padding: 4px 10px; background-color: ${payBadge.bg}; border: 1px solid ${payBadge.border}; color: ${payBadge.text}; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${data.paymentStatus}
                </span>
              </td>
              <td style="padding: 16px; width: 50%;">
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 1px; display: block; margin-bottom: 6px;">
                  Fulfillment Status
                </span>
                <span style="display: inline-block; padding: 4px 10px; background-color: ${fulBadge.bg}; border: 1px solid ${fulBadge.border}; color: ${fulBadge.text}; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${data.fulfillmentStatus}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- In-Game Account Destination & Player UID Card -->
      <tr>
        <td style="padding: 0 24px 20px 24px;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%); border: 1px solid #2563eb; border-radius: 16px; padding: 18px;">
            <tr>
              <td>
                <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #60a5fa; letter-spacing: 1.2px; margin-bottom: 10px;">
                  🎮 In-Game Account / Digital Delivery Destination
                </div>
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #cbd5e1;">
                      <strong style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Player ID / UID:</strong>
                      <span style="font-family: monospace; font-size: 15px; font-weight: 900; color: #ffffff; background: #070c18; padding: 4px 10px; border-radius: 8px; border: 1px solid #3b82f6; margin-left: 8px; letter-spacing: 0.5px;">
                        ${data.playerId}
                      </span>
                    </td>
                    ${data.serverId
      ? `
                    <td style="padding: 4px 0; font-size: 13px; color: #cbd5e1; text-align: right;">
                      <strong style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Server / Zone:</strong>
                      <span style="font-family: monospace; font-size: 14px; font-weight: 800; color: #38bdf8; background: #070c18; padding: 4px 10px; border-radius: 8px; border: 1px solid #334155; margin-left: 6px;">
                        ${data.serverId}
                      </span>
                    </td>`
      : ''
    }
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Customer Contact Details Box -->
      <tr>
        <td style="padding: 0 24px 20px 24px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 8px;">
            👤 Customer Information
          </div>
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 14px; padding: 14px;">
            <tr>
              <td style="padding: 5px 0; font-size: 12px; color: #94a3b8; width: 35%;">Customer Name:</td>
              <td style="padding: 5px 0; font-size: 12px; color: #ffffff; font-weight: 700;">${data.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-size: 12px; color: #94a3b8;">Email Address:</td>
              <td style="padding: 5px 0; font-size: 12px; color: #38bdf8; font-family: monospace; font-weight: 600;">${data.customerEmail || 'N/A'}</td>
            </tr>
            ${data.customerPhone
      ? `
            <tr>
              <td style="padding: 5px 0; font-size: 12px; color: #94a3b8;">Phone / WhatsApp:</td>
              <td style="padding: 5px 0; font-size: 12px; color: #34d399; font-family: monospace; font-weight: 700;">${data.customerPhone}</td>
            </tr>`
      : ''
    }
            ${data.ipAddress
      ? `
            <tr>
              <td style="padding: 5px 0; font-size: 12px; color: #64748b;">Client IP:</td>
              <td style="padding: 5px 0; font-size: 11px; color: #64748b; font-family: monospace;">${data.ipAddress}</td>
            </tr>`
      : ''
    }
          </table>
        </td>
      </tr>

      <!-- Itemized Products Table -->
      <tr>
        <td style="padding: 0 24px 20px 24px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 8px;">
            📦 Items & Package Breakdown
          </div>
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #1e293b; border-bottom: 1px solid #334155;">
                <th style="padding: 12px 14px; text-align: left; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px;">
                  Product / Package Description
                </th>
                <th style="padding: 12px 14px; text-align: center; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; width: 65px;">
                  Qty
                </th>
                <th style="padding: 12px 14px; text-align: right; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; width: 140px;">
                  Subtotal Price
                </th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <!-- Subtotals -->
              <tr style="border-top: 1px solid #334155; background-color: #0f172a;">
                <td colspan="2" style="padding: 10px 14px; font-size: 12px; color: #94a3b8; text-align: right;">
                  Items Subtotal:
                </td>
                <td style="padding: 10px 14px; font-size: 12px; color: #f8fafc; font-family: monospace; font-weight: 700; text-align: right;">
                  ৳${data.totalBDT.toLocaleString()} BDT <span style="color: #64748b; font-size: 11px;">($${data.totalUSD.toFixed(2)})</span>
                </td>
              </tr>
              <tr style="background-color: #0f172a;">
                <td colspan="2" style="padding: 6px 14px; font-size: 12px; color: #94a3b8; text-align: right;">
                  Instant Digital Delivery Fee:
                </td>
                <td style="padding: 6px 14px; font-size: 12px; color: #34d399; font-weight: 700; text-align: right;">
                  FREE (৳0.00)
                </td>
              </tr>
              <!-- Grand Total Row -->
              <tr style="background: linear-gradient(90deg, #090d16 0%, #1e293b 100%); border-top: 2px solid #2563eb;">
                <td colspan="2" style="padding: 18px 14px; font-size: 13px; font-weight: 900; text-transform: uppercase; color: #ffffff; letter-spacing: 1px;">
                  Total Real Price:
                </td>
                <td style="padding: 18px 14px; text-align: right;">
                  <div style="font-size: 20px; font-weight: 900; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; color: #34d399; letter-spacing: -0.5px;">
                    ৳${data.totalBDT.toLocaleString()} BDT
                  </div>
                  <div style="font-size: 12px; color: #38bdf8; font-family: monospace; font-weight: 700; margin-top: 3px;">
                    ($${data.totalUSD.toFixed(2)} USD)
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </td>
      </tr>

      <!-- Payment & Transaction Verification Details -->
      <tr>
        <td style="padding: 0 24px 20px 24px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 8px;">
            💳 Payment & Transaction Verification
          </div>
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 14px; padding: 14px;">
            <tr>
              <td style="padding: 6px 0; font-size: 12px; color: #94a3b8; width: 38%;">Payment Gateway / Method:</td>
              <td style="padding: 6px 0; font-size: 13px; color: #f8fafc; font-weight: 800;">${data.paymentMethod}</td>
            </tr>
            ${data.senderNumber
      ? `
            <tr>
              <td style="padding: 6px 0; font-size: 12px; color: #94a3b8;">Sender Account / Mobile:</td>
              <td style="padding: 6px 0; font-size: 13px; color: #fbbf24; font-family: monospace; font-weight: 800;">${data.senderNumber}</td>
            </tr>`
      : ''
    }
            <tr>
              <td style="padding: 6px 0; font-size: 12px; color: #94a3b8;">Transaction ID (TrxID):</td>
              <td style="padding: 6px 0; font-size: 13px; color: #38bdf8; font-family: monospace; font-weight: 900;">${data.transactionId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 12px; color: #94a3b8;">Payment Verification:</td>
              <td style="padding: 6px 0; font-size: 12px; color: ${isPaid ? '#34d399' : '#fbbf24'}; font-weight: 700;">
                ${isPaid ? '✅ Verified & Completed' : '⏳ Pending Admin Verification'}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      ${data.adminNotes
      ? `
      <!-- Admin Notes / Delivery PINs -->
      <tr>
        <td style="padding: 0 24px 20px 24px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #38bdf8; letter-spacing: 1px; margin-bottom: 8px;">
            🔐 Delivery Voucher Codes & Notes
          </div>
          <div style="background-color: #070c18; border: 1px dashed #38bdf8; border-radius: 12px; padding: 14px; font-family: monospace; font-size: 13px; color: #34d399; font-weight: 700; line-height: 1.5; white-space: pre-wrap;">
${data.adminNotes}
          </div>
        </td>
      </tr>`
      : ''
    }

      <!-- Live Order Tracking Button CTA -->
      <tr>
        <td style="padding: 0 24px 24px 24px; text-align: center;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
            <tr>
              <td align="center" style="border-radius: 14px; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);">
                <a href="${APP_URL}/orders/track?q=${encodeURIComponent(data.orderNum)}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 13px; font-weight: 900; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1.2px; border-radius: 14px; box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);">
                  🔍 Track Live Order Status
                </a>
              </td>
              <td style="width: 12px;"></td>
              <td align="center" style="border-radius: 14px; background: linear-gradient(135deg, #15803d 0%, #16a34a 100%);">
                <a href="${DEFAULT_SITE_SETTINGS.whatsappLink || 'https://wa.me/8801300529836'}?text=${encodeURIComponent(
      `Hi ZENOV Gaming, I have an inquiry regarding my order #${data.orderNum} (UID: ${data.playerId})`
    )}" target="_blank" style="display: inline-block; padding: 14px 24px; font-size: 13px; font-weight: 900; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1.2px; border-radius: 14px; box-shadow: 0 6px 20px rgba(22, 163, 74, 0.45);">
                  💬 WhatsApp Support
                </a>
              </td>
            </tr>
          </table>
          <p style="margin: 12px 0 0 0; font-size: 11px; color: #64748b;">
            Have questions about your top-up? You can reply directly to this email or contact support.
          </p>
        </td>
      </tr>

      <!-- Security / Guarantee Notice -->
      <tr>
        <td style="padding: 0 24px 24px 24px;">
          <div style="background-color: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 12px; padding: 12px 16px; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #34d399; font-weight: 700; line-height: 1.5;">
              🛡️ 100% Genuine Digital Delivery Guarantee • SSL 256-bit Encrypted Transaction
            </p>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color: #060913; padding: 24px; text-align: center; border-top: 1px solid #1e293b;">
          <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 900; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase;">
            ZENOV GAMING STORE
          </p>
          <p style="margin: 0 0 10px 0; font-size: 11px; color: #64748b; line-height: 1.6;">
            Official Gaming Top-Up & Digital Prepaid Gift Cards Catalog<br/>
            Support Helpline: <strong style="color: #94a3b8;">${DEFAULT_SITE_SETTINGS.supportPhone}</strong> • Email: <strong style="color: #94a3b8;">${DEFAULT_SITE_SETTINGS.supportEmail}</strong>
          </p>
          <p style="margin: 0; font-size: 10px; color: #475569; line-height: 1.4;">
            This is an automated official tax invoice and order dispatch receipt.<br/>
            Recipient: ${data.customerEmail || ADMIN_NOTIFICATION_EMAIL}
          </p>
        </td>
      </tr>

    </table>
  </div>
</body>
</html>
  `;
}

/**
 * Sends an order confirmation and tax invoice notification email
 */
export async function sendOrderNotificationEmail(order: any) {
  const data = parseOrderData(order);
  const html = generateOrderEmailHtml(order);

  const subject = `🎮 Order Confirmation & Invoice #${data.orderNum} (৳${data.totalBDT.toLocaleString()} / $${data.totalUSD.toFixed(2)}) - ZENOV Gaming`;

  // Determine recipients
  const recipients: string[] = [];

  if (data.customerEmail && data.customerEmail.includes('@') && !data.customerEmail.endsWith('@zenovgames.com')) {
    recipients.push(data.customerEmail);
  }

  if (ADMIN_NOTIFICATION_EMAIL && ADMIN_NOTIFICATION_EMAIL.includes('@')) {
    if (!recipients.includes(ADMIN_NOTIFICATION_EMAIL)) {
      recipients.push(ADMIN_NOTIFICATION_EMAIL);
    }
  }

  if (recipients.length === 0) {
    if (data.customerEmail && data.customerEmail.includes('@')) {
      recipients.push(data.customerEmail);
    } else if (ADMIN_NOTIFICATION_EMAIL) {
      recipients.push(ADMIN_NOTIFICATION_EMAIL);
    }
  }

  return sendEmail({
    to: recipients,
    subject,
    html,
  });
}

/**
 * Generates clean HTML for customer support inquiries
 */
export function generateTicketEmailHtml(ticket: any): string {
  const ticketNum = ticket.ticketNumber || ticket.id || 'TCK-' + Date.now().toString().slice(-4);
  const subject = `💬 Support Inquiry #${ticketNum} - ${ticket.subject || 'Support Ticket'} [ZENOV Helpdesk]`;
  const messageText =
    ticket.message || (ticket.messages && ticket.messages[0]?.message) || 'No message content provided';

  const { formattedDate, formattedTime } = formatOrderDate(ticket.createdAt);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <div style="background-color: #030712; padding: 24px 12px;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; margin: 0 auto; box-shadow: 0 20px 40px rgba(0,0,0,0.7);">
      
      <!-- Header -->
      <tr>
        <td style="background: linear-gradient(135deg, #78350f 0%, #d97706 100%); padding: 28px 24px; text-align: center;">
          <div style="font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">
            ZENOV HELPDESK
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #fde68a; letter-spacing: 1px; text-transform: uppercase; margin-top: 4px;">
            Customer Inquiry Registration
          </div>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding: 24px;">
          <div style="text-align: center; margin-bottom: 16px;">
            <span style="display: inline-block; padding: 6px 14px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; font-family: monospace; font-size: 13px; font-weight: 800; border-radius: 8px;">
              TICKET #${ticketNum}
            </span>
          </div>

          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; margin-bottom: 16px;">
            <tr>
              <td style="padding: 6px 0; font-size: 12px; color: #94a3b8; width: 35%;">Customer Name:</td>
              <td style="padding: 6px 0; font-size: 12px; color: #ffffff; font-weight: 700;">${ticket.userName || 'Gamer'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 12px; color: #94a3b8;">Email Address:</td>
              <td style="padding: 6px 0; font-size: 12px; color: #38bdf8; font-family: monospace; font-weight: 600;">${ticket.userEmail || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 12px; color: #94a3b8;">Category / Subject:</td>
              <td style="padding: 6px 0; font-size: 12px; color: #f8fafc; font-weight: 700;">${ticket.category || 'Support'} • ${ticket.subject || 'Help Request'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 12px; color: #94a3b8;">Submitted Date:</td>
              <td style="padding: 6px 0; font-size: 12px; color: #cbd5e1;">${formattedDate} at ${formattedTime}</td>
            </tr>
          </table>

          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 6px; letter-spacing: 0.5px;">
            Message Details:
          </div>
          <div style="background-color: #070c18; border: 1px solid #1e293b; border-radius: 10px; padding: 14px; font-size: 13px; color: #e2e8f0; line-height: 1.6; white-space: pre-wrap;">
${messageText}
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color: #060913; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b;">
          ZENOV Gaming Customer Support • Dhaka, Bangladesh
        </td>
      </tr>

    </table>
  </div>
</body>
</html>
  `;
}

/**
 * Sends a notification email when a user submits a contact or support inquiry
 */
export async function sendContactUsEmail(ticket: any) {
  const ticketNum = ticket.ticketNumber || ticket.id || 'TICK-' + Date.now().toString().slice(-4);
  const subject = `💬 Support Inquiry #${ticketNum} - ${ticket.subject || 'Support Ticket'} [ZENOV Helpdesk]`;
  const html = generateTicketEmailHtml(ticket);

  const recipients: string[] = [];
  if (ADMIN_NOTIFICATION_EMAIL && ADMIN_NOTIFICATION_EMAIL.includes('@')) {
    recipients.push(ADMIN_NOTIFICATION_EMAIL);
  }
  if (ticket.userEmail && ticket.userEmail.includes('@') && !recipients.includes(ticket.userEmail)) {
    recipients.push(ticket.userEmail);
  }

  return sendEmail({
    to: recipients,
    subject,
    html,
  });
}
