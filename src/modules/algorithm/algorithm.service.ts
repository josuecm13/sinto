import { prisma } from '../../shared/utils/prisma'
import { AppError } from '../../shared/errors/AppError'
import type { DayData, FertileWindow } from './fertile-window'
import { calculateFertileWindow } from './fertile-window'
import { calculateDailyProbabilities, type DailyProbability } from './pregnancy-probability'

export interface CyclePredictionResult {
  cycleId: string
  cycleStart: Date
  fertileWindow: FertileWindow
  dailyProbability: DailyProbability[]
  summary: {
    estimatedOvulation: Date | null
    currentDayProbability: number
    isCurrentlyFertile: boolean
  }
}

/**
 * Fetches cycle with all DailyLogs + SymptomLogs and calculates prediction.
 * Verifies ownership (throws 404 if not owned).
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
        include: {
          symptomLog: true,
        },
        orderBy: {
          date: 'asc',
        },
      },
    },
  })

  // Check if cycle exists and is owned by user
  if (!cycle || cycle.userId !== userId) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  // Map DB records to DayData
  const daysData: DayData[] = cycle.logs.map((log) => ({
    date: log.date,
    temperature: log.temperature,
    mucusQuality: log.symptomLog?.mucusQuality ?? null,
  }))

  // Calculate fertile window
  const fertileWindow = calculateFertileWindow(daysData, cycle.startDate)

  // Calculate daily probabilities
  const dailyProbability = calculateDailyProbabilities(daysData, cycle.startDate, fertileWindow)

  // Get today's probability and fertile status
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayProbability = dailyProbability.find((p) => {
    const pDate = new Date(p.date)
    pDate.setHours(0, 0, 0, 0)
    return pDate.getTime() === today.getTime()
  })

  const currentDayProbability = todayProbability?.probability ?? 0
  const isCurrentlyFertile = todayProbability?.isFertile ?? false

  return {
    cycleId,
    cycleStart: cycle.startDate,
    fertileWindow,
    dailyProbability,
    summary: {
      estimatedOvulation: fertileWindow.ovulationEstimate,
      currentDayProbability,
      isCurrentlyFertile,
    },
  }
}
