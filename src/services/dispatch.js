import twilio from 'twilio';

function getTwilioClient(client) {
  return twilio(client.twilio.accountSid, client.twilio.authToken);
}

export async function dispatchEmergency({ customerName, phone, address, issue }, client) {
  const twilioClient = getTwilioClient(client);
  const body = `EMERGENCY DISPATCH\nCustomer: ${customerName}\nPhone: ${phone}\nAddress: ${address}\nIssue: ${issue}`;

  await twilioClient.messages.create({
    body,
    from: client.twilio.phoneNumber,
    to: client.emergencyDispatchNumber,
  });

  return { success: true, message: 'On-call technician has been notified.' };
}

export async function sendBookingConfirmation({ to, customerName, serviceType, startTime, client }) {
  const twilioClient = getTwilioClient(client);
  const formatted = new Date(startTime).toLocaleString('en-US', {
    timeZone: client.timezone,
    dateStyle: 'full',
    timeStyle: 'short',
  });

  await twilioClient.messages.create({
    body: `Hi ${customerName}, your ${serviceType} appointment is confirmed for ${formatted}. Reply CANCEL to cancel.`,
    from: client.twilio.phoneNumber,
    to,
  });

  return { success: true };
}
