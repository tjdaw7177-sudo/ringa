import { google } from 'googleapis';
import * as chrono from 'chrono-node';

function getCalendarClient() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return google.calendar({ version: 'v3', auth });
}

/**
 * Book an appointment on the business calendar.
 * @param {{ customerName: string, phone: string, serviceType: string, startTime: string, durationMinutes: number }} params
 */
export async function bookAppointment({ customerName, phone, serviceType, startTime, durationMinutes = 60 }) {
  const calendar = getCalendarClient();
  const start = chrono.parseDate(startTime) ?? new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60_000);

  const event = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: {
      summary: `${serviceType} — ${customerName}`,
      description: `Customer phone: ${phone}`,
      start: { dateTime: start.toISOString(), timeZone: process.env.BUSINESS_TIMEZONE },
      end: { dateTime: end.toISOString(), timeZone: process.env.BUSINESS_TIMEZONE },
    },
  });

  return { success: true, eventId: event.data.id, htmlLink: event.data.htmlLink };
}

export async function getAvailableSlots(date) {
  const calendar = getCalendarClient();
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  const { data } = await calendar.freebusy.query({
    requestBody: {
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      items: [{ id: process.env.GOOGLE_CALENDAR_ID }],
    },
  });

  return data.calendars[process.env.GOOGLE_CALENDAR_ID].busy;
}
