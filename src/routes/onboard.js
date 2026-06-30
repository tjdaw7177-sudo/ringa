import { Router } from 'express';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';
import sql from '../db/index.js';
import twilio from 'twilio';


export const onboardRouter = Router();

const DEFAULT_HOURS = {
  "0": null,
  "1": { "open": 8, "close": 17 },
  "2": { "open": 8, "close": 17 },
  "3": { "open": 8, "close": 17 },
  "4": { "open": 8, "close": 17 },
  "5": { "open": 8, "close": 17 },
  "6": { "open": 8, "close": 12 }
};

// Step 1 — show onboarding form
onboardRouter.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ringa — Get Started</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
  <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-900">Welcome to Ringa</h1>
      <p class="text-gray-500 mt-2">Set up your AI receptionist in 2 minutes</p>
    </div>

    <form action="/onboard/submit" method="POST" class="space-y-8">

      <!-- Plan selection -->
      <div>
        <p class="text-sm font-semibold text-gray-700 mb-3">Choose your plan</p>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">

          <label class="relative cursor-pointer">
            <input type="radio" name="priceId" value="${process.env.STRIPE_PRICE_ID_TIER1}" required class="peer sr-only">
            <div class="border-2 border-gray-200 rounded-xl p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all">
              <p class="font-bold text-gray-900 text-lg">Starter</p>
              <p class="text-2xl font-extrabold text-blue-600 mt-1">$399<span class="text-sm font-normal text-gray-400">/mo</span></p>
              <ul class="mt-3 space-y-1 text-sm text-gray-600">
                <li>✓ 1 AI receptionist</li>
                <li>✓ 1 phone number</li>
                <li>✓ Appointment booking</li>
                <li>✓ Emergency dispatch</li>
                <li>✓ SMS reminders</li>
              </ul>
            </div>
          </label>

          <label class="relative cursor-pointer">
            <input type="radio" name="priceId" value="${process.env.STRIPE_PRICE_ID_TIER2}" class="peer sr-only">
            <div class="border-2 border-gray-200 rounded-xl p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all">
              <div class="flex items-center justify-between mb-1">
                <p class="font-bold text-gray-900 text-lg">Professional</p>
                <span class="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">Popular</span>
              </div>
              <p class="text-2xl font-extrabold text-blue-600 mt-1">$599<span class="text-sm font-normal text-gray-400">/mo</span></p>
              <ul class="mt-3 space-y-1 text-sm text-gray-600">
                <li>✓ 3 AI receptionists</li>
                <li>✓ 3 phone numbers</li>
                <li>✓ Multiple businesses</li>
                <li>✓ Everything in Starter</li>
              </ul>
            </div>
          </label>

          <label class="relative cursor-pointer">
            <input type="radio" name="priceId" value="${process.env.STRIPE_PRICE_ID_TIER3}" class="peer sr-only">
            <div class="border-2 border-gray-200 rounded-xl p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all">
              <p class="font-bold text-gray-900 text-lg">Enterprise</p>
              <p class="text-2xl font-extrabold text-blue-600 mt-1">$799<span class="text-sm font-normal text-gray-400">/mo</span></p>
              <ul class="mt-3 space-y-1 text-sm text-gray-600">
                <li>✓ 5+ AI receptionists</li>
                <li>✓ 5+ phone numbers</li>
                <li>✓ Multiple locations</li>
                <li>✓ Everything in Pro</li>
              </ul>
            </div>
          </label>

        </div>
      </div>

      <!-- Business details -->
      <div class="space-y-5">
        <p class="text-sm font-semibold text-gray-700">Your business details</p>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
          <input name="businessName" required placeholder="e.g. Smith Plumbing & HVAC"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
          <input name="email" type="email" required placeholder="you@example.com"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Emergency / On-Call Number</label>
          <input name="emergencyNumber" type="tel" required placeholder="+17785551234"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <p class="text-xs text-gray-400 mt-1">Gets an SMS when a caller reports an emergency</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <select name="timezone" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="America/Vancouver">Pacific Time (Vancouver / Seattle)</option>
            <option value="America/Edmonton">Mountain Time (Calgary / Denver)</option>
            <option value="America/Winnipeg">Central Time (Winnipeg / Chicago)</option>
            <option value="America/Toronto">Eastern Time (Toronto / New York)</option>
            <option value="America/Halifax">Atlantic Time (Halifax)</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Google Calendar ID</label>
          <input name="calendarId" required placeholder="you@gmail.com"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <p class="text-xs text-gray-400 mt-1">Usually your Gmail address. Found in Google Calendar → Settings → Integrate calendar → Calendar ID</p>
        </div>
      </div>

      <button type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors text-lg">
        Continue → Secure Payment
      </button>
    </form>
  </div>
