const DEFAULT_HOURS = {
  0: null,
  1: { open: 8, close: 17 },
  2: { open: 8, close: 17 },
  3: { open: 8, close: 17 },
  4: { open: 8, close: 17 },
  5: { open: 8, close: 17 },
  6: { open: 8, close: 12 },
};

export function isWithinBusinessHours(date, timezone = 'America/Vancouver', hoursConfig) {
  const HOURS = hoursConfig ?? DEFAULT_HOURS;
  const local = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    hour: 'numeric',
    weekday: 'short',
    hour12: false,
  }).formatToParts(date);

  const hour = parseInt(local.find(p => p.type === 'hour').value);
  const weekday = local.find(p => p.type === 'weekday').value;

  const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday);
  const hours = HOURS[dayIndex];

  if (!hours) return { available: false, reason: "We're closed on Sundays." };
  if (hour < hours.open) return { available: false, reason: `We open at ${hours.open}:00 AM.` };
  if (hour >= hours.close) return { available: false, reason: `We close at ${hours.close === 12 ? '12:00 PM' : `${hours.close - 12}:00 PM`} on ${weekday === 'Sat' ? 'Saturdays' : 'weekdays'}.` };

  return { available: true };
}
