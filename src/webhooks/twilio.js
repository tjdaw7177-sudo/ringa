import { Router } from 'express';

export const twilioWebhookRouter = Router();

// Inbound SMS handler — extend as needed
twilioWebhookRouter.post('/sms', async (req, res) => {
  const { From, Body } = req.body;
  console.log(`SMS from ${From}: ${Body}`);
  // TODO: parse booking confirmations, cancellations, etc.
  res.set('Content-Type', 'text/xml').send('<Response/>');
});
