import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLIENTS_DIR = join(__dirname, '../../config/clients');

function loadAllClients() {
  const clients = {};
  for (const file of readdirSync(CLIENTS_DIR)) {
    if (!file.endsWith('.json')) continue;
    const config = JSON.parse(readFileSync(join(CLIENTS_DIR, file), 'utf8'));
    const prefix = config.id.toUpperCase().replace(/-/g, '_');
    const client = {
      ...config,
      twilio: {
        accountSid: process.env[`${prefix}_TWILIO_ACCOUNT_SID`],
        authToken: process.env[`${prefix}_TWILIO_AUTH_TOKEN`],
        phoneNumber: process.env[`${prefix}_TWILIO_PHONE_NUMBER`],
      },
      google: {
        clientId: process.env[`${prefix}_GOOGLE_CLIENT_ID`],
        clientSecret: process.env[`${prefix}_GOOGLE_CLIENT_SECRET`],
        refreshToken: process.env[`${prefix}_GOOGLE_REFRESH_TOKEN`],
        calendarId: process.env[`${prefix}_GOOGLE_CALENDAR_ID`],
      },
    };
    clients[client.vapiPhoneNumberId] = client;
  }
  return clients;
}

const clients = loadAllClients();

export function getClientByPhoneNumberId(phoneNumberId) {
  return clients[phoneNumberId] ?? null;
}

export function getClientByTwilioNumber(twilioNumber) {
  return Object.values(clients).find(c => c.twilio.phoneNumber === twilioNumber) ?? null;
}

export function getAllClients() {
  return Object.values(clients);
}
