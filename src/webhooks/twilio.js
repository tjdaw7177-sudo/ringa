import { Router } from 'express';
import { getUpcomingAppointmentByPhone, cancelAppointment } from '../services/calendar.js';
import { getClientByTwilioNumber } from '../services/clientLoader.js';

export const twilioWebhookRouter = Router();

twilioWebhookRouter.post('/sms', async (req, res) => {
  const { From, Body, To } = req.body;
  const text = Body?.trim().toUpperCase();

  const twiml = (msg) =>
    res.set('Content-Type', 'text/xml').send(`<Response><Message>${msg}</Message></Response>`);

  const client = await getClientByTwilioNumber(To);
  if (!client) return res.set('Content-Type', 'text/xml').send('<Response/>');

  if (text === 'REMOVE') {
    const event = await getUpcomingAppointmentByPhone(From, client).catch(() => null);
    if (!event) return twiml("We couldn't find an upcoming appointment for your number. Call us if you need help.");
    await cancelAppointment(event.id, client);
    return twiml(`Your appointment "${event.summary}" has been cancelled. Call us to rebook anytime.`);
  }

  if (text === 'RESCHEDULE') {
    const event = await getUpcomingAppointmentByPhone(From, client).catch(() => null);
    if (!event) return twiml("We couldn't find an upcoming appointment for your number. Call us to book.");
    return twiml(`To reschedule "${event.summary}", please call us and our AI receptionist will book a new time for you.`);
  }

  res.set('Content-Type', 'text/xml').send('<Response/>');
});
