import { Router } from 'express';
import sql from '../db/index.js';

export const adminRouter = Router();

function requireOwner(req, res, next) {
  const secret = req.query.secret || req.cookies?.adminSecret;
  if (secret !== process.env.OWNER_SECRET) {
    return res.status(401).send(`<!DOCTYPE html>
<html><head><title>Ringa Admin</title>
<script src="https://cdn.tailwindcss.com"></script>
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
  const clients = await sql`SELECT * FROM clients ORDER BY created_at DESC`;
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
  const revenue = activeClients.reduce((sum, c) => {
    if (c.stripe_subscription_id) return sum + 399;
    return sum;
  }, 0);

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ringa Admin</title>
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
        <p class="text-3xl font-extrabold text-sky-400 mt-1">$${(activeClients.length * 399).toLocaleString()}</p>
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

adminRouter.post('/delete', requireOwner, async (req, res) => {
  const { clientId } = req.body;
  await sql`DELETE FROM clients WHERE id = ${clientId}`;
  console.log('[admin] deleted client:', clientId);
  res.redirect(`/admin?secret=${req.query.secret}`);
});
