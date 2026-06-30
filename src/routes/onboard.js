import { Router } from 'express';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
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
  <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-900">Welcome to Ringa</h1>
      <p class="text-gray-500 mt-2">Set up your AI receptionist in 2 minutes</p>
    </div>

    <form action="/onboard/submit" method="POST" class="space-y-5">
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
        <p class="text-xs text-gray-400 mt-1">This number gets an SMS when a caller reports an emergency</p>
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
        <p class="text-xs text-gray-400 mt-1">Found in Google Calendar → Settings → Integrate calendar</p>
      </div>

      <button type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
        Continue → Connect Google Calendar
      </button>
    </form>
  </div>
</body>
</html>`);
});

// Step 2 — save form data, redirect to Google OAuth
onboardRouter.post('/submit', async (req, res) => {
  const { businessName, email, emergencyNumber, timezone, calendarId } = req.body;
  const clientId = `client-${uuidv4().slice(0, 8)}`;

  await sql`
    INSERT INTO clients (id, business_name, timezone, emergency_number, business_hours, google_calendar_id, status)
    VALUES (${clientId}, ${businessName}, ${timezone}, ${emergencyNumber}, ${JSON.stringify(DEFAULT_HOURS)}, ${calendarId}, 'pending')
  `;

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
});

// Step 3 — Google OAuth callback, provision Twilio + Vapi
onboardRouter.get('/google/callback', async (req, res) => {
  const { code, state: clientId } = req.query;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL}/onboard/google/callback`,
  );

  const { tokens } = await oauth2Client.getToken(code);
  const refreshToken = tokens.refresh_token;

  // Buy a Twilio phone number
  const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const [client] = await sql`SELECT * FROM clients WHERE id = ${clientId}`;

  const numbers = await twilioClient.availablePhoneNumbers('CA').local.list({
    areaCode: 604,
    limit: 1,
  });
  const purchased = await twilioClient.incomingPhoneNumbers.create({
    phoneNumber: numbers[0]?.phoneNumber,
    smsUrl: `${process.env.APP_URL}/webhooks/twilio/sms`,
  });

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

  // Assign phone number to Vapi assistant
  await fetch(`https://api.vapi.ai/phone-number/${purchased.sid}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ assistantId: vapiAssistant.id }),
  });

  // Get Vapi phone number ID
  const vapiPhoneRes = await fetch(`https://api.vapi.ai/phone-number?twilioPhoneNumber=${purchased.phoneNumber}`, {
    headers: { 'Authorization': `Bearer ${process.env.VAPI_API_KEY}` },
  });
  const vapiPhones = await vapiPhoneRes.json();
  const vapiPhoneNumberId = vapiPhones[0]?.id;

  // Save everything to DB
  await sql`
    UPDATE clients SET
      google_refresh_token = ${refreshToken},
      twilio_phone_number = ${purchased.phoneNumber},
      vapi_assistant_id = ${vapiAssistant.id},
      vapi_phone_number_id = ${vapiPhoneNumberId},
      status = 'active'
    WHERE id = ${clientId}
  `;

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
});
