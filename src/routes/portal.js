import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import twilio from 'twilio';
import Stripe from 'stripe';
import sql from '../db/index.js';
import { TIER_LIMITS } from '../services/clientLoader.js';

const TIER_NAMES = { starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise' };

export const portalRouter = Router();

function requireClient(req, res, next) {
  const token = req.query.token;
  if (!token) return res.redirect('/portal/login');
  req.portalToken = token;
  next();
}

// Login page
portalRouter.get('/login', (req, res) => {
  const error = req.query.error;
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ringa — Client Portal</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body { font-family: Inter, sans-serif; background: #0a0a0a; }</style>
</head>
<body class="min-h-screen flex items-center justify-center p-4">
  <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-sm">
    <h1 class="text-2xl font-extrabold text-white mb-1">
      <span class="text-white">Ring</span><span class="text-sky-400">a</span> Portal
    </h1>
    <p class="text-zinc-500 text-sm mb-6">Sign in with your business email</p>
    ${error ? `<p class="text-red-400 text-sm mb-4 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">No account found with that email.</p>` : ''}
    <form method="POST" action="/portal/login" class="space-y-4">
      <input name="email" type="email" required placeholder="you@example.com" autofocus
        class="w-full bg-zinc-800 border border-zinc-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-sky-500 placeholder-zinc-500">
      <button type="submit"
        class="w-full bg-sky-400 hover:bg-sky-300 text-black font-bold py-3 rounded-lg transition-colors">
        Sign In
      </button>
    </form>
    <p class="text-zinc-600 text-xs mt-4 text-center">Use the email you signed up with</p>
  </div>
</body>
</html>`);
});

// Login submit
portalRouter.post('/login', async (req, res) => {
  const { email } = req.body;
  const [client] = await sql`SELECT portal_token FROM clients WHERE email = ${email} AND status IN ('active', 'past_due')`;
  if (!client) return res.redirect('/portal/login?error=1');
  res.redirect(`/portal?token=${client.portal_token}`);
});

// Portal dashboard
portalRouter.get('/', requireClient, async (req, res) => {
  const [client] = await sql`SELECT * FROM clients WHERE portal_token = ${req.portalToken} AND status IN ('active', 'past_due')`;
  if (!client) return res.redirect('/portal/login');

  const phoneNumbers = await sql`SELECT * FROM phone_numbers WHERE client_id = ${client.id} ORDER BY created_at ASC`;
  const tier = client.tier ?? 'starter';
  const limit = TIER_LIMITS[tier];
  const canAddNumber = phoneNumbers.length < limit;

  const calls = await sql`
    SELECT * FROM call_logs WHERE client_id = ${client.id} ORDER BY created_at DESC LIMIT 50
  `;

  const formatDate = (d) => new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

  const formatDuration = (s) => {
    if (!s) return '—';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ringa Portal — ${client.business_name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
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
    </span>
    <div class="flex items-center gap-4">
      <span class="text-zinc-400 text-sm">${client.business_name}</span>
      <a href="/portal/billing?token=${req.portalToken}" class="text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors">Manage Billing</a>
      <a href="/portal/login" class="text-zinc-600 hover:text-white text-sm transition-colors">Sign out</a>
    </div>
  </nav>

  <div class="max-w-5xl mx-auto px-6 py-8">

    ${client.status === 'past_due' ? `
    <div class="bg-red-900/30 border border-red-700 rounded-xl px-5 py-4 mb-6 flex items-center justify-between gap-4">
      <div>
        <p class="text-red-400 font-semibold text-sm">Payment failed</p>
        <p class="text-red-300/70 text-xs mt-0.5">Your last payment didn't go through. Update your billing details to keep your AI receptionist active.</p>
      </div>
      <a href="/portal/billing?token=${req.portalToken}" class="flex-shrink-0 bg-red-500 hover:bg-red-400 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
        Fix Payment
      </a>
    </div>` : ''}

    <!-- Account info -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p class="text-zinc-500 text-sm">Plan</p>
        <p class="text-xl font-bold text-white mt-1">${TIER_NAMES[tier]}</p>
        <p class="text-zinc-600 text-xs mt-1">${phoneNumbers.length} of ${limit} numbers used</p>
      </div>
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p class="text-zinc-500 text-sm">Total Calls</p>
        <p class="text-3xl font-extrabold text-white mt-1">${calls.length}</p>
      </div>
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p class="text-zinc-500 text-sm">Status</p>
        <p class="text-lg font-bold text-green-400 mt-1">Active</p>
        <p class="text-zinc-600 text-xs mt-1">AI receptionist is live</p>
      </div>
    </div>

    <!-- Phone numbers -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-6">
      <div class="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h2 class="font-bold text-white">Your Ringa Numbers</h2>
          <p class="text-zinc-500 text-sm mt-0.5">Forward your business calls to these numbers</p>
        </div>
        ${canAddNumber ? `
        <form method="POST" action="/portal/add-number?token=${req.portalToken}">
          <button type="submit" class="bg-sky-400 hover:bg-sky-300 text-black text-sm font-bold px-4 py-2 rounded-lg transition-colors">
            + Add Location
          </button>
        </form>` : `
        <span class="text-zinc-600 text-sm">${phoneNumbers.length}/${limit} numbers used</span>`}
      </div>
      <div class="divide-y divide-zinc-800">
        ${phoneNumbers.map(pn => `
        <div class="px-6 py-4 flex items-center justify-between">
          <div>
            <p class="font-semibold text-white font-mono text-lg">${pn.twilio_phone_number}</p>
            <p class="text-zinc-500 text-xs mt-0.5">${pn.label}</p>
          </div>
          <span class="text-xs bg-green-900/40 text-green-400 border border-green-800 px-3 py-1 rounded-full">Live</span>
        </div>`).join('')}
      </div>
    </div>

    <!-- Call logs -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div class="px-6 py-4 border-b border-zinc-800">
        <h2 class="font-bold text-white">Call History & Transcripts</h2>
        <p class="text-zinc-500 text-sm mt-0.5">Every call your AI receptionist handled</p>
      </div>

      ${calls.length === 0 ? `
      <div class="text-center py-16">
        <p class="text-zinc-500 text-lg">No calls yet</p>
        <p class="text-zinc-600 text-sm mt-1">Forward your business line to ${phoneNumbers[0]?.twilio_phone_number ?? 'your Ringa number'} to get started</p>
      </div>` : `
      <div class="divide-y divide-zinc-800">
        ${calls.map((call, i) => `
        <div class="px-6 py-5">
          <div class="flex items-start justify-between gap-4 mb-3">
            <div>
              <p class="font-semibold text-white">
                ${call.caller_number ? `Call from ${call.caller_number}` : 'Inbound Call'}
              </p>
              <p class="text-zinc-500 text-xs mt-0.5">${formatDate(call.created_at)} · ${formatDuration(call.duration_seconds)}</p>
            </div>
          </div>
          ${call.summary ? `
          <div class="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-3">
            <p class="text-xs font-semibold text-sky-400 mb-1">SUMMARY</p>
            <p class="text-zinc-300 text-sm">${call.summary}</p>
          </div>` : ''}
          ${call.transcript ? `
          <details class="group">
            <summary class="text-xs text-zinc-500 hover:text-sky-400 cursor-pointer transition-colors select-none">
              View full transcript ▾
            </summary>
            <div class="mt-3 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed font-mono max-h-64 overflow-y-auto">
${call.transcript}
            </div>
          </details>` : ''}
        </div>`).join('')}
      </div>`}
    </div>
  </div>

</body>
</html>`);
});

// Stripe billing portal redirect
portalRouter.get('/billing', requireClient, async (req, res) => {
  try {
    const [client] = await sql`SELECT * FROM clients WHERE portal_token = ${req.portalToken} AND status IN ('active', 'past_due')`;
    if (!client || !client.stripe_customer_id) return res.redirect(`/portal?token=${req.portalToken}`);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.billingPortal.sessions.create({
      customer: client.stripe_customer_id,
      return_url: `${process.env.APP_URL}/portal?token=${req.portalToken}`,
    });
    res.redirect(session.url);
  } catch (err) {
    console.error('[portal] billing portal error:', err);
    res.redirect(`/portal?token=${req.portalToken}`);
  }
});

// Add a new phone number / location
portalRouter.post('/add-number', requireClient, async (req, res) => {
  try {
    const [client] = await sql`SELECT * FROM clients WHERE portal_token = ${req.portalToken} AND status = 'active'`;
    if (!client) return res.redirect('/portal/login');

    const tier = client.tier ?? 'starter';
    const limit = TIER_LIMITS[tier];
    const phoneNumbers = await sql`SELECT id FROM phone_numbers WHERE client_id = ${client.id}`;

    if (phoneNumbers.length >= limit) {
      return res.redirect(`/portal?token=${req.portalToken}&error=limit`);
    }

    const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const areaCodes = [604, 778, 236, 250];
    let numbers = [];
    for (const areaCode of areaCodes) {
      numbers = await twilioClient.availablePhoneNumbers('CA').local.list({ areaCode, limit: 1 });
      if (numbers.length) break;
    }
    if (!numbers.length) throw new Error('No Canadian numbers available');

    const purchased = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber: numbers[0].phoneNumber,
      smsUrl: `${process.env.APP_URL}/webhooks/twilio/sms`,
    });

    const vapiRes = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.VAPI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${client.business_name} Receptionist (Location ${phoneNumbers.length + 1})`,
        model: {
          provider: 'anthropic',
          model: 'claude-sonnet-4-6',
          messages: [{ role: 'system', content: `You are the friendly AI receptionist for ${client.business_name}, a plumbing and HVAC company. Book appointments and dispatch emergencies.` }],
          tools: [
            { type: 'function', function: { name: 'bookAppointment', description: 'Book a service appointment', parameters: { type: 'object', properties: { CustomerName: { type: 'string' }, Phone: { type: 'string' }, serviceType: { type: 'string' }, address: { type: 'string' }, startTime: { type: 'string' } }, required: ['CustomerName', 'Phone', 'serviceType', 'address', 'startTime'] } } },
            { type: 'function', function: { name: 'dispatchEmergency', description: 'Alert on-call technician', parameters: { type: 'object', properties: { customerName: { type: 'string' }, phone: { type: 'string' }, address: { type: 'string' }, issue: { type: 'string' } }, required: ['customerName', 'phone', 'address', 'issue'] } } },
          ],
        },
        voice: { provider: '11labs', voiceId: 'jessica' },
        firstMessage: `Thank you for calling ${client.business_name}! How can I help you today?`,
        serverUrl: `${process.env.APP_URL}/webhooks/vapi`,
      }),
    });
    const vapiAssistant = await vapiRes.json();

    const vapiImportRes = await fetch('https://api.vapi.ai/phone-number', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.VAPI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'twilio',
        number: purchased.phoneNumber,
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
        assistantId: vapiAssistant.id,
      }),
    });
    const vapiPhone = await vapiImportRes.json();

    await sql`
      INSERT INTO phone_numbers (id, client_id, twilio_phone_number, vapi_phone_number_id, vapi_assistant_id, label)
      VALUES (${uuidv4()}, ${client.id}, ${purchased.phoneNumber}, ${vapiPhone.id}, ${vapiAssistant.id}, ${`Location ${phoneNumbers.length + 1}`})
    `;

    console.log('[portal] added number:', purchased.phoneNumber, 'for client:', client.id);
    res.redirect(`/portal?token=${req.portalToken}`);
  } catch (err) {
    console.error('[portal] add-number error:', err);
    res.redirect(`/portal?token=${req.portalToken}&error=provision`);
  }
});
