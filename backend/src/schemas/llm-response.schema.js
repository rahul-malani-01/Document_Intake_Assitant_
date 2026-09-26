import { z } from 'zod';

const PartialExecutorSchema = z.object({
  name: z.string().nullable().optional(),
  relationship: z.string().nullable().optional()
});

export const ProposedUpdatesSchema = z.object({
  full_name: z.string().nullable().optional(),
  home_address: z.string().nullable().optional(),
  covers_worldwide_assets: z.boolean().nullable().optional(),
  has_children: z.boolean().nullable().optional(),
  children: z.array(z.string()).optional(),
  executor: PartialExecutorSchema.optional(),
  specific_gifts: z.array(z.string()).optional(),
  additional_wishes: z.string().nullable().optional()
});

export const ConflictSchema = z.object({
  field: z.string(),
  previous_value: z.any(),
  proposed_value: z.any(),
  reason: z.string()
});

export const LLMResponseSchema = z.object({
  updates: ProposedUpdatesSchema.default({}),
  conflicts: z.array(ConflictSchema).default([]),
  clarification_needed: z.boolean().default(false),
  clarification_question: z.string().nullable().default(null),
  next_question: z.string()
});