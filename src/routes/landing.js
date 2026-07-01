import { Router } from 'express';

export const landingRouter = Router();

landingRouter.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ringa — AI Receptionist for Plumbing & HVAC</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-white text-gray-900">

  <!-- Nav -->
  <nav class="fixed top-0 w-full bg-white/90 backdrop-blur border-b border-gray-100 z-50">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <span class="text-xl font-bold text-blue-600">Ringa</span>
      <a href="/onboard"
        class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
        Get Started
      </a>
    </div>
  </nav>

  <!-- Hero -->
  <section class="pt-32 pb-24 px-6 text-center bg-gradient-to-b from-blue-50 to-white">
    <div class="max-w-3xl mx-auto">
      <div class="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
        Built for Plumbing & HVAC
      </div>
      <h1 class="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
        Never miss a service call again
      </h1>
      <p class="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
        Ringa answers your phones 24/7, books appointments straight to your Google Calendar, and dispatches emergencies instantly — so you can focus on the work.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/onboard"
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
          Start Free Trial
        </a>
        <a href="#how-it-works"
          class="border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
          See How It Works
        </a>
      </div>
      <p class="text-sm text-gray-400 mt-4">Set up in 2 minutes. No technical knowledge needed.</p>
    </div>
  </section>

  <!-- Social proof bar -->
  <section class="bg-gray-50 border-y border-gray-100 py-8 px-6">
    <div class="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
      <div>
        <p class="text-3xl font-extrabold text-blue-600">24/7</p>
        <p class="text-sm text-gray-500 mt-1">Always answers</p>
      </div>
      <div>
        <p class="text-3xl font-extrabold text-blue-600">&lt;2 min</p>
        <p class="text-sm text-gray-500 mt-1">Setup time</p>
      </div>
      <div>
        <p class="text-3xl font-extrabold text-blue-600">0</p>
        <p class="text-sm text-gray-500 mt-1">Missed calls</p>
      </div>
      <div>
        <p class="text-3xl font-extrabold text-blue-600">100%</p>
        <p class="text-sm text-gray-500 mt-1">Automated booking</p>
      </div>
    </div>
  </section>

  <!-- How it works -->
  <section id="how-it-works" class="py-24 px-6">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-extrabold text-gray-900">Up and running in minutes</h2>
        <p class="text-gray-500 mt-3 text-lg">No hardware. No complicated setup. Just sign up and go.</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div class="text-center">
          <div class="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">1</div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Sign up & connect Calendar</h3>
          <p class="text-gray-500 text-sm">Enter your business details and connect your Google Calendar in one click.</p>
        </div>
        <div class="text-center">
          <div class="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">2</div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Get your Ringa number</h3>
          <p class="text-gray-500 text-sm">We instantly provision a dedicated phone number for your business.</p>
        </div>
        <div class="text-center">
          <div class="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">3</div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Forward your calls</h3>
          <p class="text-gray-500 text-sm">Forward your existing business line to Ringa and your AI receptionist handles the rest.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section class="py-24 px-6 bg-gray-50">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-extrabold text-gray-900">Everything you need</h2>
        <p class="text-gray-500 mt-3 text-lg">Ringa handles the whole customer experience from first ring to booked appointment.</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${[
          ['📞', 'Answers Every Call', 'Your AI receptionist picks up 24/7, even on evenings and weekends when your team is off.'],
          ['📅', 'Books Appointments', 'Collects customer info and books directly into your Google Calendar — no double-booking.'],
          ['🚨', 'Emergency Dispatch', 'Gas leaks, flooding, no heat — Ringa identifies emergencies and texts your on-call tech instantly.'],
          ['💬', 'SMS Confirmations', 'Customers get an instant text confirmation with their appointment details after booking.'],
          ['⏰', 'Reminder Texts', 'Automatic reminders sent 24 hours before each appointment to reduce no-shows.'],
          ['🕐', 'Business Hours', 'Ringa knows when you\'re open and only books during your working hours.'],
        ].map(([icon, title, desc]) => `
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div class="text-3xl mb-3">${icon}</div>
          <h3 class="font-bold text-gray-900 mb-2">${title}</h3>
          <p class="text-gray-500 text-sm">${desc}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section id="pricing" class="py-24 px-6">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-extrabold text-gray-900">Simple, transparent pricing</h2>
        <p class="text-gray-500 mt-3 text-lg">No setup fees. Cancel any time.</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">

        <div class="border-2 border-gray-200 rounded-2xl p-8">
          <h3 class="text-xl font-bold text-gray-900">Starter</h3>
          <p class="text-4xl font-extrabold text-gray-900 mt-4">$399<span class="text-base font-normal text-gray-400">/mo</span></p>
          <ul class="mt-6 space-y-3 text-sm text-gray-600">
            <li class="flex items-center gap-2"><span class="text-green-500 font-bold">✓</span> 1 AI receptionist</li>
            <li class="flex items-center gap-2"><span class="text-green-500 font-bold">✓</span> 1 dedicated phone number</li>
            <li class="flex items-center gap-2"><span class="text-green-500 font-bold">✓</span> Appointment booking</li>
            <li class="flex items-center gap-2"><span class="text-green-500 font-bold">✓</span> Emergency dispatch</li>
            <li class="flex items-center gap-2"><span class="text-green-500 font-bold">✓</span> SMS confirmations & reminders</li>
          </ul>
          <a href="/onboard" class="mt-8 block text-center border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 rounded-xl transition-colors">
            Get Started
          </a>
        </div>

        <div class="border-2 border-blue-500 rounded-2xl p-8 relative shadow-lg">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
          <h3 class="text-xl font-bold text-gray-900">Professional</h3>
          <p class="text-4xl font-extrabold text-gray-900 mt-4">$599<span class="text-base font-normal text-gray-400">/mo</span></p>
          <ul class="mt-6 space-y-3 text-sm text-gray-600">
            <li class="flex items-center gap-2"><span class="text-green-500 font-bold">✓</span> 3 AI receptionists</li>
            <li class="flex items-center gap-2"><span class="text-green-500 font-bold">✓</span> 3 dedicated phone numbers</li>
            <li class="flex items-center gap-2"><span class="text-green-500 font-bold">✓</span> Run multiple businesses</li>
            <li class="flex items-center gap-2"><span class="text-green-500 font-bold">✓</span> Everything in Starter</li>
          </ul>
          <a href="/onboard" class="mt-8 block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Get Started
          </a>
        </div>

        <div class="border-2 border-gray-200 rounded-2xl p-8">
          <h3 class="text-xl font-bold text-gray-900">Enterprise</h3>
          <p class="text-4xl font-extrabold text-gray-900 mt-4">$799<span class="text-base font-normal text-gray-400">/mo</span></p>
          <ul class="mt-6 space-y-3 text-sm text-gray-600">
            <li class="flex items-center gap-2"><span class="text-green-500 font-bold">✓</span> 5+ AI receptionists</li>
            <li class="flex items-center gap-2"><span class="text-green-500 font-bold">✓</span> 5+ dedicated phone numbers</li>
            <li class="flex items-center gap-2"><span class="text-green-500 font-bold">✓</span> Multiple locations</li>
            <li class="flex items-center gap-2"><span class="text-green-500 font-bold">✓</span> Everything in Professional</li>
          </ul>
          <a href="/onboard" class="mt-8 block text-center border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 rounded-xl transition-colors">
            Get Started
          </a>
        </div>

      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-24 px-6 bg-blue-600">
    <div class="max-w-3xl mx-auto text-center">
      <h2 class="text-4xl font-extrabold text-white mb-4">Ready to stop missing calls?</h2>
      <p class="text-blue-100 text-lg mb-8">Set up your AI receptionist in 2 minutes. No contracts, cancel any time.</p>
      <a href="/onboard"
        class="inline-block bg-white text-blue-600 hover:bg-blue-50 font-bold px-10 py-4 rounded-xl text-lg transition-colors">
        Get Started Today
      </a>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-8 px-6 border-t border-gray-100 text-center text-sm text-gray-400">
    <p>&copy; 2026 Ringa. All rights reserved.</p>
  </footer>

</body>
</html>`);
});
