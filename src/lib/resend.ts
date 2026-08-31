/**
 * Resend Email Notification Service for ZENOV Gaming Store
 * Sends high-end, professional transactional HTML emails for:
 * 1. Customer Order Confirmation & Tax Invoice Receipts
 * 2. Admin Order Dispatch & Verification Alerts
 * 3. Support Inquiries & Helpdesk Tickets
 *
 * Environment variables:
 *   RESEND_API_KEY            — Resend API secret key
 *   RESEND_FROM_EMAIL         — Sender address (e.g. "ZENOV Gaming <orders@zenovgames.com>" or "ZENOV <onboarding@resend.dev>")
 *   ADMIN_NOTIFICATION_EMAIL  — Admin inbox to receive order/ticket alerts
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_NOTIFICATION_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL ||
  process.env.RESEND_TO_EMAIL ||
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
        const fallbackAdmin = ADMIN_NOTIFICATION_EMAIL || 'almumeetu@gmail.com';
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
 * Format order date in a human-friendly format
 */
function formatOrderDate(dateInput?: string | Date): { formattedDate: string; formattedTime: string } {
  try {
    const d = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(d.getTime())) throw new Error('Invalid date');

    const formattedDate = d.toLocaleDateString('en-US', {
      weekday: 'short',
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

/**
 * Generates an ultra-professional, responsive HTML invoice and order receipt email
 */
export async function sendOrderNotificationEmail(order: any) {
  const orderNum = order.orderNumber || order.id || 'ZNG-' + Date.now().toString().slice(-6);
  const customerEmail = (order.customerEmail || order.userEmail || '').trim();
  const customerName = order.customerName || order.userName || 'Valued Gamer';
  const customerPhone = order.customerPhone || order.phone || '';
  const senderNumber = order.senderNumber || '';
  const playerId = order.playerId || order.items?.[0]?.playerId || 'N/A';
  const serverId = order.serverId || order.items?.[0]?.serverId || '';
  const paymentMethod = order.paymentMethod || 'bKash';
  const transactionId = order.transactionId || 'N/A';
  const paymentStatus = order.paymentStatus || 'Pending Verification';
  const fulfillmentStatus = order.fulfillmentStatus || 'Processing';
  const ipAddress = order.ipAddress || '';

  const { formattedDate, formattedTime } = formatOrderDate(order.createdAt);

  // Parse items
  const items: Array<{
    title: string;
    packageName: string;
    quantity: number;
    amountUSD: number;
    priceBDT: number;
    image?: string;
  }> = [];

  if (Array.isArray(order.items) && order.items.length > 0) {
    order.items.forEach((item: any) => {
      const denom = item.denomination || {};
      const amountUSD = Number(denom.amount) || Number(item.amount) || 0;
      const priceBDT = Number(denom.priceBDT) || Math.round(amountUSD * 120) || 0;
      items.push({
        title: item.productTitle || item.title || 'Game Package',
        packageName: denom.name || item.packageName || 'Standard Top-Up',
        quantity: Number(item.quantity) || 1,
        amountUSD,
        priceBDT,
        image: item.productImage || item.image || '',
      });
    });
  } else {
    // Single item fallback
    const amountUSD = Number(order.totalUSD) || Number(order.amount) || 0;
    const priceBDT = Number(order.paidAmountCurrency) || Number(order.priceBDT) || Math.round(amountUSD * 120);
    items.push({
      title: order.productTitle || 'Digital Top-Up',
      packageName: order.denominationName || order.denomination?.name || 'Standard Package',
      quantity: Number(order.quantity) || 1,
      amountUSD,
      priceBDT,
    });
  }

  // Calculate totals
  const totalUSD = Number(order.totalUSD) || items.reduce((acc, i) => acc + i.amountUSD * i.quantity, 0);
  const totalBDT = Number(order.paidAmountCurrency) || items.reduce((acc, i) => acc + i.priceBDT * i.quantity, 0);

  const subject = `🎮 Order Confirmation & Invoice #${orderNum} - ZENOV Gaming`;

  // Status colors
  const isPaid = paymentStatus === 'Paid';
  const payBadgeBg = isPaid ? '#064e3b' : '#451a03';
  const payBadgeBorder = isPaid ? '#059669' : '#d97706';
  const payBadgeText = isPaid ? '#34d399' : '#fbbf24';

  const isDelivered = fulfillmentStatus === 'Delivered';
  const fulBadgeBg = isDelivered ? '#064e3b' : '#1e3a8a';
  const fulBadgeBorder = isDelivered ? '#059669' : '#3b82f6';
  const fulBadgeText = isDelivered ? '#34d399' : '#60a5fa';

  // Build items rows HTML
  const itemsHtml = items
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #1e293b;">
        <td style="padding: 14px 12px; font-size: 13px; color: #f8fafc; vertical-align: middle;">
          <div style="font-weight: 700; font-size: 14px; color: #ffffff; margin-bottom: 2px;">
            ${item.title}
          </div>
          <div style="font-size: 12px; color: #94a3b8; font-weight: 500;">
            Package: <span style="color: #38bdf8; font-weight: 600;">${item.packageName}</span>
          </div>
        </td>
        <td style="padding: 14px 12px; font-size: 13px; color: #cbd5e1; text-align: center; vertical-align: middle; font-weight: 600;">
          ${item.quantity}x
        </td>
        <td style="padding: 14px 12px; font-size: 13px; color: #f8fafc; text-align: right; vertical-align: middle;">
          <div style="font-weight: 800; font-family: monospace; color: #10b981; font-size: 14px;">
            ৳${(item.priceBDT * item.quantity).toLocaleString()}
          </div>
          <div style="font-size: 11px; color: #64748b; font-family: monospace;">
            ($${(item.amountUSD * item.quantity).toFixed(2)} USD)
          </div>
        </td>
      </tr>
    `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <div style="background-color: #030712; padding: 24px 12px;">
    <!-- Main Card Container -->
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7); margin: 0 auto;">
      
      <!-- Brand Header Banner -->
      <tr>
        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #3b82f6;">
          <table align="center" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align: center;">
                <div style="display: inline-block; padding: 8px 16px; background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; margin-bottom: 12px;">
                  <span style="font-size: 20px; font-weight: 900; letter-spacing: 3px; color: #ffffff; text-transform: uppercase;">
                    ⚡ ZENOV GAMING
                  </span>
                </div>
                <div style="font-size: 12px; font-weight: 700; color: #93c5fd; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">
                  Official Order Receipt & Tax Invoice
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Greeting & Order Status Badge -->
      <tr>
        <td style="padding: 28px 24px 16px 24px;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <h2 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 800; color: #ffffff;">
                  Thank you for your order, <span style="color: #38bdf8;">${customerName}</span>! 👋
                </h2>
                <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                  Your digital gaming top-up request has been registered and is being processed by our automated delivery system.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Order Meta Highlights Card -->
      <tr>
        <td style="padding: 0 24px 20px 24px;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 14px; overflow: hidden;">
            <tr>
              <td style="padding: 16px; width: 50%; border-right: 1px solid #1e293b; border-bottom: 1px solid #1e293b;">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
                  Invoice / Order #
                </span>
                <span style="font-size: 13px; font-weight: 800; font-family: monospace; color: #38bdf8;">
                  ${orderNum}
                </span>
              </td>
              <td style="padding: 16px; width: 50%; border-bottom: 1px solid #1e293b;">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
                  Order Date & Time
                </span>
                <span style="font-size: 12px; font-weight: 700; color: #f8fafc;">
                  ${formattedDate}<br/>
                  <span style="font-size: 11px; color: #94a3b8; font-weight: 500;">${formattedTime}</span>
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px; width: 50%; border-right: 1px solid #1e293b;">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
                  Payment Status
                </span>
                <span style="display: inline-block; padding: 4px 10px; background-color: ${payBadgeBg}; border: 1px solid ${payBadgeBorder}; color: ${payBadgeText}; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${paymentStatus}
                </span>
              </td>
              <td style="padding: 16px; width: 50%;">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
                  Fulfillment Status
                </span>
                <span style="display: inline-block; padding: 4px 10px; background-color: ${fulBadgeBg}; border: 1px solid ${fulBadgeBorder}; color: ${fulBadgeText}; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${fulfillmentStatus}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- In-Game Destination Card (Highlighted) -->
      <tr>
        <td style="padding: 0 24px 20px 24px;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(59, 130, 246, 0.05) 100%); border: 1px solid #2563eb; border-radius: 14px; padding: 16px;">
            <tr>
              <td>
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #60a5fa; letter-spacing: 1px; margin-bottom: 8px;">
                  🎮 In-Game Account Destination
                </div>
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 4px 0; font-size: 12px; color: #cbd5e1;">
                      <strong style="color: #94a3b8;">Player ID / UID:</strong>
                      <span style="font-family: monospace; font-size: 14px; font-weight: 800; color: #ffffff; background: #0f172a; padding: 3px 8px; border-radius: 6px; border: 1px solid #334155; margin-left: 6px;">
                        ${playerId}
                      </span>
                    </td>
                    ${
                      serverId
                        ? `
                    <td style="padding: 4px 0; font-size: 12px; color: #cbd5e1; text-align: right;">
                      <strong style="color: #94a3b8;">Server / Zone:</strong>
                      <span style="font-family: monospace; font-size: 13px; font-weight: 700; color: #f8fafc; background: #0f172a; padding: 3px 8px; border-radius: 6px; border: 1px solid #334155; margin-left: 6px;">
                        ${serverId}
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

      <!-- Itemized Receipt Table -->
      <tr>
        <td style="padding: 0 24px 20px 24px;">
          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 10px;">
            📦 Items & Package Breakdown
          </div>
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 14px; overflow: hidden; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #1e293b; border-bottom: 1px solid #334155;">
                <th style="padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px;">
                  Product / Package
                </th>
                <th style="padding: 10px 12px; text-align: center; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; width: 60px;">
                  Qty
                </th>
                <th style="padding: 10px 12px; text-align: right; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; width: 120px;">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <!-- Grand Total Row -->
              <tr style="background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%);">
                <td colspan="2" style="padding: 16px 12px; font-size: 13px; font-weight: 800; text-transform: uppercase; color: #ffffff; letter-spacing: 0.5px;">
                  Total Amount Paid:
                </td>
                <td style="padding: 16px 12px; text-align: right;">
                  <div style="font-size: 18px; font-weight: 900; font-family: monospace; color: #34d399;">
                    ৳${totalBDT.toLocaleString()}
                  </div>
                  <div style="font-size: 11px; color: #94a3b8; font-family: monospace; font-weight: 600;">
                    ($${totalUSD.toFixed(2)} USD)
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </td>
      </tr>

      <!-- Payment & Transaction Details -->
      <tr>
        <td style="padding: 0 24px 24px 24px;">
          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 10px;">
            💳 Payment & Transaction Verification
          </div>
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 14px; padding: 14px;">
            <tr>
              <td style="padding: 6px 0; font-size: 12px; color: #94a3b8; width: 40%;">Payment Method:</td>
              <td style="padding: 6px 0; font-size: 12px; color: #f8fafc; font-weight: 700;">${paymentMethod}</td>
            </tr>
            ${
              senderNumber
                ? `
            <tr>
              <td style="padding: 6px 0; font-size: 12px; color: #94a3b8;">Sender Account / Mobile:</td>
              <td style="padding: 6px 0; font-size: 12px; color: #fbbf24; font-family: monospace; font-weight: 700;">${senderNumber}</td>
            </tr>`
                : ''
            }
            <tr>
              <td style="padding: 6px 0; font-size: 12px; color: #94a3b8;">Transaction ID (TrxID):</td>
              <td style="padding: 6px 0; font-size: 13px; color: #38bdf8; font-family: monospace; font-weight: 800;">${transactionId}</td>
            </tr>
            ${
              customerPhone
                ? `
            <tr>
              <td style="padding: 6px 0; font-size: 12px; color: #94a3b8;">Customer Contact:</td>
              <td style="padding: 6px 0; font-size: 12px; color: #f8fafc; font-family: monospace;">${customerPhone}</td>
            </tr>`
                : ''
            }
          </table>
        </td>
      </tr>

      <!-- Live Order Tracking Button CTA -->
      <tr>
        <td style="padding: 0 24px 28px 24px; text-align: center;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
            <tr>
              <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);">
                <a href="${APP_URL}/orders/track?orderId=${encodeURIComponent(orderNum)}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 13px; font-weight: 800; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; border-radius: 12px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                  🔍 Track Live Order Status
                </a>
              </td>
            </tr>
          </table>
          <p style="margin: 12px 0 0 0; font-size: 11px; color: #64748b;">
            Need help with your top-up? Reply directly to this email or contact support.
          </p>
        </td>
      </tr>

      <!-- Security / Guarantee Notice -->
      <tr>
        <td style="padding: 0 24px 24px 24px;">
          <div style="background-color: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 12px; padding: 12px; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #34d399; font-weight: 600; line-height: 1.4;">
              🛡️ 100% Genuine Digital Delivery Guarantee • SSL 256-bit Encrypted Transaction
            </p>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color: #060913; padding: 24px; text-align: center; border-top: 1px solid #1e293b;">
          <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #e2e8f0; letter-spacing: 1px; text-transform: uppercase;">
            ZENOV Gaming Store
          </p>
          <p style="margin: 0 0 10px 0; font-size: 11px; color: #64748b; line-height: 1.5;">
            Official Gaming Top-Up & Digital Prepaid Gift Cards Catalog<br/>
            Dhaka, Bangladesh • Fast Automated Delivery Desk
          </p>
          <p style="margin: 0; font-size: 10px; color: #475569;">
            This is an automated transaction invoice. Please keep this receipt for your records.<br/>
            Recipient: ${customerEmail || ADMIN_NOTIFICATION_EMAIL || 'Customer'}
          </p>
        </td>
      </tr>

    </table>
  </div>
</body>
</html>
  `;

  // Determine recipients
  const recipients: string[] = [];

  if (customerEmail && customerEmail.includes('@') && !customerEmail.endsWith('@zenovgames.com')) {
    recipients.push(customerEmail);
  }

  if (ADMIN_NOTIFICATION_EMAIL && ADMIN_NOTIFICATION_EMAIL.includes('@')) {
    if (!recipients.includes(ADMIN_NOTIFICATION_EMAIL)) {
      recipients.push(ADMIN_NOTIFICATION_EMAIL);
    }
  }

  if (recipients.length === 0) {
    if (customerEmail && customerEmail.includes('@')) {
      recipients.push(customerEmail);
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
 * Sends a notification email when a user submits a contact or support inquiry
 */
export async function sendContactUsEmail(ticket: any) {
  const ticketNum = ticket.ticketNumber || ticket.id || 'TICK-' + Date.now().toString().slice(-4);
  const subject = `💬 Support Inquiry #${ticketNum} - ${ticket.subject || 'Support Ticket'} [ZENOV Helpdesk]`;
  const messageText =
    ticket.message || (ticket.messages && ticket.messages[0]?.message) || 'No message content provided';

  const { formattedDate, formattedTime } = formatOrderDate(ticket.createdAt);

  const html = `
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
