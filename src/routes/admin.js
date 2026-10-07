import { Router } from 'express';
import twilio from 'twilio';
import { v4 as uuidv4 } from 'uuid';
import sql from '../db/index.js';
import { portalWelcomeEmail } from '../services/email.js';

export const adminRouter = Router();

function requireOwner(req, res, next) {
  const secret = req.query.secret || req.cookies?.adminSecret;
  if (secret !== process.env.OWNER_SECRET) {
    return res.status(401).send(`<!DOCTYPE html>
<html><head><title>Ringa Admin</title>
<link rel="stylesheet" href="/styles.css">
<style>body{background:#0a0a0a;font-family:Inter,sans-serif}</style>
</head>
<body class="min-h-screen flex items-center justify-center">
  <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-sm">
    <h1 class="text-white text-2xl font-bold mb-6">
      <span class="text-white">Ring</span><span class="text-sky-400">a</span> Admin
    </h1>
    <form method="GET" class="space-y-4">
      <input name="secret" type="password" placeholder="Owner password"
        class="w-full bg-zinc-800 border border-zinc-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-sky-500">
      <button type="submit"
        class="w-full bg-sky-400 hover:bg-sky-300 text-black font-bold py-3 rounded-lg transition-colors">
        Sign In
      </button>
    </form>
  </div>
</body></html>`);
  }
  next();
}

