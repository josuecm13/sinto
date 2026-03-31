import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/).optional(),
  avatarUrl: z.string().url().optional(),
  isPublic: z.boolean().optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
