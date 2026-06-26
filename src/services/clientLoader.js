import sql from '../db/index.js';

function rowToClient(row) {
  return {
    id: row.id,
    businessName: row.business_name,
    timezone: row.timezone,
    emergencyDispatchNumber: row.emergency_number,
    businessHours: row.business_hours,
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
    SELECT * FROM clients WHERE vapi_phone_number_id = ${phoneNumberId} AND status = 'active'
  `;
  return rows[0] ? rowToClient(rows[0]) : null;
}

export async function getClientByTwilioNumber(twilioNumber) {
  const rows = await sql`
    SELECT * FROM clients WHERE twilio_phone_number = ${twilioNumber} AND status = 'active'
  `;
  return rows[0] ? rowToClient(rows[0]) : null;
}

export async function getAllClients() {
  const rows = await sql`SELECT * FROM clients WHERE status = 'active'`;
  return rows.map(rowToClient);
}

export async function createClient(data) {
  const id = `client-${Date.now()}`;
  await sql`
    INSERT INTO clients (
      id, business_name, timezone, emergency_number, business_hours,
      vapi_phone_number_id, vapi_assistant_id, twilio_phone_number,
      google_calendar_id, google_refresh_token, status
    ) VALUES (
      ${id}, ${data.businessName}, ${data.timezone}, ${data.emergencyNumber},
      ${JSON.stringify(data.businessHours)}, ${data.vapiPhoneNumberId},
      ${data.vapiAssistantId}, ${data.twilioPhoneNumber},
      ${data.googleCalendarId}, ${data.googleRefreshToken}, 'active'
    )
  `;
  return id;
}
