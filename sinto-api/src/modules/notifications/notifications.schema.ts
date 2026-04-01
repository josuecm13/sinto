import { z } from 'zod'

export const updateNotificationPrefsSchema = z.object({
  remindersEnabled: z.boolean(),
  reminderTime: z
    .string()
    .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Must be in HH:MM format')
    .optional(),
})

export const registerDeviceSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android', 'web']),
})

export type UpdateNotificationPrefsInput = z.infer<typeof updateNotificationPrefsSchema>
export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>