</body>
</html>`);
});

// Step 2 — save form data, redirect to Stripe Checkout
onboardRouter.post('/submit', async (req, res) => {
  try {
    let { businessName, email, emergencyNumber, timezone, calendarId, priceId } = req.body;
    const srcMatch = calendarId?.match(/[?&]src=([^&]+)/);
    if (srcMatch) calendarId = decodeURIComponent(srcMatch[1]);

    const validPriceIds = [
      process.env.STRIPE_PRICE_ID_TIER1,
      process.env.STRIPE_PRICE_ID_TIER2,
      process.env.STRIPE_PRICE_ID_TIER3,
    ];
    if (!validPriceIds.includes(priceId)) {
      return res.status(400).send('Invalid plan selected.');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log('[onboard] submit:', { businessName, email, timezone, calendarId, priceId });

    const clientId = `client-${uuidv4().slice(0, 8)}`;

    await sql`
      INSERT INTO clients (id, business_name, timezone, emergency_number, business_hours, google_calendar_id, status)
      VALUES (
        ${clientId},
        ${businessName},
        ${timezone},
        ${emergencyNumber},
        ${sql.json(DEFAULT_HOURS)},
        ${calendarId},
        'pending'
      )
    `;
    console.log('[onboard] client row created:', clientId);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { clientId },
      success_url: `${process.env.APP_URL}/onboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/onboard`,
    });

    res.redirect(session.url);
  } catch (err) {
    console.error('[onboard] submit error:', err);
    res.status(500).send(`<pre>Onboarding error: ${err.message}</pre>`);
  }
});

// Step 3 — Stripe payment confirmed, redirect to Google OAuth
onboardRouter.get('/payment-success', async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    const clientId = session.metadata?.clientId;
    if (!clientId) throw new Error('Missing clientId in Stripe session metadata');

    await sql`
      UPDATE clients SET
        stripe_customer_id = ${session.customer},
        stripe_subscription_id = ${session.subscription}
      WHERE id = ${clientId}
    `;
    console.log('[onboard] payment confirmed for:', clientId);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.APP_URL}/onboard/google/callback`,
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar'],
      state: clientId,
    });

    res.redirect(authUrl);
  } catch (err) {
    console.error('[onboard] payment-success error:', err);
    res.status(500).send(`<pre>Error: ${err.message}</pre>`);
  }
});

// Step 3 — Google OAuth callback, provision Twilio + Vapi
onboardRouter.get('/google/callback', async (req, res) => {
  try {
    const { code, state: clientId } = req.query;
    console.log('[onboard] google callback for client:', clientId);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.APP_URL}/onboard/google/callback`,
    );

    const { tokens } = await oauth2Client.getToken(code);
    const refreshToken = tokens.refresh_token;
    console.log('[onboard] got refresh token:', !!refreshToken);

    const [client] = await sql`SELECT * FROM clients WHERE id = ${clientId}`;
    console.log('[onboard] loaded client:', client?.business_name);

    // Buy a Twilio phone number — try BC area codes in order
    const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const areaCodes = [604, 778, 236, 250];
    let numbers = [];
    for (const areaCode of areaCodes) {
      numbers = await twilioClient.availablePhoneNumbers('CA').local.list({ areaCode, limit: 1 });
      if (numbers.length) { console.log('[onboard] found number in area code:', areaCode); break; }
    }
    if (!numbers.length) throw new Error('No Canadian numbers available in 604/778/236/250');

    const purchased = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber: numbers[0].phoneNumber,
      smsUrl: `${process.env.APP_URL}/webhooks/twilio/sms`,
    });
    console.log('[onboard] purchased Twilio number:', purchased.phoneNumber);

    // Create Vapi assistant
    const vapiRes = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${client.business_name} Receptionist`,
        model: {
          provider: 'anthropic',
          model: 'claude-sonnet-4-6',
          messages: [{
            role: 'system',
            content: `You are the friendly AI receptionist for ${client.business_name}, a plumbing and HVAC company. Your job is to:
1. Greet callers warmly and understand their need
2. Determine if this is an EMERGENCY (no heat, gas leak, flooding) or a routine appointment
3. For emergencies: collect name, address, and issue, then call dispatchEmergency
4. For appointments: collect name, phone, service address, service type, and preferred time, then call bookAppointment
5. Confirm all details back before executing any function

Always be calm, professional, and empathetic.`,
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
        firstMessage: `Thank you for calling ${client.business_name}! How can I help you today?`,
        serverUrl: `${process.env.APP_URL}/webhooks/vapi`,
      }),
    });
    const vapiAssistant = await vapiRes.json();
    console.log('[onboard] created Vapi assistant:', vapiAssistant.id);
    if (!vapiAssistant.id) throw new Error(`Vapi assistant creation failed: ${JSON.stringify(vapiAssistant)}`);

    // Import the Twilio number into Vapi and link the assistant
    const vapiImportRes = await fetch('https://api.vapi.ai/phone-number', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'twilio',
        number: purchased.phoneNumber,
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
        assistantId: vapiAssistant.id,
      }),
    });
    const vapiPhone = await vapiImportRes.json();
    console.log('[onboard] imported phone into Vapi:', vapiPhone.id);

    // Save everything to DB
    await sql`
      UPDATE clients SET
        google_refresh_token = ${refreshToken},
        twilio_phone_number = ${purchased.phoneNumber},
        vapi_assistant_id = ${vapiAssistant.id},
        vapi_phone_number_id = ${vapiPhone.id},
        status = 'active'
      WHERE id = ${clientId}
    `;
    console.log('[onboard] client activated:', clientId);

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ringa — You're Live!</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
  <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg text-center">
    <div class="text-5xl mb-4">🎉</div>
    <h1 class="text-3xl font-bold text-gray-900 mb-2">You're live!</h1>
    <p class="text-gray-500 mb-6">Your AI receptionist is ready to take calls</p>

    <div class="bg-blue-50 rounded-xl p-5 text-left mb-6">
      <p class="text-sm font-medium text-gray-500 mb-1">Your Ringa phone number</p>
      <p class="text-2xl font-bold text-blue-600">${purchased.phoneNumber}</p>
      <p class="text-sm text-gray-400 mt-2">Forward your business calls to this number</p>
    </div>

    <p class="text-sm text-gray-500">Bookings will appear in your Google Calendar automatically.<br>
    Customers can text <strong>REMOVE</strong> to cancel or <strong>RESCHEDULE</strong> to change.</p>
  </div>
</body>
</html>`);
  } catch (err) {
    console.error('[onboard] callback error:', err);
    res.status(500).send(`<pre>Provisioning error: ${err.message}</pre>`);
  }
});
