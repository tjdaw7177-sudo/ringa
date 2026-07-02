import 'dotenv/config';
import sql from '../src/db/index.js';

await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS email TEXT`;
await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS portal_token TEXT`;

await sql`
  CREATE TABLE IF NOT EXISTS call_logs (
    id            TEXT PRIMARY KEY,
    client_id     TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    vapi_call_id  TEXT,
    transcript    TEXT,
    summary       TEXT,
    duration_seconds INTEGER,
    caller_number TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

await sql`CREATE INDEX IF NOT EXISTS call_logs_client_id ON call_logs(client_id)`;

console.log('migration complete');
process.exit(0);
