import { Router } from 'express';

export const landingRouter = Router();

landingRouter.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ringa — AI Receptionist for Plumbing & HVAC</title>
  <meta name="description" content="Ringa answers every call, books appointments into your Google Calendar, sends SMS reminders, and dispatches emergencies — 24/7. Built for plumbing and HVAC businesses in Canada.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://getringa.ca">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://getringa.ca">
  <meta property="og:title" content="Ringa — AI Receptionist for Plumbing & HVAC">
  <meta property="og:description" content="Never miss a call again. Ringa answers 24/7, books appointments, and handles emergencies — so you can focus on the job.">
  <meta property="og:site_name" content="Ringa">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Ringa — AI Receptionist for Plumbing & HVAC">
  <meta name="twitter:description" content="Never miss a call again. Ringa answers 24/7, books appointments, and handles emergencies — so you can focus on the job.">
  <!-- Meta Pixel Code -->
  <script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '1127145183078310');
  fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=1127145183078310&ev=PageView&noscript=1"
  /></noscript>
  <!-- End Meta Pixel Code -->
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    body { font-family: 'Inter', sans-serif; }
    .metallic-bg {
      background: linear-gradient(135deg, #0f0f0f 0%, #1c1c1c 40%, #111111 70%, #0a0a0a 100%);
    }
    .metallic-card {
      background: linear-gradient(145deg, #1a1a1a, #111111);
      border: 1px solid #2a2a2a;
    }
    .metallic-nav {
      background: rgba(10,10,10,0.92);
      border-bottom: 1px solid #222;
    }
    .logo-ring { color: #ffffff; }
    .logo-a { color: #38bdf8; }
    .accent { color: #38bdf8; }
    .accent-bg { background-color: #38bdf8; }
    .accent-border { border-color: #38bdf8; }
  </style>
</head>
<body class="metallic-bg text-white">

  <!-- Nav -->
  <nav class="fixed top-0 w-full metallic-nav backdrop-blur z-50">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <span class="text-xl font-extrabold tracking-tight">
        <span class="logo-ring">Ring</span><span class="logo-a">a</span>
      </span>
      <div class="flex items-center gap-6">
        <a href="#contact" class="text-gray-400 hover:text-white text-sm font-medium transition-colors hidden sm:block">Contact</a>
        <a href="/onboard"
          class="accent-bg hover:bg-sky-400 text-black text-sm font-bold px-5 py-2.5 rounded-lg transition-colors">
          Get Started
        </a>
      </div>
    </div>
  </nav>

  <!-- Hero -->
  <section class="pt-32 pb-24 px-6 text-center">
    <div class="max-w-3xl mx-auto">
      <div class="inline-block bg-sky-900/40 text-sky-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-sky-700/40">
        Built for Plumbing & HVAC
      </div>
      <h1 class="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
        Your business, <span class="accent">always open</span>
      </h1>
      <p class="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
        Ringa is your AI receptionist — it answers every call, books appointments into your calendar, sends reminder texts, and handles emergencies. All day, every day, without you picking up the phone.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/onboard"
          class="accent-bg hover:bg-sky-400 text-black font-bold px-8 py-4 rounded-xl text-lg transition-colors">
          Start Free Trial
        </a>
        <a href="#how-it-works"
          class="border border-gray-600 hover:border-gray-400 text-gray-300 font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
          See How It Works
        </a>
      </div>
      <p class="text-sm text-gray-600 mt-4">7-day free trial. Set up in 2 minutes. No technical knowledge needed.</p>
    </div>
  </section>

  <!-- Social proof bar -->
  <section class="border-y border-gray-800 py-8 px-6" style="background:rgba(255,255,255,0.02)">
    <div class="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
      <div>
        <p class="text-3xl font-extrabold accent">24/7</p>
        <p class="text-sm text-gray-500 mt-1">Always answers</p>
      </div>
      <div>
        <p class="text-3xl font-extrabold accent">&lt;2 min</p>
        <p class="text-sm text-gray-500 mt-1">Setup time</p>
      </div>
      <div>
        <p class="text-3xl font-extrabold accent">0</p>
        <p class="text-sm text-gray-500 mt-1">Missed calls</p>
      </div>
      <div>
        <p class="text-3xl font-extrabold accent">100%</p>
        <p class="text-sm text-gray-500 mt-1">Automated booking</p>
      </div>
    </div>
  </section>

  <!-- Testimonials -->
  <section class="py-24 px-6 border-t border-gray-800">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-extrabold">What business owners are saying</h2>
        <p class="text-gray-500 mt-3 text-lg">Real results from plumbing and HVAC companies using Ringa</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">

        <div class="metallic-card rounded-2xl p-7">
          <div class="flex gap-1 mb-4">
            ${'★'.repeat(5).split('').map(() => '<span class="text-yellow-400">★</span>').join('')}
          </div>
          <p class="text-gray-300 text-sm leading-relaxed mb-5">"I used to miss 4 or 5 calls a day while I was on a job. Since getting Ringa, every one of those calls turns into a booked appointment. It paid for itself in the first week."</p>
          <div>
            <p class="font-bold text-white text-sm">Mike T.</p>
            <p class="text-gray-600 text-xs">Owner, T&S Plumbing — Surrey, BC</p>
          </div>
        </div>

        <div class="metallic-card rounded-2xl p-7">
          <div class="flex gap-1 mb-4">
            ${'★'.repeat(5).split('').map(() => '<span class="text-yellow-400">★</span>').join('')}
          </div>
          <p class="text-gray-300 text-sm leading-relaxed mb-5">"My customers are always surprised how smooth it is. Ringa books the appointment, sends them a text, and reminds them the next day. I don't have to do anything."</p>
          <div>
            <p class="font-bold text-white text-sm">Sandra L.</p>
            <p class="text-gray-600 text-xs">Owner, Comfort HVAC — Burnaby, BC</p>
          </div>
        </div>

        <div class="metallic-card rounded-2xl p-7">
          <div class="flex gap-1 mb-4">
            ${'★'.repeat(5).split('').map(() => '<span class="text-yellow-400">★</span>').join('')}
          </div>
          <p class="text-gray-300 text-sm leading-relaxed mb-5">"We had a gas leak call at 2am on a Saturday. Ringa caught it, recognized it as an emergency, and texted my on-call guy immediately. That's exactly what we needed."</p>
          <div>
            <p class="font-bold text-white text-sm">Dave K.</p>
            <p class="text-gray-600 text-xs">Owner, Kwik Plumbing — Langley, BC</p>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- How it works -->
  <section id="how-it-works" class="py-24 px-6">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-extrabold">Up and running in minutes</h2>
        <p class="text-gray-500 mt-3 text-lg">No hardware. No complicated setup. Just sign up and go.</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div class="text-center">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold mx-auto mb-4 accent-bg text-black">1</div>
          <h3 class="text-lg font-bold mb-2">Sign up & connect Calendar</h3>
          <p class="text-gray-500 text-sm">Enter your business details and connect your Google Calendar in one click.</p>
        </div>
        <div class="text-center">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold mx-auto mb-4 accent-bg text-black">2</div>
          <h3 class="text-lg font-bold mb-2">Get your Ringa number</h3>
          <p class="text-gray-500 text-sm">We instantly provision a dedicated phone number for your business.</p>
        </div>
        <div class="text-center">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold mx-auto mb-4 accent-bg text-black">3</div>
          <h3 class="text-lg font-bold mb-2">Forward your calls</h3>
          <p class="text-gray-500 text-sm">Forward your existing business line to Ringa and your AI receptionist handles the rest.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section class="py-24 px-6" style="background:rgba(255,255,255,0.02)">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-extrabold">Everything you need</h2>
        <p class="text-gray-500 mt-3 text-lg">Ringa handles the whole customer experience from first ring to booked appointment.</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${[
          ['📞', 'Answers Every Call', 'Your AI receptionist picks up 24/7, even on evenings and weekends when your team is off.'],
          ['📅', 'Books Appointments', 'Collects customer info and books directly into your Google Calendar — no double-booking.'],
          ['🚨', 'Emergency Dispatch', 'Gas leaks, flooding, no heat — Ringa identifies emergencies and texts your on-call tech instantly.'],
          ['💬', 'SMS Confirmations', 'Customers get an instant text confirmation with their appointment details after booking.'],
          ['⏰', 'Reminder Texts', 'Automatic reminders sent 24 hours before each appointment to reduce no-shows.'],
          ['🕐', 'Business Hours', "Ringa knows when you're open and only books during your working hours."],
        ].map(([icon, title, desc]) => `
        <div class="metallic-card rounded-2xl p-6">
          <div class="text-3xl mb-3">${icon}</div>
          <h3 class="font-bold text-white mb-2">${title}</h3>
          <p class="text-gray-500 text-sm">${desc}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section id="pricing" class="py-24 px-6">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-extrabold">Simple, transparent pricing</h2>
        <p class="text-gray-500 mt-3 text-lg">7-day free trial on all plans. No setup fees. Cancel any time.</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">

        <div class="metallic-card rounded-2xl p-8">
          <h3 class="text-xl font-bold text-white">Starter</h3>
          <p class="text-4xl font-extrabold text-white mt-4">$399<span class="text-base font-normal text-gray-500">/mo</span></p>
          <ul class="mt-6 space-y-3 text-sm text-gray-400">
            <li class="flex items-center gap-2"><span class="accent font-bold">✓</span> 1 AI receptionist</li>
            <li class="flex items-center gap-2"><span class="accent font-bold">✓</span> 1 dedicated phone number</li>
            <li class="flex items-center gap-2"><span class="accent font-bold">✓</span> Appointment booking</li>
            <li class="flex items-center gap-2"><span class="accent font-bold">✓</span> Emergency dispatch</li>
            <li class="flex items-center gap-2"><span class="accent font-bold">✓</span> SMS confirmations & reminders</li>
          </ul>
          <a href="/onboard" class="mt-8 block text-center border border-sky-500 text-sky-400 hover:bg-sky-500 hover:text-black font-semibold py-3 rounded-xl transition-colors">
            Get Started
          </a>
        </div>

        <div class="rounded-2xl p-8 relative border-2 border-sky-500" style="background: linear-gradient(145deg, #0c1f2e, #0a1520);">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 accent-bg text-black text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
          <h3 class="text-xl font-bold text-white">Professional</h3>
          <p class="text-4xl font-extrabold text-white mt-4">$599<span class="text-base font-normal text-gray-500">/mo</span></p>
          <ul class="mt-6 space-y-3 text-sm text-gray-400">
            <li class="flex items-center gap-2"><span class="accent font-bold">✓</span> 3 AI receptionists</li>
            <li class="flex items-center gap-2"><span class="accent font-bold">✓</span> 3 dedicated phone numbers</li>
            <li class="flex items-center gap-2"><span class="accent font-bold">✓</span> Run multiple businesses</li>
            <li class="flex items-center gap-2"><span class="accent font-bold">✓</span> Everything in Starter</li>
          </ul>
          <a href="/onboard" class="mt-8 block text-center accent-bg hover:bg-sky-400 text-black font-bold py-3 rounded-xl transition-colors">
            Get Started
          </a>
        </div>

        <div class="metallic-card rounded-2xl p-8">
          <h3 class="text-xl font-bold text-white">Enterprise</h3>
          <p class="text-4xl font-extrabold text-white mt-4">$799<span class="text-base font-normal text-gray-500">/mo</span></p>
          <ul class="mt-6 space-y-3 text-sm text-gray-400">
            <li class="flex items-center gap-2"><span class="accent font-bold">✓</span> 5+ AI receptionists</li>
            <li class="flex items-center gap-2"><span class="accent font-bold">✓</span> 5+ dedicated phone numbers</li>
            <li class="flex items-center gap-2"><span class="accent font-bold">✓</span> Multiple locations</li>
            <li class="flex items-center gap-2"><span class="accent font-bold">✓</span> Everything in Professional</li>
          </ul>
          <a href="/onboard" class="mt-8 block text-center border border-sky-500 text-sky-400 hover:bg-sky-500 hover:text-black font-semibold py-3 rounded-xl transition-colors">
            Get Started
          </a>
        </div>

      </div>

      <!-- What's included detail -->
      <div class="mt-16 metallic-card rounded-2xl p-8 border border-zinc-800">
        <h3 class="text-2xl font-extrabold text-white text-center mb-10">Everything included on every plan</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">

          <div class="flex gap-4">
            <div class="text-2xl flex-shrink-0">📞</div>
            <div>
              <p class="font-bold text-white mb-1">Answers every call, 24/7</p>
              <p class="text-gray-500 text-sm">Ringa picks up the phone every time — evenings, weekends, holidays. Customers always reach a live voice, never a voicemail.</p>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="text-2xl flex-shrink-0">📅</div>
            <div>
              <p class="font-bold text-white mb-1">Books appointments automatically</p>
              <p class="text-gray-500 text-sm">Ringa asks the customer for their name, address, and what they need — then books it straight into your Google Calendar. No back-and-forth, no manual entry.</p>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="text-2xl flex-shrink-0">💬</div>
            <div>
              <p class="font-bold text-white mb-1">Sends text confirmations</p>
              <p class="text-gray-500 text-sm">After every booking, the customer automatically gets a text with their appointment details. They can reply REMOVE to cancel or RESCHEDULE to change the time.</p>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="text-2xl flex-shrink-0">⏰</div>
            <div>
              <p class="font-bold text-white mb-1">Reminds customers the day before</p>
              <p class="text-gray-500 text-sm">Ringa automatically sends a reminder text 24 hours before each appointment — cutting down no-shows without you lifting a finger.</p>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="text-2xl flex-shrink-0">🚨</div>
            <div>
              <p class="font-bold text-white mb-1">Handles emergencies instantly</p>
              <p class="text-gray-500 text-sm">If a customer calls with a gas leak, flooding, or no heat — Ringa recognizes it as an emergency and immediately texts your on-call technician with the customer's name, address, and problem.</p>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="text-2xl flex-shrink-0">🕐</div>
            <div>
              <p class="font-bold text-white mb-1">Respects your business hours</p>
              <p class="text-gray-500 text-sm">Ringa only books appointments during your open hours. Try to book on a Sunday? It'll let the customer know when you're available next.</p>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="text-2xl flex-shrink-0">📋</div>
            <div>
              <p class="font-bold text-white mb-1">Full call transcripts in your portal</p>
              <p class="text-gray-500 text-sm">Every call is recorded and transcribed. Log into your portal any time to read a full summary of what was discussed on every call.</p>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="text-2xl flex-shrink-0">⚡</div>
            <div>
              <p class="font-bold text-white mb-1">Ready in under 2 minutes</p>
              <p class="text-gray-500 text-sm">No equipment to install. No tech skills needed. Sign up, connect your Google Calendar, and your AI receptionist is live — that's it.</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  </section>

  <!-- FAQ -->
  <section class="py-24 px-6 border-t border-gray-800">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-extrabold">Common questions</h2>
        <p class="text-gray-500 mt-3 text-lg">Everything you need to know before signing up</p>
      </div>
      <div class="space-y-4">

        ${[
          ['Do I need any technical knowledge to set up Ringa?', 'No. You fill out a short form, connect your Google Calendar with one click, and you\'re done. The whole thing takes under 2 minutes. We handle everything else.'],
          ['How does the AI know when I\'m available?', 'By default, Ringa books appointments Monday–Friday 8am–5pm and Saturday 8am–12pm. If someone calls outside those hours, Ringa lets them know when you\'re next available.'],
          ['What happens if someone calls with an emergency?', 'Ringa recognizes emergency situations — gas leaks, flooding, no heat — and immediately sends an urgent text to your business phone number with the customer\'s name, address, and issue.'],
          ['Do my customers know they\'re talking to an AI?', 'Ringa sounds natural and professional. Most customers don\'t ask, but if they do, Ringa is honest. The goal is to make the experience as smooth as a real receptionist.'],
          ['What if I already have a business phone number?', 'You keep your existing number. Simply forward your calls to your Ringa number and Ringa handles everything from there. You can turn forwarding on or off any time.'],
          ['Can I cancel any time?', 'Yes. Cancel any time from your Stripe billing portal. No cancellation fees, no contracts. Your number stays active until the end of your billing period.'],
          ['What happens during my 7-day free trial?', 'You get full access to everything — your AI receptionist is live, calls are answered, appointments are booked. Your card is on file but you won\'t be charged until day 8.'],
          ['Can I use Ringa for multiple locations?', 'Yes. The Professional plan supports up to 3 locations and the Enterprise plan supports 5+. Each location gets its own dedicated phone number and AI receptionist.'],
        ].map(([q, a]) => `
        <details class="metallic-card rounded-xl group">
          <summary class="px-6 py-5 cursor-pointer flex items-center justify-between font-semibold text-white select-none list-none">
            ${q}
            <span class="text-sky-400 text-xl ml-4 flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
          </summary>
          <div class="px-6 pb-5 text-gray-500 text-sm leading-relaxed">${a}</div>
        </details>`).join('')}

      </div>
    </div>
  </section>

  <!-- Contact -->
  <section id="contact" class="py-24 px-6 border-t border-gray-800">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-extrabold">Have questions? We're here.</h2>
        <p class="text-gray-500 mt-3 text-lg">Talk to a real person before you sign up — no pressure, no sales pitch.</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">

        <div class="metallic-card rounded-2xl p-8 flex gap-5 items-start">
          <div class="text-3xl flex-shrink-0">📧</div>
          <div>
            <p class="font-bold text-white text-lg mb-1">Email us</p>
            <p class="text-gray-500 text-sm mb-3">Send us any question and we'll get back to you within a few hours.</p>
            <a href="mailto:getringa@gmail.com" class="accent font-semibold hover:underline">getringa@gmail.com</a>
          </div>
        </div>

        <div class="metallic-card rounded-2xl p-8 flex gap-5 items-start">
          <div class="text-3xl flex-shrink-0">📱</div>
          <div>
            <p class="font-bold text-white text-lg mb-1">Call or text us</p>
            <p class="text-gray-500 text-sm mb-3">Speak directly with someone from the Ringa team — call or text anytime.</p>
            <a href="tel:+12368822840" class="accent font-semibold hover:underline">+1 (236) 882-2840</a>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-24 px-6 border-t border-gray-800">
    <div class="max-w-3xl mx-auto text-center">
      <h2 class="text-4xl font-extrabold mb-4">Ready to stop missing calls?</h2>
      <p class="text-gray-500 text-lg mb-8">Set up your AI receptionist in 2 minutes. No contracts, cancel any time.</p>
      <a href="/onboard"
        class="inline-block accent-bg hover:bg-sky-400 text-black font-bold px-10 py-4 rounded-xl text-lg transition-colors">
        Get Started Today
      </a>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-8 px-6 border-t border-gray-800 text-center text-sm text-gray-600">
    <p>&copy; 2026 <span class="logo-ring">Ring</span><span class="logo-a">a</span> &nbsp;·&nbsp; <a href="/terms" class="hover:text-gray-400 transition-colors">Terms of Service</a> &nbsp;·&nbsp; <a href="/privacy" class="hover:text-gray-400 transition-colors">Privacy Policy</a></p>
  </footer>

</body>
</html>`);
});
