import { ENV } from '../../config/env.js';
import { LLMResponseSchema } from '../../schemas/llm-response.schema.js';
import { buildIntakePrompt } from '../../prompts/intake.prompt.js';

function normalizeConflicts(conflicts) {
  if (!Array.isArray(conflicts)) return [];

  return conflicts.map((conflict) => {
    if (typeof conflict === 'string') {
      return {
        field: 'unspecified',
        previous_value: null,
        proposed_value: null,
        reason: conflict
      };
    }

    return conflict;
  });
}

function inferExplicitBasicUpdates(message, updates = {}) {
  const nameMatch = message.match(/\bmy name is\s+(.+?)(?=\s+(?:and|,)\s+(?:i am|i'm)\s+from\b|\s+from\b|[,.;]|$)/i);
  const addressMatch = message.match(/\b(?:i am|i'm|i live)\s+(?:from|in)\s+(.+?)(?=\s+and\s+|[,.;]|$)/i);

  return {
    ...updates,
    ...(nameMatch && !updates.full_name ? { full_name: nameMatch[1].trim() } : {}),
    ...(addressMatch && !updates.home_address ? { home_address: addressMatch[1].trim() } : {})
  };
}

export class GroqService {
  constructor(apiKey = ENV.GROQ_API_KEY) {
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is required to initialize GroqService');
    }
    this.apiKey = apiKey;
    this.model = 'openai/gpt-oss-120b';
  }

  async processMessage({ currentState, recentMessages, latestUserMessage }) {
    const prompt = buildIntakePrompt({ currentState, recentMessages, latestUserMessage });

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'Return only valid JSON matching the requested schema.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        const message = payload?.error?.message || `Groq request failed with status ${response.status}`;
        throw new Error(message);
      }

      const text = payload?.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error('Groq returned an empty response');
      }

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (jsonErr) {
        throw new Error(`Groq response is not valid JSON: ${jsonErr.message}`);
      }

      const validation = LLMResponseSchema.safeParse({
        ...parsed,
        updates: inferExplicitBasicUpdates(parsed.latestUserMessage || latestUserMessage, parsed.updates),
        conflicts: normalizeConflicts(parsed.conflicts)
      });
      if (!validation.success) {
        throw new Error(`Groq response failed schema validation: ${JSON.stringify(validation.error.format())}`);
      }

      return validation.data;
    } catch (error) {
      throw new Error(`Groq processing error: ${error.message}`);
    }
  }
}