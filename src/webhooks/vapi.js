import { Router } from 'express';
import { bookAppointment } from '../services/calendar.js';
import { dispatchEmergency } from '../services/dispatch.js';
import { getClientByPhoneNumberId } from '../services/clientLoader.js';

export const vapiWebhookRouter = Router();

vapiWebhookRouter.post('/', async (req, res) => {
  const { message } = req.body;

  console.log('[vapi] message type:', message?.type);

  if (message?.type === 'tool-calls') {
    const phoneNumberId = message.call?.phoneNumberId;
    const client = await getClientByPhoneNumberId(phoneNumberId);
    if (!client) {
      console.error('[vapi] unknown phoneNumberId:', phoneNumberId);
      return res.status(400).json({ error: 'Unknown client' });
    }

    const results = [];

    for (const toolCall of message.toolCallList) {
      const name = toolCall.function.name.toLowerCase().replace(/\s+/g, '');
      const parameters = typeof toolCall.function.arguments === 'string'
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;

      console.log('[vapi] tool call:', name, JSON.stringify(parameters));

      let result;
      try {
        if (name === 'bookappointment') {
          result = await bookAppointment(parameters, client);
        } else if (name.startsWith('dispatch')) {
          result = await dispatchEmergency(parameters, client);
        } else {
          result = { error: `Unknown tool: ${name}` };
        }
        console.log('[vapi] tool result:', JSON.stringify(result));
      } catch (err) {
        console.error('[vapi] tool error:', err.message);
        console.error('[vapi] tool error detail:', JSON.stringify({ code: err.code, status: err.status, response: err.response?.data }));
        result = { error: err.message };
      }

      results.push({ toolCallId: toolCall.id, result: JSON.stringify(result) });
    }

    return res.json({ results });
  }

  res.sendStatus(200);
});
