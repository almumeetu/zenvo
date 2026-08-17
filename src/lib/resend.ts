/**
 * Resend Email Notification Service for ZENOV Gaming
 * Sends automated HTML transactional emails for Orders and Contact/Support Inquiries.
 *
 * Required environment variables:
 *   RESEND_API_KEY            — Resend API secret key
 *   RESEND_FROM_EMAIL         — Sender address (e.g. "ZENOV Gaming <onboarding@resend.dev>")
 *   ADMIN_NOTIFICATION_EMAIL  — Admin inbox to receive order/ticket notifications
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

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
    console.error('[Resend] RESEND_API_KEY is not set in environment. Email dispatch skipped.');
    return { success: false, message: 'Missing RESEND_API_KEY env variable' };
  }

  if (!RESEND_FROM_EMAIL) {
    console.error('[Resend] RESEND_FROM_EMAIL is not set in environment. Email dispatch skipped.');
    return { success: false, message: 'Missing RESEND_FROM_EMAIL env variable' };
  }

  const recipients = Array.isArray(to) ? to : [to];

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
      console.error('Resend API error:', data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Failed to send email via Resend API:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sends a notification email when a new game order is placed
 */
export async function sendOrderNotificationEmail(order: any) {
  if (!ADMIN_NOTIFICATION_EMAIL) {
    console.error('[Resend] ADMIN_NOTIFICATION_EMAIL is not set in environment. Order email skipped.');
    return { success: false, message: 'Missing ADMIN_NOTIFICATION_EMAIL env variable' };
  }

  const orderNum = order.orderNumber || order.id;
  const subject = `🎮 New Order Received: #${orderNum} - ${order.productTitle || 'Top-Up'}`;

  const customerEmail = order.userEmail || order.userId || '';
  const priceDisplay = order.priceBDT ? `৳${order.priceBDT.toLocaleString()}` : `$${order.amount || 0}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050811; color: #f1f5f9; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #0c1222; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 24px; text-align: center; }
        .logo { font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #ffffff; margin: 0; text-transform: uppercase; }
        .subtitle { font-size: 11px; font-weight: 700; color: #bfdbfe; margin-top: 4px; letter-spacing: 1px; }
        .body { padding: 24px; }
        .order-badge { display: inline-block; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); color: #60a5fa; font-weight: bold; font-family: monospace; font-size: 14px; padding: 6px 14px; border-radius: 8px; margin-bottom: 16px; }
        .details-table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 16px; }
        .details-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #1e293b; }
        .details-table td.label { color: #94a3b8; font-weight: 600; width: 40%; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
        .details-table td.value { color: #f8fafc; font-weight: 700; }
        .highlight { color: #f59e0b; font-weight: 800; font-size: 16px; }
        .footer { background: #060a14; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 class="logo">ZENOV GAMING</h1>
          <p class="subtitle">AUTOMATED ORDER NOTIFICATION</p>
        </div>
        <div class="body">
          <div style="text-align: center;">
            <span class="order-badge">ORDER #${orderNum}</span>
          </div>
          <p style="font-size: 14px; color: #cbd5e1; line-height: 1.5; margin-top: 0;">
            A new digital gaming top-up order has been successfully placed in the store.
          </p>
          
          <table class="details-table">
            <tr>
              <td class="label">Customer Name</td>
              <td class="value">${order.customerName || order.userName || 'Customer'}</td>
            </tr>
            <tr>
              <td class="label">Customer Email</td>
              <td class="value" style="color: #38bdf8;">${order.customerEmail || order.userEmail || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">Phone / WhatsApp</td>
              <td class="value" style="color: #34d399; font-weight: bold;">${order.customerPhone || order.phone || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">Buyer IP Address</td>
              <td class="value" style="font-family: monospace; color: #a78bfa;">${order.ipAddress || '127.0.0.1'}</td>
            </tr>
            <tr>
              <td class="label">Product</td>
              <td class="value">${order.productTitle || 'Game Top-Up'}</td>
            </tr>
            <tr>
              <td class="label">Package / Denomination</td>
              <td class="value">${order.denominationName || order.denomination?.name || 'Standard Package'}</td>
            </tr>
            <tr>
              <td class="label">Total Price</td>
              <td class="value highlight">${priceDisplay}</td>
            </tr>
            <tr>
              <td class="label">Quantity</td>
              <td class="value">${order.quantity || 1}</td>
            </tr>
            <tr>
              <td class="label">Player ID / Account</td>
              <td class="value" style="font-family: monospace; color: #38bdf8;">${order.playerId || 'N/A'}</td>
            </tr>
            ${order.serverId ? `
            <tr>
              <td class="label">Server / Region</td>
              <td class="value">${order.serverId}</td>
            </tr>` : ''}
            <tr>
              <td class="label">Payment Method</td>
              <td class="value">${order.paymentMethod || 'bKash'}</td>
            </tr>
            <tr>
              <td class="label">Sender Number / Account</td>
              <td class="value" style="font-family: monospace; color: #fbbf24; font-weight: bold;">${order.senderNumber || order.customerPhone || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">Transaction ID (TrxID)</td>
              <td class="value" style="font-family: monospace; color: #38bdf8; font-weight: 800; font-size: 14px; letter-spacing: 1px;">${order.transactionId || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">Payment Status</td>
              <td class="value" style="color: ${order.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b'}; font-weight: bold;">${order.paymentStatus || 'Pending Verification'}</td>
            </tr>
            <tr>
              <td class="label">Order Time</td>
              <td class="value">${new Date().toLocaleString()}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; padding: 14px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #34d399; font-weight: bold;">
              ⚡ Ready for instant fulfillment or dispatch.
            </p>
          </div>
        </div>
        <div class="footer">
          ZENOV Gaming Store • Official Gaming Partner & Reseller<br/>
          Notification sent to: ${ADMIN_NOTIFICATION_EMAIL}
        </div>
      </div>
    </body>
    </html>
  `;

  const recipients = [ADMIN_NOTIFICATION_EMAIL];
  if (customerEmail && customerEmail.includes('@') && customerEmail !== ADMIN_NOTIFICATION_EMAIL) {
    // If a valid customer email is provided, send copy to customer
    recipients.push(customerEmail);
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
  if (!ADMIN_NOTIFICATION_EMAIL) {
    console.error('[Resend] ADMIN_NOTIFICATION_EMAIL is not set in environment. Contact email skipped.');
    return { success: false, message: 'Missing ADMIN_NOTIFICATION_EMAIL env variable' };
  }

  const ticketNum = ticket.ticketNumber || ticket.id;
  const subject = `💬 New Support Inquiry: #${ticketNum} - ${ticket.subject || 'Support Ticket'}`;

  const messageText = ticket.message || (ticket.messages && ticket.messages[0]?.message) || 'No message provided';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050811; color: #f1f5f9; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #0c1222; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 24px; text-align: center; }
        .logo { font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #020617; margin: 0; text-transform: uppercase; }
        .subtitle { font-size: 11px; font-weight: 800; color: #78350f; margin-top: 4px; letter-spacing: 1px; }
        .body { padding: 24px; }
        .ticket-badge { display: inline-block; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; font-weight: bold; font-family: monospace; font-size: 14px; padding: 6px 14px; border-radius: 8px; margin-bottom: 16px; }
        .details-table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 16px; }
        .details-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #1e293b; }
        .details-table td.label { color: #94a3b8; font-weight: 600; width: 35%; text-transform: uppercase; font-size: 11px; }
        .details-table td.value { color: #f8fafc; font-weight: 700; }
        .msg-box { background: #070c18; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; font-size: 13px; color: #e2e8f0; line-height: 1.6; margin-top: 12px; white-space: pre-wrap; }
        .footer { background: #060a14; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 class="logo">ZENOV SUPPORT</h1>
          <p class="subtitle">NEW CUSTOMER INQUIRY</p>
        </div>
        <div class="body">
          <div style="text-align: center;">
            <span class="ticket-badge">TICKET #${ticketNum}</span>
          </div>
          
          <table class="details-table">
            <tr>
              <td class="label">Customer Name</td>
              <td class="value">${ticket.userName || 'Gamer'}</td>
            </tr>
            <tr>
              <td class="label">Email Address</td>
              <td class="value" style="color: #38bdf8;">${ticket.userEmail || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">Category</td>
              <td class="value">${ticket.category || 'General Support'}</td>
            </tr>
            <tr>
              <td class="label">Priority</td>
              <td class="value" style="color: #f59e0b;">${ticket.priority || 'Normal'}</td>
            </tr>
            <tr>
              <td class="label">Subject</td>
              <td class="value">${ticket.subject || 'Support Request'}</td>
            </tr>
          </table>

          <p style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">
            Message Content:
          </p>
          <div class="msg-box">${messageText}</div>
        </div>
        <div class="footer">
          ZENOV Gaming Helpdesk • Reply directly to this ticket in the Admin Dashboard.<br/>
          Notification sent to: ${ADMIN_NOTIFICATION_EMAIL}
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject,
    html,
  });
}
