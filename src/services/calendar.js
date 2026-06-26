import { google } from 'googleapis';
import * as chrono from 'chrono-node';
import { isWithinBusinessHours } from '../utils/businessHours.js';

function getCalendarClient(client) {
  const auth = new google.auth.OAuth2(
    client.google.clientId,
    client.google.clientSecret,
    process.env.GOOGLE_REDIRECT_URI,
  );
  auth.setCredentials({ refresh_token: client.google.refreshToken });
  return google.calendar({ version: 'v3', auth });
}

export async function bookAppointment({ customerName, CustomerName, phone, Phone, serviceType, address, startTime, durationMinutes = 60 }, client) {
  customerName = customerName ?? CustomerName;
  phone = phone ?? Phone;

  const { sendBookingConfirmation } = await import('./dispatch.js');
  const calendar = getCalendarClient(client);
  const timezone = client.timezone ?? 'America/Vancouver';
  const now = new Date();
  const utcMs = now.getTime();
  const tzMs = new Date(now.toLocaleString('en-US', { timeZone: timezone })).getTime();
  const tzOffsetMinutes = (tzMs - utcMs) / 60000;
  const rawStart = chrono.parseDate(startTime, now) ?? new Date(startTime);
  const start = new Date(rawStart.getTime() - tzOffsetMinutes * 60000);

  const hoursCheck = isWithinBusinessHours(start, timezone, client.businessHours);
  if (!hoursCheck.available) {
    return { success: false, reason: hoursCheck.reason };
  }

  const end = new Date(start.getTime() + durationMinutes * 60_000);

  const event = await calendar.events.insert({
    calendarId: client.google.calendarId,
    requestBody: {
      summary: `${serviceType} — ${customerName}`,
      description: `Customer phone: ${phone}\nAddress: ${address ?? 'Not provided'}`,
      location: address,
      start: { dateTime: start.toISOString(), timeZone: timezone },
      end: { dateTime: end.toISOString(), timeZone: timezone },
    },
  });

  if (phone) {
    const digits = phone.replace(/\D/g, '');
    const to = digits.startsWith('1') ? `+${digits}` : `+1${digits}`;
    await sendBookingConfirmation({ to, customerName, serviceType, startTime: start, client });
  }

  return { success: true, eventId: event.data.id, htmlLink: event.data.htmlLink };
}
