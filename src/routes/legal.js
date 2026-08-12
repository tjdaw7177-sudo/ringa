import { Router } from 'express';

export const legalRouter = Router();

legalRouter.get('/terms', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service — Ringa</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body { font-family: 'Inter', sans-serif; background: #0a0a0a; }
    .prose h2 { color: #fff; font-size: 1.2rem; font-weight: 700; margin: 2rem 0 0.75rem; }
    .prose p, .prose li { color: #9ca3af; font-size: 0.95rem; line-height: 1.8; }
    .prose ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
  </style>
</head>
<body class="min-h-screen text-white">

  <nav class="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
    <a href="/" class="text-lg font-extrabold">
      <span class="text-white">Ring</span><span class="text-sky-400">a</span>
    </a>
    <a href="/" class="text-zinc-500 hover:text-white text-sm transition-colors">← Back</a>
  </nav>

  <div class="max-w-3xl mx-auto px-6 py-16">
    <p class="text-sky-400 text-sm font-semibold mb-2">Legal</p>
    <h1 class="text-4xl font-extrabold text-white mb-2">Terms of Service</h1>
    <p class="text-zinc-500 text-sm mb-12">Last updated: August 2026</p>

    <div class="prose">

      <p>These Terms of Service ("Terms") govern your use of Ringa ("Service"), operated by Ringa ("we", "us", or "our"). By signing up you agree to these Terms.</p>

      <h2>1. What Ringa Does</h2>
      <p>Ringa provides an AI-powered telephone receptionist service for plumbing and HVAC businesses. The Service answers inbound calls, books appointments to Google Calendar, sends SMS confirmations and reminders, and dispatches emergency alerts via SMS.</p>

      <h2>2. Your Account</h2>
      <p>You must provide accurate information when signing up. You are responsible for keeping your login credentials secure. You must be 18 or older and authorized to enter into contracts on behalf of your business.</p>

      <h2>3. Subscription & Billing</h2>
      <p>Ringa is billed monthly via Stripe. Your subscription renews automatically each month until cancelled. You can cancel at any time from your Stripe billing portal — cancellation takes effect at the end of the current billing period. No refunds are issued for partial months.</p>

      <h2>4. Acceptable Use</h2>
      <p>You agree not to use Ringa to:</p>
      <ul>
        <li>Violate any applicable law or regulation</li>
        <li>Send unsolicited messages (spam)</li>
        <li>Impersonate any person or entity</li>
        <li>Interfere with or disrupt the Service</li>
        <li>Resell or sublicense the Service without written permission</li>
      </ul>

      <h2>5. Phone Numbers & SMS</h2>
      <p>Phone numbers provisioned through Ringa are leased, not owned by you. We reserve the right to reassign numbers if your subscription lapses. SMS messaging is subject to carrier terms and applicable telecom regulations including CRTC guidelines for Canadian numbers.</p>

      <h2>6. Google Calendar Integration</h2>
      <p>You grant Ringa permission to read and write events on the Google Calendar you connect. You can revoke this permission at any time through your Google account settings, though doing so will disable appointment booking.</p>

      <h2>7. AI Limitations</h2>
      <p>Ringa's AI receptionist is designed to handle common plumbing and HVAC inquiries. It may occasionally make errors in understanding callers or booking appointments. You remain responsible for verifying bookings and following up with customers as needed.</p>

      <h2>8. Data & Privacy</h2>
      <p>Your use of the Service is also governed by our <a href="/privacy" style="color:#38bdf8;">Privacy Policy</a>. Call transcripts and customer data are stored securely and are accessible only to you through your client portal.</p>

      <h2>9. Service Availability</h2>
      <p>We strive for high availability but do not guarantee uninterrupted service. We are not liable for losses resulting from downtime, missed calls, or booking errors caused by third-party services (Twilio, Vapi, Google).</p>

      <h2>10. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, Ringa's total liability to you for any claims arising from these Terms or your use of the Service shall not exceed the amount you paid us in the 30 days preceding the claim.</p>

      <h2>11. Termination</h2>
      <p>We may suspend or terminate your account if you violate these Terms or if your payment fails after reasonable notice. Upon termination, your phone number will be released and your data will be retained for 30 days before deletion.</p>

      <h2>12. Changes to Terms</h2>
      <p>We may update these Terms from time to time. We'll notify you by email at least 14 days before material changes take effect. Continued use of the Service after that date constitutes acceptance of the updated Terms.</p>

      <h2>13. Governing Law</h2>
      <p>These Terms are governed by the laws of British Columbia, Canada. Any disputes shall be resolved in the courts of British Columbia.</p>

      <h2>14. Contact</h2>
      <p>For questions about these Terms, contact us at <a href="mailto:hello@getringa.ca" style="color:#38bdf8;">hello@getringa.ca</a>.</p>

    </div>
  </div>

  <footer class="border-t border-zinc-800 py-8 px-6 text-center text-sm text-zinc-600">
    <p>&copy; 2026 <span class="text-white font-bold">Ring</span><span class="text-sky-400 font-bold">a</span> · <a href="/terms" class="hover:text-white transition-colors">Terms</a> · <a href="/privacy" class="hover:text-white transition-colors">Privacy</a></p>
  </footer>

</body>
</html>`);
});

legalRouter.get('/privacy', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy — Ringa</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body { font-family: 'Inter', sans-serif; background: #0a0a0a; }
    .prose h2 { color: #fff; font-size: 1.2rem; font-weight: 700; margin: 2rem 0 0.75rem; }
    .prose p, .prose li { color: #9ca3af; font-size: 0.95rem; line-height: 1.8; }
    .prose ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
  </style>
</head>
<body class="min-h-screen text-white">

  <nav class="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
    <a href="/" class="text-lg font-extrabold">
      <span class="text-white">Ring</span><span class="text-sky-400">a</span>
    </a>
    <a href="/" class="text-zinc-500 hover:text-white text-sm transition-colors">← Back</a>
  </nav>

  <div class="max-w-3xl mx-auto px-6 py-16">
    <p class="text-sky-400 text-sm font-semibold mb-2">Legal</p>
    <h1 class="text-4xl font-extrabold text-white mb-2">Privacy Policy</h1>
    <p class="text-zinc-500 text-sm mb-12">Last updated: August 2026</p>

    <div class="prose">

      <p>Ringa ("we", "us", "our") is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights.</p>

      <h2>1. Data We Collect</h2>
      <p>When you sign up and use Ringa, we collect:</p>
      <ul>
        <li><strong style="color:#fff;">Account data</strong> — business name, email address, timezone, emergency contact number</li>
        <li><strong style="color:#fff;">Google Calendar access</strong> — OAuth refresh token to read/write calendar events on your behalf</li>
        <li><strong style="color:#fff;">Call data</strong> — transcripts, summaries, duration, and caller phone numbers for calls handled by your AI receptionist</li>
        <li><strong style="color:#fff;">Payment data</strong> — processed by Stripe; we store only your Stripe customer and subscription IDs, never your card details</li>
        <li><strong style="color:#fff;">Customer data</strong> — names, phone numbers, and addresses collected from your callers during appointment booking</li>
      </ul>

      <h2>2. How We Use Your Data</h2>
      <ul>
        <li>To operate and deliver the Ringa service</li>
        <li>To book appointments and send SMS confirmations to your customers</li>
        <li>To display call transcripts in your client portal</li>
        <li>To send you service-related emails (account setup, billing)</li>
        <li>To improve the accuracy and reliability of our AI receptionist</li>
      </ul>

      <h2>3. Data Sharing</h2>
      <p>We do not sell your data. We share data only with the third-party services required to operate Ringa:</p>
      <ul>
        <li><strong style="color:#fff;">Twilio</strong> — for phone number provisioning and SMS delivery</li>
        <li><strong style="color:#fff;">Vapi</strong> — for AI voice call handling and transcription</li>
        <li><strong style="color:#fff;">Google</strong> — for calendar integration</li>
        <li><strong style="color:#fff;">Stripe</strong> — for payment processing</li>
        <li><strong style="color:#fff;">Neon</strong> — for secure database storage</li>
      </ul>

      <h2>4. Call Recordings & Transcripts</h2>
      <p>Calls handled by your Ringa AI receptionist may be transcribed. Transcripts are stored securely and are only accessible to you through your client portal. Callers are not explicitly notified of transcription — you are responsible for complying with any local laws regarding call recording disclosure in your jurisdiction.</p>

      <h2>5. Data Retention</h2>
      <p>We retain your data for as long as your account is active. If you cancel, we retain your data for 30 days before permanent deletion, in case you wish to reactivate. You can request earlier deletion by emailing us.</p>

      <h2>6. Security</h2>
      <p>All data is transmitted over HTTPS. Database credentials and API keys are stored as environment variables and never committed to source code. Google OAuth tokens are stored encrypted at rest in our database.</p>

      <h2>7. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of your data</li>
        <li>Withdraw Google Calendar access at any time via your Google account settings</li>
      </ul>
      <p>To exercise these rights, email <a href="mailto:hello@getringa.ca" style="color:#38bdf8;">hello@getringa.ca</a>.</p>

      <h2>8. Cookies</h2>
      <p>Ringa does not use tracking cookies. We use no third-party analytics or advertising scripts.</p>

      <h2>9. Children</h2>
      <p>Ringa is a business service not intended for use by anyone under 18.</p>

      <h2>10. Changes</h2>
      <p>We may update this policy from time to time. We'll notify you by email before material changes take effect.</p>

      <h2>11. Contact</h2>
      <p>Questions about this policy? Email us at <a href="mailto:hello@getringa.ca" style="color:#38bdf8;">hello@getringa.ca</a>.</p>

    </div>
  </div>

  <footer class="border-t border-zinc-800 py-8 px-6 text-center text-sm text-zinc-600">
    <p>&copy; 2026 <span class="text-white font-bold">Ring</span><span class="text-sky-400 font-bold">a</span> · <a href="/terms" class="hover:text-white transition-colors">Terms</a> · <a href="/privacy" class="hover:text-white transition-colors">Privacy</a></p>
  </footer>

</body>
</html>`);
});
