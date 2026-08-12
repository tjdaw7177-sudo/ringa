import { Resend } from 'resend';

export async function sendNewClientAlert({ businessName, email, ringaNumber, tier }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const TIER_PRICES = { starter: '$399', professional: '$599', enterprise: '$799' };
  await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: 'getringa@gmail.com',
    subject: `New client signed up — ${businessName}`,
    html: `
      <div style="font-family:Inter,sans-serif;background:#0a0a0a;padding:40px 20px;">
        <div style="max-width:500px;margin:0 auto;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;padding:32px;">
          <p style="color:#38bdf8;font-size:13px;font-weight:700;text-transform:uppercase;margin:0 0 8px;">New Signup</p>
          <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0 0 24px;">${businessName} just signed up</h1>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="color:#6b7280;font-size:13px;padding:8px 0;border-bottom:1px solid #2a2a2a;">Business</td><td style="color:#ffffff;font-size:13px;padding:8px 0;border-bottom:1px solid #2a2a2a;text-align:right;">${businessName}</td></tr>
            <tr><td style="color:#6b7280;font-size:13px;padding:8px 0;border-bottom:1px solid #2a2a2a;">Email</td><td style="color:#ffffff;font-size:13px;padding:8px 0;border-bottom:1px solid #2a2a2a;text-align:right;">${email}</td></tr>
            <tr><td style="color:#6b7280;font-size:13px;padding:8px 0;border-bottom:1px solid #2a2a2a;">Plan</td><td style="color:#38bdf8;font-size:13px;font-weight:700;padding:8px 0;border-bottom:1px solid #2a2a2a;text-align:right;">${tier} — ${TIER_PRICES[tier] ?? ''}/mo</td></tr>
            <tr><td style="color:#6b7280;font-size:13px;padding:8px 0;">Ringa Number</td><td style="color:#ffffff;font-size:13px;font-family:monospace;padding:8px 0;text-align:right;">${ringaNumber}</td></tr>
          </table>
        </div>
      </div>`,
  });
  console.log('[email] new client alert sent for:', businessName);
}

export async function sendPortalWelcome({ to, businessName, portalUrl, ringaNumber }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { html, subject } = portalWelcomeEmail({ businessName, portalUrl, ringaNumber });
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM,
    to,
    subject,
    html,
  });
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
  console.log('[email] portal welcome sent to:', to);
}

export function portalWelcomeEmail({ businessName, portalUrl, ringaNumber }) {
  return {
    subject: `Your Ringa AI receptionist is live — access your portal`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Ringa</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;">
              <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Ring</span><span style="font-size:24px;font-weight:800;color:#38bdf8;">a</span>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="background:linear-gradient(145deg,#1a1a1a,#111111);border:1px solid #2a2a2a;border-radius:16px;padding:40px;">

              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#38bdf8;text-transform:uppercase;letter-spacing:1px;">You're live</p>
              <h1 style="margin:0 0 16px;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;">Your AI receptionist is answering calls</h1>
              <p style="margin:0 0 32px;font-size:15px;color:#9ca3af;line-height:1.6;">
                ${businessName} is now set up on Ringa. Your AI receptionist will answer every call, book appointments to your Google Calendar, and dispatch emergencies automatically.
              </p>

              <!-- Phone number box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1520;border:1px solid #1e3a5f;border-radius:12px;margin-bottom:32px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Your Ringa Phone Number</p>
                    <p style="margin:0 0 8px;font-size:28px;font-weight:800;color:#38bdf8;font-family:monospace;">${ringaNumber}</p>
                    <p style="margin:0;font-size:13px;color:#64748b;">Forward your business calls to this number</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#38bdf8;border-radius:10px;">
                    <a href="${portalUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#000000;text-decoration:none;">
                      View Your Portal →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Features -->
          <tr>
            <td style="padding:32px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 8px 0 0;width:33%;vertical-align:top;">
                    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;">
                      <p style="margin:0 0 8px;font-size:20px;">📅</p>
                      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#ffffff;">Bookings</p>
                      <p style="margin:0;font-size:12px;color:#6b7280;">Goes straight to Google Calendar</p>
                    </div>
                  </td>
                  <td style="padding:0 4px;width:33%;vertical-align:top;">
                    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;">
                      <p style="margin:0 0 8px;font-size:20px;">💬</p>
                      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#ffffff;">SMS</p>
                      <p style="margin:0;font-size:12px;color:#6b7280;">Customers get instant confirmations</p>
                    </div>
                  </td>
                  <td style="padding:0 0 0 8px;width:33%;vertical-align:top;">
                    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;">
                      <p style="margin:0 0 8px;font-size:20px;">🚨</p>
                      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#ffffff;">Emergencies</p>
                      <p style="margin:0;font-size:12px;color:#6b7280;">On-call tech gets texted instantly</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tips -->
          <tr>
            <td style="padding:24px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#ffffff;">Quick tips</p>
                    <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">• Text <strong style="color:#ffffff;">REMOVE</strong> to cancel an appointment</p>
                    <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">• Text <strong style="color:#ffffff;">RESCHEDULE</strong> to change the time</p>
                    <p style="margin:0;font-size:13px;color:#9ca3af;">• View all call transcripts in your portal</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 0 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#374151;">
                <span style="color:#ffffff;font-weight:700;">Ring</span><span style="color:#38bdf8;font-weight:700;">a</span> · AI Receptionist for Plumbing & HVAC
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#374151;">
                <a href="${portalUrl}" style="color:#38bdf8;text-decoration:none;">getringa.ca</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}
