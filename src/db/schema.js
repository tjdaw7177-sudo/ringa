import sql from './index.js';

export async function createTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id                TEXT PRIMARY KEY,
      business_name     TEXT NOT NULL,
      timezone          TEXT NOT NULL DEFAULT 'America/Vancouver',
      emergency_number  TEXT NOT NULL,
      business_hours    JSONB NOT NULL,
      vapi_phone_number_id  TEXT,
      vapi_assistant_id     TEXT,
      twilio_phone_number   TEXT,
      google_calendar_id    TEXT,
      google_refresh_token  TEXT,
      stripe_customer_id    TEXT,
      stripe_subscription_id TEXT,
      status            TEXT NOT NULL DEFAULT 'pending',
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Tracks one row per completed billing period per client, so overage
  // billing (driven by the Stripe invoice.paid webhook) never double-charges
  // the same period even if the webhook fires more than once.
  await sql`
    CREATE TABLE IF NOT EXISTS usage_charges (
      id                      TEXT PRIMARY KEY,
      client_id               TEXT NOT NULL REFERENCES clients(id),
      period_start            TIMESTAMPTZ NOT NULL,
      period_end              TIMESTAMPTZ NOT NULL,
      minutes_used            INTEGER NOT NULL,
      included_minutes        INTEGER NOT NULL,
      overage_minutes         INTEGER NOT NULL,
      overage_amount_cents    INTEGER NOT NULL,
      stripe_invoice_item_id  TEXT,
      created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (client_id, period_start)
    )
  `;

  console.log('[db] tables ready');
}
