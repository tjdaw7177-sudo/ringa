import { Router } from 'express';
import sql from '../db/index.js';

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
  const [client] = await sql`SELECT portal_token FROM clients WHERE email = ${email} AND status = 'active'`;
  if (!client) return res.redirect('/portal/login?error=1');
  res.redirect(`/portal?token=${client.portal_token}`);
});

// Portal dashboard
portalRouter.get('/', requireClient, async (req, res) => {
  const [client] = await sql`SELECT * FROM clients WHERE portal_token = ${req.portalToken} AND status = 'active'`;
  if (!client) return res.redirect('/portal/login');

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
      <a href="/portal/login" class="text-zinc-600 hover:text-white text-sm transition-colors">Sign out</a>
    </div>
  </nav>

  <div class="max-w-5xl mx-auto px-6 py-8">

    <!-- Account info -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p class="text-zinc-500 text-sm">Your Ringa Number</p>
        <p class="text-xl font-bold text-sky-400 mt-1 font-mono">${client.twilio_phone_number ?? '—'}</p>
        <p class="text-zinc-600 text-xs mt-1">Forward your business calls here</p>
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

    <!-- Call logs -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div class="px-6 py-4 border-b border-zinc-800">
        <h2 class="font-bold text-white">Call History & Transcripts</h2>
        <p class="text-zinc-500 text-sm mt-0.5">Every call your AI receptionist handled</p>
      </div>

      ${calls.length === 0 ? `
      <div class="text-center py-16">
        <p class="text-zinc-500 text-lg">No calls yet</p>
        <p class="text-zinc-600 text-sm mt-1">Forward your business line to ${client.twilio_phone_number} to get started</p>
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
