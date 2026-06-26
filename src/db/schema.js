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

  console.log('[db] tables ready');
}
