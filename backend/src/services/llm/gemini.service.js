import { GoogleGenAI } from '@google/genai';
import { ENV } from '../../config/env.js';
import { LLMResponseSchema } from '../../schemas/llm-response.schema.js';
import { buildIntakePrompt } from '../../prompts/intake.prompt.js';

export class GeminiService {
  constructor(apiKey = ENV.GEMINI_API_KEY) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required to initialize GeminiService');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async processMessage({ currentState, recentMessages, latestUserMessage }) {
    const prompt = buildIntakePrompt({ currentState, recentMessages, latestUserMessage });

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error('Gemini returned an empty response');
      }

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (jsonErr) {
        throw new Error(`Gemini response is not valid JSON: ${jsonErr.message}`);
      }

      const validation = LLMResponseSchema.safeParse(parsed);
      if (!validation.success) {
        throw new Error(`Gemini response failed schema validation: ${JSON.stringify(validation.error.format())}`);
      }

      return validation.data;
    } catch (error) {
      throw new Error(`Gemini processing error: ${error.message}`);
    }
  }
}