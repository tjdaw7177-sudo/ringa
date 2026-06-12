import 'dotenv/config';
import express from 'express';
import { vapiWebhookRouter } from './webhooks/vapi.js';
import { twilioWebhookRouter } from './webhooks/twilio.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/webhooks/vapi', vapiWebhookRouter);
app.use('/webhooks/twilio', twilioWebhookRouter);

const port = process.env.PORT ?? 3000;
app.listen(port, () => console.log(`Ringa listening on :${port}`));
