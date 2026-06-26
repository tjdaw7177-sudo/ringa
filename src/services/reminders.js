import cron from 'node-cron';
import { getAppointmentsStartingBetween } from './calendar.js';
import { getAllClients } from './clientLoader.js';
import twilio from 'twilio';

function sendReminder(client, event) {
  const twilioClient = twilio(client.twilio.accountSid, client.twilio.authToken);
  const phoneMatch = event.description?.match(/Customer phone:\s*(\+?[\d\s\-().]+)/);
  if (!phoneMatch) return;

  const digits = phoneMatch[1].replace(/\D/g, '');
  const to = digits.startsWith('1') ? `+${digits}` : `+1${digits}`;

  const when = new Date(event.start.dateTime).toLocaleString('en-US', {
    timeZone: client.timezone,
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return twilioClient.messages.create({
    body: `Reminder: you have a ${client.businessName} appointment tomorrow — ${event.summary} at ${when}. Reply REMOVE to cancel or RESCHEDULE to change the time.`,
    from: client.twilio.phoneNumber,
    to,
  });
}

export function startReminderCron() {
  cron.schedule('0 * * * *', async () => {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    for (const client of getAllClients()) {
      try {
        const events = await getAppointmentsStartingBetween(in24h, in25h, client);
        for (const event of events) {
          await sendReminder(client, event);
          console.log(`[reminders] sent reminder for event: ${event.summary}`);
        }
      } catch (err) {
        console.error(`[reminders] error for client ${client.id}:`, err.message);
      }
    }
  });

  console.log('[reminders] cron started — checking every hour for 24h reminders');
}
