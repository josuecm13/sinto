import type { DayData, FertileWindow } from './fertile-window'

export interface DailyProbability {
  date: Date
  cycleDay: number
  probability: number // 0.0 - 1.0
  isFertile: boolean
}

/**
 * Calculates daily pregnancy probabilities based on the fertile window
 * using a probability curve relative to estimated ovulation day.
 *
 * Probability curve:
 * - Day of ovulation: 0.25 (25%)
 * - Day before ovulation: 0.30
 * - 2 days before: 0.25
 * - 3 days before: 0.15
 * - 4 days before: 0.10
 * - 5 days before: 0.05
 * - 1 day after: 0.10
 * - 2+ days after: 0.01
 * - All other days: 0.01
 */
export function calculateDailyProbabilities(
  days: DayData[],
  cycleStartDate: Date,
  fertileWindow: FertileWindow,
): DailyProbability[] {
  const probabilities: DailyProbability[] = []

  for (const day of days) {
    const cycleDay = Math.floor(
      (day.date.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1

    let probability = 0.01 // Default for non-fertile days

    // If we have an ovulation estimate, use the probability curve
    if (fertileWindow.ovulationEstimate) {
      const daysFromOvulation = Math.floor(
        (day.date.getTime() - fertileWindow.ovulationEstimate.getTime()) / (1000 * 60 * 60 * 24),
      )

      if (daysFromOvulation === 0) {
        probability = 0.25 // Day of ovulation
      } else if (daysFromOvulation === -1) {
        probability = 0.30 // Day before
      } else if (daysFromOvulation === -2) {
        probability = 0.25 // 2 days before
      } else if (daysFromOvulation === -3) {
        probability = 0.15 // 3 days before
      } else if (daysFromOvulation === -4) {
        probability = 0.10 // 4 days before
      } else if (daysFromOvulation === -5) {
        probability = 0.05 // 5 days before
      } else if (daysFromOvulation === 1) {
        probability = 0.10 // 1 day after
      } else {
        probability = 0.01 // 2+ days after or other days
      }
    }

    // Determine if day is within fertile window
    const isFertile =
      fertileWindow.fertileStart !== null &&
      fertileWindow.fertileEnd !== null &&
      day.date >= fertileWindow.fertileStart &&
      day.date <= fertileWindow.fertileEnd

    probabilities.push({
      date: new Date(day.date),
      cycleDay,
      probability,
      isFertile,
    })
  }

  return probabilities
}
