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

export async function getUpcomingAppointmentByPhone(phone, client) {
  const calendar = getCalendarClient(client);
  const now = new Date();
  const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data } = await calendar.events.list({
    calendarId: client.google.calendarId,
    timeMin: now.toISOString(),
    timeMax: future.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  const digits = phone.replace(/\D/g, '').replace(/^1/, '');
  return data.items?.find(e => e.description?.includes(digits)) ?? null;
}

export async function cancelAppointment(eventId, client) {
  const calendar = getCalendarClient(client);
  await calendar.events.delete({ calendarId: client.google.calendarId, eventId });
  return { success: true };
}

export async function getAppointmentsStartingBetween(timeMin, timeMax, client) {
  const calendar = getCalendarClient(client);
  const { data } = await calendar.events.list({
    calendarId: client.google.calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
  return data.items ?? [];
}
