/**
 * MODULE: Algorithm service
 * Fetches cycle logs, historical statistics, and runs the full symptothermal prediction.
 * Verifies cycle ownership.
 *
 * Exports: getCyclePrediction
 * Depends on: prisma, fertile-window, phases.service
 */

import { prisma } from '../../shared/utils/prisma'
import { AppError } from '../../shared/errors/AppError'
import type { DayData, FertileWindow, TempTrend } from './fertile-window'
import { calculateFertileWindow, analyzeTempTrend } from './fertile-window'
import { getCurrentPhase } from '../phases/phases.service'

// Phase day-range boundaries (mirrors getCurrentPhase logic)
const PHASE_RANGES: Record<string, { start: number; end: number }> = {
  MENSTRUAL:  { start: 1,  end: 5  },
  FOLLICULAR: { start: 6,  end: 13 },
  OVULATORY:  { start: 14, end: 16 },
  LUTEAL:     { start: 17, end: 999 },
}

export interface DurationVariance {
  min: number
  max: number
  stdDev: number
}

export interface CyclePredictionResult {
  cycleId: string
  cycleDay: number
  estimatedCycleDuration: number
  durationVariance: DurationVariance | null
  currentPhase: {
    name: string
    estimatedStartDay: number
    estimatedEndDay: number
    dayInPhase: number
  }
  expectedOvulation: {
    estimatedDate: Date | null
    daysUntil: number | null
  }
  fertilityWindow: {
    estimatedStartDate: Date | null
    estimatedEndDate: Date | null
    daysRemaining: number | null
    isCurrentlyFertile: boolean
  }
  temperatureTrend: TempTrend
  nextExpectedMenstruation: Date
  confidenceLevel: 'low' | 'medium' | 'high'
}

/**
 * Full symptothermal prediction for a cycle.
 * Incorporates historical cycle statistics, BBT trend, mucus data, and phase information.
 */
export async function getCyclePrediction(
  userId: string,
  cycleId: string,
): Promise<CyclePredictionResult> {
  // Fetch cycle with all logs
  const cycle = await prisma.cycle.findUnique({
    where: { id: cycleId },
    include: {
      logs: {
        include: { symptomLog: true },
        orderBy: { date: 'asc' },
      },
    },
  })

  if (!cycle || cycle.userId !== userId) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  // Map DB records to DayData
  const daysData: DayData[] = cycle.logs.map((log) => ({
    date: log.date,
    temperature: log.temperature,
    mucusQuality: log.symptomLog?.mucusQuality ?? null,
  }))

  // Get cycle day and phase from phases service
  const { phase, cycleDay } = await getCurrentPhase(userId, cycleId)
  const phaseRange = PHASE_RANGES[phase]

  // Fetch historical statistics
  const stats = await prisma.cycleStatistics.findUnique({ where: { userId } })
  const estimatedCycleDuration = stats ? Math.round(stats.avgDurationDays) : 28
  const durationVariance: DurationVariance | null = stats
    ? { min: stats.minDurationDays, max: stats.maxDurationDays, stdDev: stats.stdDev }
    : null

  // Calculate fertile window from symptothermal signals
  const fertileWindow: FertileWindow = calculateFertileWindow(daysData, cycle.startDate)

  // Temperature trend
  const temperatureTrend = analyzeTempTrend(daysData, fertileWindow.bbtRiseDay)

  // Expected ovulation: use signal if available, else fall back to estimated duration - 14
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let ovulationDate: Date | null = fertileWindow.ovulationEstimate
  if (!ovulationDate) {
    ovulationDate = new Date(cycle.startDate)
    ovulationDate.setDate(ovulationDate.getDate() + (estimatedCycleDuration - 14))
  }

  const daysUntilOvulation = ovulationDate
    ? Math.round((ovulationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Fertility window
  const isCurrentlyFertile =
    fertileWindow.fertileStart !== null &&
    fertileWindow.fertileEnd !== null &&
    today >= fertileWindow.fertileStart &&
    today <= fertileWindow.fertileEnd

  let daysRemaining: number | null = null
  if (fertileWindow.fertileEnd !== null) {
    daysRemaining = Math.max(
      0,
      Math.round((fertileWindow.fertileEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    )
  }

  // Next expected menstruation
  const nextExpectedMenstruation = new Date(cycle.startDate)
  nextExpectedMenstruation.setDate(nextExpectedMenstruation.getDate() + estimatedCycleDuration)

  // Confidence level
  const hasTempData = temperatureTrend.hasData
  const cycleCount = stats?.cycleCount ?? 0
  let confidenceLevel: 'low' | 'medium' | 'high'
  if (cycleCount >= 5 && hasTempData) {
    confidenceLevel = 'high'
  } else if (cycleCount >= 2 || hasTempData) {
    confidenceLevel = 'medium'
  } else {
    confidenceLevel = 'low'
  }

  return {
    cycleId,
    cycleDay,
    estimatedCycleDuration,
    durationVariance,
    currentPhase: {
      name: phase.toLowerCase(),
      estimatedStartDay: phaseRange.start,
      estimatedEndDay: phaseRange.end === 999 ? estimatedCycleDuration : phaseRange.end,
      dayInPhase: cycleDay - phaseRange.start + 1,
    },
    expectedOvulation: {
      estimatedDate: ovulationDate,
      daysUntil: daysUntilOvulation,
    },
    fertilityWindow: {
      estimatedStartDate: fertileWindow.fertileStart,
      estimatedEndDate: fertileWindow.fertileEnd,
      daysRemaining,
      isCurrentlyFertile,
    },
    temperatureTrend,
    nextExpectedMenstruation,
    confidenceLevel,
  }
}