adminRouter.get('/', requireOwner, async (req, res) => {
  const clients = await sql`
    SELECT c.*, pn.twilio_phone_number
    FROM clients c
    LEFT JOIN (
      SELECT DISTINCT ON (client_id) client_id, twilio_phone_number
      FROM phone_numbers
      ORDER BY client_id, created_at ASC
    ) pn ON pn.client_id = c.id
    ORDER BY c.created_at DESC
  `;
  const secret = req.query.secret;

  const statusBadge = (status) => {
    const styles = {
      active: 'bg-green-900/50 text-green-400 border border-green-700',
      pending: 'bg-yellow-900/50 text-yellow-400 border border-yellow-700',
      cancelled: 'bg-red-900/50 text-red-400 border border-red-700',
    };
    return `<span class="text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] ?? styles.pending}">${status}</span>`;
  };

  const activeClients = clients.filter(c => c.status === 'active');
  const TIER_PRICES = { starter: 399, professional: 599, enterprise: 799 };
  const mrr = activeClients.reduce((sum, c) => {
    return sum + (TIER_PRICES[c.tier ?? 'starter'] ?? 399);
  }, 0);

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ringa Admin</title>
  <link rel="stylesheet" href="/styles.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body { font-family: 'Inter', sans-serif; background: #0a0a0a; }
  </style>
</head>
<body class="min-h-screen text-white">

  <!-- Nav -->
  <nav class="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
    <span class="text-lg font-extrabold">
      <span class="text-white">Ring</span><span class="text-sky-400">a</span>
      <span class="text-zinc-500 text-sm font-medium ml-2">Admin</span>
    </span>
    <a href="/" class="text-zinc-500 hover:text-white text-sm transition-colors">← Back to site</a>
  </nav>

  <div class="max-w-7xl mx-auto px-6 py-8">

    <!-- Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p class="text-zinc-500 text-sm">Total Clients</p>
        <p class="text-3xl font-extrabold text-white mt-1">${clients.length}</p>
      </div>
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p class="text-zinc-500 text-sm">Active</p>
        <p class="text-3xl font-extrabold text-green-400 mt-1">${activeClients.length}</p>
      </div>
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p class="text-zinc-500 text-sm">Pending</p>
        <p class="text-3xl font-extrabold text-yellow-400 mt-1">${clients.filter(c => c.status === 'pending').length}</p>
      </div>
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p class="text-zinc-500 text-sm">Est. MRR</p>
        <p class="text-3xl font-extrabold text-sky-400 mt-1">$${mrr.toLocaleString()}</p>
      </div>
    </div>

    <!-- Clients table -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div class="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <h2 class="font-bold text-white">All Clients</h2>
        <a href="/onboard/owner?secret=${secret}"
          class="bg-sky-400 hover:bg-sky-300 text-black text-sm font-bold px-4 py-2 rounded-lg transition-colors">
          + Add Client
        </a>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-800 text-zinc-500 text-left">
              <th class="px-6 py-3 font-medium">Business</th>
              <th class="px-6 py-3 font-medium">Phone Number</th>
              <th class="px-6 py-3 font-medium">Status</th>
              <th class="px-6 py-3 font-medium">Timezone</th>
              <th class="px-6 py-3 font-medium">Calendar</th>
              <th class="px-6 py-3 font-medium">Created</th>
              <th class="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800">
            ${clients.map(c => `
            <tr class="hover:bg-zinc-800/50 transition-colors">
              <td class="px-6 py-4">
                <p class="font-semibold text-white">${c.business_name}</p>
                <p class="text-zinc-600 text-xs mt-0.5">${c.id}</p>
              </td>
              <td class="px-6 py-4 text-zinc-300 font-mono">${c.twilio_phone_number ?? '—'}</td>
              <td class="px-6 py-4">${statusBadge(c.status)}</td>
              <td class="px-6 py-4 text-zinc-400">${c.timezone}</td>
              <td class="px-6 py-4 text-zinc-400 text-xs">${c.google_calendar_id ?? '—'}</td>
              <td class="px-6 py-4 text-zinc-500 text-xs">${new Date(c.created_at).toLocaleDateString()}</td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  ${c.status === 'active' ? `
                  <form method="POST" action="/admin/deactivate?secret=${secret}" onsubmit="return confirm('Deactivate ${c.business_name}?')">
                    <input type="hidden" name="clientId" value="${c.id}">
                    <button type="submit" class="text-xs bg-red-900/40 hover:bg-red-900 text-red-400 border border-red-800 px-3 py-1.5 rounded-lg transition-colors">
                      Deactivate
                    </button>
                  </form>` : ''}
                  ${c.status === 'cancelled' || c.status === 'pending' ? `
                  <form method="POST" action="/admin/activate?secret=${secret}" onsubmit="return confirm('Activate ${c.business_name}?')">
                    <input type="hidden" name="clientId" value="${c.id}">
                    <button type="submit" class="text-xs bg-green-900/40 hover:bg-green-900 text-green-400 border border-green-800 px-3 py-1.5 rounded-lg transition-colors">
                      Activate
                    </button>
                  </form>` : ''}
                  <form method="POST" action="/admin/delete?secret=${secret}" onsubmit="return confirm('Permanently delete ${c.business_name}? This cannot be undone.')">
                    <input type="hidden" name="clientId" value="${c.id}">
                    <button type="submit" class="text-xs bg-zinc-800 hover:bg-red-900 text-zinc-500 hover:text-red-400 border border-zinc-700 hover:border-red-800 px-3 py-1.5 rounded-lg transition-colors">
                      Delete
                    </button>
                  </form>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>

        ${clients.length === 0 ? `
        <div class="text-center py-16 text-zinc-600">
          <p class="text-lg">No clients yet</p>
          <p class="text-sm mt-1">Share your landing page to get your first signup</p>
        </div>` : ''}
      </div>
    </div>
  </div>

</body>
</html>`);
});

adminRouter.post('/deactivate', requireOwner, async (req, res) => {
  const { clientId } = req.body;
  await sql`UPDATE clients SET status = 'cancelled' WHERE id = ${clientId}`;
  console.log('[admin] deactivated client:', clientId);
  res.redirect(`/admin?secret=${req.query.secret}`);
});

adminRouter.post('/activate', requireOwner, async (req, res) => {
  const { clientId } = req.body;
  await sql`UPDATE clients SET status = 'active' WHERE id = ${clientId}`;
  console.log('[admin] activated client:', clientId);
  res.redirect(`/admin?secret=${req.query.secret}`);
});

const DEFAULT_HOURS = {
  "0": null,
  "1": { "open": 8, "close": 17 },
  "2": { "open": 8, "close": 17 },
  "3": { "open": 8, "close": 17 },
  "4": { "open": 8, "close": 17 },
  "5": { "open": 8, "close": 17 },
  "6": { "open": 8, "close": 12 }
};

// One-off provisioning for an internal/demo client — same Twilio + Vapi
// wiring as /onboard, minus the Stripe subscription, since this isn't a
// paying customer. Reuses an existing Twilio number rather than buying one.
adminRouter.post('/create-demo', requireOwner, async (req, res) => {
  const { businessName, twilioNumber, emergencyNumber, calendarId, refreshToken } = req.body;
  if (!businessName || !twilioNumber || !emergencyNumber || !calendarId || !refreshToken) {
    return res.status(400).json({ error: 'businessName, twilioNumber, emergencyNumber, calendarId, and refreshToken are all required' });
  }

  try {
    const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const numbers = await twilioClient.incomingPhoneNumbers.list({ phoneNumber: twilioNumber });
    if (!numbers.length) throw new Error(`Twilio number ${twilioNumber} not found in this account`);
    await twilioClient.incomingPhoneNumbers(numbers[0].sid).update({
      smsUrl: `${process.env.APP_URL}/webhooks/twilio/sms`,
    });
    console.log('[admin] reconfigured twilio number for demo:', twilioNumber);

    const vapiRes = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${businessName} Receptionist`,
        model: {
          provider: 'anthropic',
          model: 'claude-sonnet-4-6',
          messages: [{
            role: 'system',
            content: `You are a warm, professional receptionist for ${businessName}, a plumbing and HVAC company. You answer calls naturally, like a real person would — not robotic, not scripted.

Your job:
1. Answer warmly and find out what the caller needs
2. If it sounds like an emergency — gas leak, flooding, no heat in winter, burst pipe — act fast. Get their name, address, and what's happening, then call dispatchEmergency right away. Don't make them wait.
3. For regular service requests — leaky faucets, furnace tune-up, installation, etc. — collect their name, best callback number, service address, what they need done, and a preferred date and time. Then call bookAppointment.
4. Always read back the details before booking so they can confirm.
5. If they just have a question you can't answer, take their name and number and let them know someone will call them back.

Tone: friendly, calm, efficient. Keep responses short — this is a phone call, not an email. Never say "certainly" or "absolutely". Sound like a real person.`,
          }],
          tools: [
            {
              type: 'function',
              function: {
                name: 'bookAppointment',
                description: 'Book a service appointment on the business calendar',
                parameters: {
                  type: 'object',
                  properties: {
                    CustomerName: { type: 'string' },
                    Phone: { type: 'string' },
                    serviceType: { type: 'string' },
                    address: { type: 'string' },
                    startTime: { type: 'string' },
                  },
                  required: ['CustomerName', 'Phone', 'serviceType', 'address', 'startTime'],
                },
              },
            },
            {
              type: 'function',
              function: {
                name: 'dispatchEmergency',
                description: 'Alert the on-call technician for an emergency',
                parameters: {
                  type: 'object',
                  properties: {
                    customerName: { type: 'string' },
                    phone: { type: 'string' },
                    address: { type: 'string' },
                    issue: { type: 'string' },
                  },
                  required: ['customerName', 'phone', 'address', 'issue'],
                },
              },
            },
          ],
        },
        voice: { provider: '11labs', voiceId: 'sarah' },
        firstMessage: `Thank you for calling ${businessName}! This call may be recorded. How can I help you today?`,
        serverUrl: `${process.env.APP_URL}/webhooks/vapi`,
      }),
    });
    const vapiAssistant = await vapiRes.json();
    if (!vapiAssistant.id) throw new Error(`Vapi assistant creation failed: ${JSON.stringify(vapiAssistant)}`);
    console.log('[admin] created demo Vapi assistant:', vapiAssistant.id);

    const vapiImportRes = await fetch('https://api.vapi.ai/phone-number', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'twilio',
        number: twilioNumber,
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
        assistantId: vapiAssistant.id,
      }),
    });
    const vapiPhone = await vapiImportRes.json();
    if (!vapiPhone.id) throw new Error(`Vapi phone import failed: ${JSON.stringify(vapiPhone)}`);
    console.log('[admin] imported demo phone into Vapi:', vapiPhone.id);

    const clientId = uuidv4();
    await sql`
      INSERT INTO clients (id, business_name, timezone, emergency_number, business_hours, google_calendar_id, google_refresh_token, status)
      VALUES (${clientId}, ${businessName}, 'America/Vancouver', ${emergencyNumber}, ${JSON.stringify(DEFAULT_HOURS)}, ${calendarId}, ${refreshToken}, 'active')
    `;
    await sql`
      INSERT INTO phone_numbers (id, client_id, twilio_phone_number, vapi_phone_number_id, vapi_assistant_id, label)
      VALUES (${uuidv4()}, ${clientId}, ${twilioNumber}, ${vapiPhone.id}, ${vapiAssistant.id}, 'Demo')
    `;
    console.log('[admin] demo client created:', clientId);

    res.json({ success: true, clientId, twilioNumber, vapiAssistantId: vapiAssistant.id });
  } catch (err) {
    console.error('[admin] create-demo failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/email-preview', requireOwner, (req, res) => {
  const { html } = portalWelcomeEmail({
    businessName: 'Smith Plumbing & HVAC',
    portalUrl: `${process.env.APP_URL}/portal/login`,
    ringaNumber: '+1 (604) 555-0123',
  });
  res.send(html);
});

adminRouter.post('/delete', requireOwner, async (req, res) => {
  const { clientId } = req.body;
  try {
    const phoneNumbers = await sql`SELECT * FROM phone_numbers WHERE client_id = ${clientId}`;
    const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    for (const pn of phoneNumbers) {
      // Release Twilio number
      try {
        const numbers = await twilioClient.incomingPhoneNumbers.list({ phoneNumber: pn.twilio_phone_number });
        if (numbers.length) await twilioClient.incomingPhoneNumbers(numbers[0].sid).remove();
        console.log('[admin] released twilio number:', pn.twilio_phone_number);
      } catch (err) {
        console.error('[admin] failed to release twilio number:', pn.twilio_phone_number, err.message);
      }

      // Delete Vapi phone number
      if (pn.vapi_phone_number_id) {
        try {
          await fetch(`https://api.vapi.ai/phone-number/${pn.vapi_phone_number_id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` },
          });
          console.log('[admin] deleted vapi phone number:', pn.vapi_phone_number_id);
        } catch (err) {
          console.error('[admin] failed to delete vapi phone number:', err.message);
        }
      }

      // Delete Vapi assistant
      if (pn.vapi_assistant_id) {
        try {
          await fetch(`https://api.vapi.ai/assistant/${pn.vapi_assistant_id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` },
          });
          console.log('[admin] deleted vapi assistant:', pn.vapi_assistant_id);
        } catch (err) {
          console.error('[admin] failed to delete vapi assistant:', err.message);
        }
      }
    }

    await sql`DELETE FROM call_logs WHERE client_id = ${clientId}`;
    await sql`DELETE FROM phone_numbers WHERE client_id = ${clientId}`;
    await sql`DELETE FROM clients WHERE id = ${clientId}`;
    console.log('[admin] deleted client and cleaned up resources:', clientId);
  } catch (err) {
    console.error('[admin] delete error:', err);
  }
  res.redirect(`/admin?secret=${req.query.secret}`);
});
