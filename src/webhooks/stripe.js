import { Router } from 'express';
import Stripe from 'stripe';
import sql from '../db/index.js';

export const stripeWebhookRouter = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

stripeWebhookRouter.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe] webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('[stripe] event:', event.type);

  if (event.type === 'customer.subscription.deleted') {
    const subscriptionId = event.data.object.id;
    await sql`
      UPDATE clients SET status = 'cancelled'
      WHERE stripe_subscription_id = ${subscriptionId}
    `;
    console.log('[stripe] cancelled subscription:', subscriptionId);
  }

  if (event.type === 'invoice.payment_failed') {
    const customerId = event.data.object.customer;
    console.warn('[stripe] payment failed for customer:', customerId);
  }

  res.json({ received: true });
});
