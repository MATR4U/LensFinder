import { z } from 'zod';

export const RangeSchema = z.object({ min: z.number(), max: z.number() }).refine((r) => r.max >= r.min, { message: 'max must be >= min' });

export const FilterStateSchema = z.object({
  cameraName: z.string(),
  isPro: z.boolean(),
  brand: z.string(),
  lensType: z.string(),
  sealed: z.boolean(),
  isMacro: z.boolean(),
  priceRange: RangeSchema,
  weightRange: RangeSchema,
  proCoverage: z.string(),
  proFocalMin: z.number(),
  proFocalMax: z.number(),
  proMaxApertureF: z.number(),
  proRequireOIS: z.boolean(),
  proRequireSealed: z.boolean(),
  proRequireMacro: z.boolean(),
  proPriceMax: z.number(),
  proWeightMax: z.number(),
  proDistortionMaxPct: z.number(),
  proBreathingMinScore: z.number(),
  softPrice: z.boolean(),
  softWeight: z.boolean(),
  softDistortion: z.boolean(),
  softBreathing: z.boolean(),
  enablePrice: z.boolean(),
  enableWeight: z.boolean(),
  enableDistortion: z.boolean(),
  enableBreathing: z.boolean(),
  goalPreset: z.string(),
  goalWeights: z.record(z.string(), z.number()),
}).refine((s) => s.proFocalMax >= s.proFocalMin, { message: 'Focal max must be >= min' });

export type FilterStateShape = z.infer<typeof FilterStateSchema>;


