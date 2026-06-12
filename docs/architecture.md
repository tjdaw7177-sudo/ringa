# Ringa Architecture

## Call flow

```
Inbound call
    └─▶ Twilio (phone number)
            └─▶ Vapi (voice AI + LLM)
                    ├─ bookAppointment()  ─▶ POST /webhooks/vapi  ─▶ Google Calendar
                    └─ dispatchEmergency() ─▶ POST /webhooks/vapi  ─▶ Twilio SMS → on-call tech
```

## Services

| Service | Purpose |
|---|---|
| `src/services/calendar.js` | Google Calendar: book events, query free/busy |
| `src/services/dispatch.js` | Twilio: emergency SMS + booking confirmation SMS |
| `src/webhooks/vapi.js` | Receives Vapi function-call events, routes to services |
| `src/webhooks/twilio.js` | Receives inbound SMS (cancellations, replies) |

## Key decisions

- **Vapi handles voice + LLM** — we stay out of audio/STT/TTS infrastructure
- **Function calls over Vapi server events** — assistant calls our webhook synchronously; we return the result inline so the AI can speak the confirmation
- **Google Calendar as source of truth** for appointments — no separate DB needed to start
- **Emergency detection is LLM-side** — the system prompt instructs the assistant to classify before calling any function
