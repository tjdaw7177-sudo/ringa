import twilio from 'twilio';

function getTwilioClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/**
 * Alert on-call tech via SMS for emergency dispatch.
 * @param {{ customerName: string, phone: string, address: string, issue: string }} params
 */
export async function dispatchEmergency({ customerName, phone, address, issue }) {
  const client = getTwilioClient();
  const body = `EMERGENCY DISPATCH\nCustomer: ${customerName}\nPhone: ${phone}\nAddress: ${address}\nIssue: ${issue}`;

  await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: process.env.EMERGENCY_DISPATCH_NUMBER,
  });

  return { success: true, message: 'On-call technician has been notified.' };
}

export async function sendBookingConfirmation({ to, customerName, serviceType, startTime }) {
  const client = getTwilioClient();
  const formatted = new Date(startTime).toLocaleString('en-US', {
    timeZone: process.env.BUSINESS_TIMEZONE,
    dateStyle: 'full',
    timeStyle: 'short',
  });

  await client.messages.create({
    body: `Hi ${customerName}, your ${serviceType} appointment is confirmed for ${formatted}. Reply CANCEL to cancel.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });

  return { success: true };
}
