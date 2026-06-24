import express from 'express';
import { vapiWebhookRouter } from './webhooks/vapi.js';
import { twilioWebhookRouter } from './webhooks/twilio.js';

if (process.env.NODE_ENV !== 'production') {
  const { default: dotenv } = await import('dotenv');
  dotenv.config();
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/webhooks/vapi', vapiWebhookRouter);
app.use('/webhooks/twilio', twilioWebhookRouter);

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`Ringa listening on :${port}`);
  const googleKeys = Object.keys(process.env).filter(k => k.startsWith('GOOGLE'));
  console.log('[env] Google keys found:', googleKeys);
  console.log('[env] GOOGLE_CALENDAR_ID:', process.env.GOOGLE_CALENDAR_ID);
  console.log('[env] BUSINESS_TIMEZONE:', JSON.stringify(process.env.BUSINESS_TIMEZONE));
  console.log('[env] TWILIO_ACCOUNT_SID set:', !!process.env.TWILIO_ACCOUNT_SID);
  console.log('[env] TWILIO_AUTH_TOKEN set:', !!process.env.TWILIO_AUTH_TOKEN);
  console.log('[env] TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER);
  console.log('[env] VAPI_API_KEY set:', !!process.env.VAPI_API_KEY);
});
