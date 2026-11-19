import { v4 as uuidv4 } from 'uuid';
import sql from '../db/index.js';
import { TIER_MINUTES, OVERAGE_CENTS_PER_MINUTE } from './clientLoader.js';

// Called when a subscription renews (Stripe invoice.paid with
// billing_reason === 'subscription_cycle'), meaning a full billing period
// just completed. Sums the client's call minutes for that period and, if
// they went over their plan's included minutes, adds a one-time overage
// line item to their Stripe account — Stripe includes it on their next
// invoice automatically.
export async function chargeOverageIfNeeded(stripe, customerId, periodEnd = new Date()) {
  const [client] = await sql`SELECT * FROM clients WHERE stripe_customer_id = ${customerId}`;
  if (!client) {
    console.warn('[billing] no client found for stripe customer:', customerId);
    return;
  }

  const [lastCharge] = await sql`
    SELECT period_end FROM usage_charges WHERE client_id = ${client.id} ORDER BY period_end DESC LIMIT 1
  `;
  const periodStart = lastCharge
    ? new Date(lastCharge.period_end)
    : new Date(new Date(periodEnd).setMonth(new Date(periodEnd).getMonth() - 1));

  const [{ total_seconds }] = await sql`
    SELECT COALESCE(SUM(duration_seconds), 0) AS total_seconds
    FROM call_logs
    WHERE client_id = ${client.id} AND created_at >= ${periodStart} AND created_at < ${periodEnd}
  `;

  const minutesUsed = Math.ceil(total_seconds / 60);
  const includedMinutes = TIER_MINUTES[client.tier] ?? TIER_MINUTES.starter;
  const overageMinutes = Math.max(0, minutesUsed - includedMinutes);
  const overageAmountCents = overageMinutes * OVERAGE_CENTS_PER_MINUTE;

  const inserted = await sql`
    INSERT INTO usage_charges (id, client_id, period_start, period_end, minutes_used, included_minutes, overage_minutes, overage_amount_cents)
    VALUES (${uuidv4()}, ${client.id}, ${periodStart}, ${periodEnd}, ${minutesUsed}, ${includedMinutes}, ${overageMinutes}, ${overageAmountCents})
    ON CONFLICT (client_id, period_start) DO NOTHING
    RETURNING id
  `;

  if (!inserted.length) {
    console.log('[billing] period already charged, skipping:', client.id, periodStart);
    return;
  }

  console.log(`[billing] ${client.business_name}: ${minutesUsed}/${includedMinutes} min used, overage ${overageMinutes} min ($${(overageAmountCents / 100).toFixed(2)})`);

  if (overageAmountCents > 0) {
    const invoiceItem = await stripe.invoiceItems.create({
      customer: customerId,
      amount: overageAmountCents,
      currency: 'cad',
      description: `Overage: ${overageMinutes} extra call minutes this billing period`,
    });
    await sql`UPDATE usage_charges SET stripe_invoice_item_id = ${invoiceItem.id} WHERE id = ${inserted[0].id}`;
    console.log('[billing] created overage invoice item:', invoiceItem.id);
  }
}
