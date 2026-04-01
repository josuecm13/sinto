import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/).optional(),
  password: z.string().min(8),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const refreshSchema = z.object({
  refreshToken: z.string(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshInput = z.infer<typeof refreshSchema>
