import { z } from 'zod';

export const ExecutorSchema = z.object({
  name: z.string().nullable().default(null),
  relationship: z.string().nullable().default(null)
});

export const DocumentStateSchema = z.object({
  full_name: z.string().nullable().default(null),
  home_address: z.string().nullable().default(null),
  covers_worldwide_assets: z.boolean().nullable().default(null),
  has_children: z.boolean().nullable().default(null),
  children: z.array(z.string()).default([]),
  executor: ExecutorSchema.default({ name: null, relationship: null }),
  specific_gifts: z.array(z.string()).default([]),
  additional_wishes: z.string().nullable().default(null)
});