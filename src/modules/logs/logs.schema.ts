import { z } from 'zod'
import { Phase, FlowLevel, FlowColor, FlowConsistency, Mood, MucusType, MucusQuality, Symptom } from '@prisma/client'

const flowLevelEnum = z.enum([FlowLevel.SPOTTING, FlowLevel.LIGHT, FlowLevel.MEDIUM, FlowLevel.HEAVY])
const flowColorEnum = z.enum([FlowColor.BRIGHT_RED, FlowColor.DARK_RED, FlowColor.PINK, FlowColor.BROWN, FlowColor.BLACK])
const flowConsistencyEnum = z.enum([FlowConsistency.WATERY, FlowConsistency.NORMAL, FlowConsistency.CLOTTY])
const moodEnum = z.enum([Mood.HAPPY, Mood.CALM, Mood.ANXIOUS, Mood.IRRITABLE, Mood.SAD, Mood.ENERGETIC, Mood.TIRED])
const mucusTypeEnum = z.enum([MucusType.DRY, MucusType.STICKY, MucusType.CREAMY, MucusType.EGG_WHITE, MucusType.WATERY])
const mucusQualityEnum = z.enum([MucusQuality.NONE, MucusQuality.LOW, MucusQuality.MEDIUM, MucusQuality.HIGH, MucusQuality.PEAK])
const symptomEnum = z.enum([
  Symptom.NAUSEA,
  Symptom.BREAST_PAIN,
  Symptom.HEADACHE,
  Symptom.CRAMPS,
  Symptom.BLOATING,
  Symptom.BACKACHE,
  Symptom.FATIGUE,
  Symptom.ACNE,
  Symptom.INSOMNIA,
])

const menstrualLogSchema = z.object({
  flowLevel: flowLevelEnum,
  color: flowColorEnum,
  consistency: flowConsistencyEnum,
})

const symptomLogSchema = z.object({
  mood: moodEnum.optional(),
  mucusType: mucusTypeEnum.optional(),
  mucusQuality: mucusQualityEnum.optional(),
  symptoms: z.array(symptomEnum).optional(),
})

export const createLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  temperature: z.number().min(35.0).max(42.0).optional(),
  isMenstruating: z.boolean(),
  menstrualLog: menstrualLogSchema.optional(),
  symptomLog: symptomLogSchema.optional(),
})

export const updateLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  temperature: z.number().min(35.0).max(42.0).optional(),
  isMenstruating: z.boolean().optional(),
  menstrualLog: menstrualLogSchema.optional(),
  symptomLog: symptomLogSchema.optional(),
})

export type CreateLogInput = z.infer<typeof createLogSchema>
export type UpdateLogInput = z.infer<typeof updateLogSchema>
