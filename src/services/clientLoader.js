import sql from '../db/index.js';

export const TIER_LIMITS = { starter: 1, professional: 3, enterprise: 5 };

function rowToClient(row) {
  return {
    id: row.id,
    businessName: row.business_name,
    timezone: row.timezone,
    emergencyDispatchNumber: row.emergency_number,
    businessHours: row.business_hours,
    tier: row.tier ?? 'starter',
    // These come from the joined phone_numbers row when looking up by number
    vapiPhoneNumberId: row.vapi_phone_number_id,
    vapiAssistantId: row.vapi_assistant_id,
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: row.twilio_phone_number,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: row.google_refresh_token,
      calendarId: row.google_calendar_id,
    },
  };
}

export async function getClientByPhoneNumberId(phoneNumberId) {
  const rows = await sql`
    SELECT c.*, pn.twilio_phone_number, pn.vapi_phone_number_id, pn.vapi_assistant_id
    FROM clients c
    JOIN phone_numbers pn ON pn.client_id = c.id
    WHERE pn.vapi_phone_number_id = ${phoneNumberId}
    AND c.status = 'active'
    LIMIT 1
  `;
  return rows[0] ? rowToClient(rows[0]) : null;
}

export async function getClientByTwilioNumber(twilioNumber) {
  const rows = await sql`
    SELECT c.*, pn.twilio_phone_number, pn.vapi_phone_number_id, pn.vapi_assistant_id
    FROM clients c
    JOIN phone_numbers pn ON pn.client_id = c.id
    WHERE pn.twilio_phone_number = ${twilioNumber}
    AND c.status = 'active'
    LIMIT 1
  `;
  return rows[0] ? rowToClient(rows[0]) : null;
}

export async function getAllClients() {
  // For reminders: return one client entry per phone number
  const rows = await sql`
    SELECT c.*, pn.twilio_phone_number, pn.vapi_phone_number_id, pn.vapi_assistant_id
    FROM clients c
    JOIN phone_numbers pn ON pn.client_id = c.id
    WHERE c.status = 'active'
  `;
  return rows.map(rowToClient);
}
