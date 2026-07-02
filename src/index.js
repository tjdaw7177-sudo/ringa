import express from 'express';
import { vapiWebhookRouter } from './webhooks/vapi.js';
import { twilioWebhookRouter } from './webhooks/twilio.js';
import { stripeWebhookRouter } from './webhooks/stripe.js';
import { onboardRouter } from './routes/onboard.js';
import { landingRouter } from './routes/landing.js';
import { adminRouter } from './routes/admin.js';
import { startReminderCron } from './services/reminders.js';

if (process.env.NODE_ENV !== 'production') {
  const { default: dotenv } = await import('dotenv');
  dotenv.config();
}

const app = express();

// Stripe needs raw body to verify webhook signatures — mount before express.json()
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/', landingRouter);
app.use('/webhooks/vapi', vapiWebhookRouter);
app.use('/webhooks/twilio', twilioWebhookRouter);
app.use('/onboard', onboardRouter);
app.use('/admin', adminRouter);

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`Ringa listening on :${port}`);
  startReminderCron();
});
