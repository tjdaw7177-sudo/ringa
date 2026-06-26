import 'dotenv/config';
import sql from '../src/db/index.js';

await sql`
  INSERT INTO clients (
    id, business_name, timezone, emergency_number, business_hours,
    vapi_phone_number_id, vapi_assistant_id, twilio_phone_number,
    google_calendar_id, google_refresh_token, status
  ) VALUES (
    'client-001',
    'Ringa Demo Plumbing',
    'America/Vancouver',
    ${process.env.EMERGENCY_DISPATCH_NUMBER},
    ${JSON.stringify({
      "0": null,
      "1": { "open": 8, "close": 17 },
      "2": { "open": 8, "close": 17 },
      "3": { "open": 8, "close": 17 },
      "4": { "open": 8, "close": 17 },
      "5": { "open": 8, "close": 17 },
      "6": { "open": 8, "close": 12 }
    })},
    'adb6bf08-36bb-4f00-878c-bf6350b0258e',
    ${process.env.VAPI_ASSISTANT_ID},
    ${process.env.TWILIO_PHONE_NUMBER},
    ${process.env.GOOGLE_CALENDAR_ID},
    ${process.env.GOOGLE_REFRESH_TOKEN},
    'active'
  )
  ON CONFLICT (id) DO NOTHING
`;

console.log('client-001 seeded');
process.exit(0);
