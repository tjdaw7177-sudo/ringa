import 'dotenv/config';
import sql from '../src/db/index.js';

// Add tier to clients
await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'starter'`;

// Create phone_numbers table
await sql`
  CREATE TABLE IF NOT EXISTS phone_numbers (
    id                  TEXT PRIMARY KEY,
    client_id           TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    twilio_phone_number TEXT,
    vapi_phone_number_id TEXT,
    vapi_assistant_id   TEXT,
    label               TEXT NOT NULL DEFAULT 'Main',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

await sql`CREATE INDEX IF NOT EXISTS phone_numbers_client_id ON phone_numbers(client_id)`;
await sql`CREATE INDEX IF NOT EXISTS phone_numbers_vapi_id ON phone_numbers(vapi_phone_number_id)`;

// Migrate existing client phone data into phone_numbers table
const clients = await sql`
  SELECT id, twilio_phone_number, vapi_phone_number_id, vapi_assistant_id
  FROM clients
  WHERE twilio_phone_number IS NOT NULL
`;

for (const c of clients) {
  const exists = await sql`SELECT id FROM phone_numbers WHERE client_id = ${c.id} LIMIT 1`;
  if (exists.length === 0) {
    await sql`
      INSERT INTO phone_numbers (id, client_id, twilio_phone_number, vapi_phone_number_id, vapi_assistant_id, label)
      VALUES (${`pn-${c.id}`}, ${c.id}, ${c.twilio_phone_number}, ${c.vapi_phone_number_id}, ${c.vapi_assistant_id}, 'Main')
    `;
    console.log('migrated:', c.id);
  }
}

console.log('migration complete');
process.exit(0);
