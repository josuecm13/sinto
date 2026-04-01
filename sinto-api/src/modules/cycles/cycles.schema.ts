import { z } from 'zod'

export const createCycleSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const updateCycleSchema = z.object({
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  cycleLength: z.number().int().positive().optional(),
  lutealPhaseLength: z.number().int().positive().optional(),
})

export type CreateCycleInput = z.infer<typeof createCycleSchema>
export type UpdateCycleInput = z.infer<typeof updateCycleSchema>
