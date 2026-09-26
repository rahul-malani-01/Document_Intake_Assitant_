import { describe, it, expect } from 'vitest';
import { LLMResponseSchema } from '../src/schemas/llm-response.schema.js';
import { DocumentStateSchema } from '../src/schemas/document.schema.js';

describe('Zod Validation - LLM Response & Document State', () => {
  it('CASE 1 & 2: Validates a full structured response with multiple fields', () => {
    const raw = {
      updates: {
        full_name: 'Rahul Malani',
        home_address: 'Nagpur',
        has_children: true,
        children: ['Aarav', 'Riya']
      },
      conflicts: [],
      clarification_needed: false,
      clarification_question: null,
      next_question: 'Who is your executor?'
    };

    const res = LLMResponseSchema.safeParse(raw);
    expect(res.success).toBe(true);
    expect(res.data.updates.full_name).toBe('Rahul Malani');
  });

  it('CASE 7: Rejects malformed types (e.g. string for has_children boolean)', () => {
    const raw = {
      updates: {
        has_children: 'definitely yes' // Invalid boolean
      },
      next_question: 'Next'
    };

    const res = LLMResponseSchema.safeParse(raw);
    expect(res.success).toBe(false);
  });

  it('CASE 8: Rejects missing next_question string', () => {
    const raw = {
      updates: { full_name: 'Rahul' }
    };
    const res = LLMResponseSchema.safeParse(raw);
    expect(res.success).toBe(false);
  });

  it('Validates canonical DocumentState defaults', () => {
    const state = DocumentStateSchema.parse({});
    expect(state.full_name).toBeNull();
    expect(state.children).toEqual([]);
    expect(state.executor.name).toBeNull();
  });
});