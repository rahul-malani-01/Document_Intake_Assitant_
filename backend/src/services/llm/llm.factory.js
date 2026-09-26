import { ENV } from '../../config/env.js';
import { GeminiService } from './gemini.service.js';
import { GroqService } from './groq.service.js';
import { MockLLMService } from './mock-llm.service.js';

let instance = null;

export function getLLMService() {
  if (instance) return instance;

  if (ENV.LLM_PROVIDER === 'groq') {
    if (!ENV.GROQ_API_KEY) {
      console.warn('[LLMFactory] GROQ_API_KEY missing. Falling back to MockLLMService');
      instance = new MockLLMService();
    } else {
      instance = new GroqService(ENV.GROQ_API_KEY);
    }
  } else if (ENV.LLM_PROVIDER === 'gemini') {
    if (!ENV.GEMINI_API_KEY) {
      console.warn('[LLMFactory] GEMINI_API_KEY missing. Falling back to MockLLMService');
      instance = new MockLLMService();
    } else {
      instance = new GeminiService(ENV.GEMINI_API_KEY);
    }
  } else {
    instance = new MockLLMService();
  }

  return instance;
}

export function setLLMServiceInstance(customInstance) {
  instance = customInstance;
}