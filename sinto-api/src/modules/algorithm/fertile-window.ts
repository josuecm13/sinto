/**
 * MODULE: Fertile window algorithm
 * Pure functions — no DB or Fastify imports. Detects BBT rise (0.2°C over 3 days) and peak mucus to estimate ovulation and fertile window.
 *
 * Exports: detectBBTRise, detectPeakMucus, calculateFertileWindow, types DayData, FertileWindow
 */

export interface DayData {
  date: Date
  temperature: number | null
  mucusQuality: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'PEAK' | null
}

export interface FertileWindow {
  fertileStart: Date | null
  fertileEnd: Date | null
  ovulationEstimate: Date | null
  peakMucusDay: Date | null
  bbtRiseDay: Date | null
}

/**
 * Detects the rise in basal body temperature (BBT) above a low-temperature baseline.
 *
 * Algorithm:
 * 1. Calculate baseline from the first 6 low temperatures (consecutive or otherwise)
 * 2. Detect when temperature rises >= 0.2°C above baseline AND stays elevated for >= 3 consecutive days
 * 3. Returns the date of the FIRST elevated day
 */
export function detectBBTRise(days: DayData[]): Date | null {
  if (days.length === 0) {
    return null
  }

  // Collect temperatures with their dates
  const tempsWithDates: Array<{ date: Date; temp: number }> = days
    .filter((day) => day.temperature !== null)
    .map((day) => ({
      date: day.date,
      temp: day.temperature as number,
    }))

  // Need at least 6 temps to establish baseline, plus 3 more for elevation check
  if (tempsWithDates.length < 9) {
    return null
  }

  // Get first 6 temperatures to calculate baseline
  const baselineSamples = tempsWithDates.slice(0, 6)
  const baselineTemp =
    baselineSamples.reduce((sum, item) => sum + item.temp, 0) / baselineSamples.length
  const threshold = baselineTemp + 0.2

  // Look for 3 consecutive elevated days starting from day 7 onwards
  const remainingTemps = tempsWithDates.slice(6)

  for (let i = 0; i <= remainingTemps.length - 3; i++) {
    const threeConsecutive = remainingTemps.slice(i, i + 3)

    // Check if all 3 are elevated
    if (threeConsecutive.every((item) => item.temp >= threshold)) {
      // Return the date of the FIRST elevated day
      return new Date(threeConsecutive[0].date)
    }
  }

  return null
}

/**
 * Detects the peak mucus day based on mucusQuality.
 *
 * Algorithm:
 * 1. Return the last day with mucusQuality === 'PEAK' or 'HIGH'
 * 2. If no such day exists, return the last day with mucusQuality === 'MEDIUM'
 * 3. If no such day exists, return null
 */
export function detectPeakMucus(days: DayData[]): Date | null {
  if (days.length === 0) {
    return null
  }

  // Look for PEAK or HIGH in reverse order
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i]
    if (day.mucusQuality === 'PEAK' || day.mucusQuality === 'HIGH') {
      return new Date(day.date)
    }
  }

  // If no PEAK/HIGH found, look for MEDIUM in reverse order
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i]
    if (day.mucusQuality === 'MEDIUM') {
      return new Date(day.date)
    }
  }

  return null
}

export interface TempTrend {
  hasData: boolean
  lastTemperature: number | null
  trend: 'rising' | 'stable' | 'falling' | 'post-shift' | null
  daysUntilThermalShift: number | null
}

/**
 * Analyzes the temperature trend from recent logged days.
 *
 * - If bbtRiseDay is set → post-shift confirmed
 * - If < 3 temperature readings → hasData: false
 * - Otherwise compare last temp to mean of prior 3 temps:
 *   diff > +0.1 → rising, diff < -0.1 → falling, else → stable
 * - daysUntilThermalShift estimated when trend is rising based on
 *   how many consecutive elevated days have already been observed (need 3)
 */
export function analyzeTempTrend(days: DayData[], bbtRiseDay: Date | null): TempTrend {
  const tempsWithDates = days
    .filter((d) => d.temperature !== null)
    .map((d) => ({ date: d.date, temp: d.temperature as number }))

  const lastTemperature = tempsWithDates.length > 0
    ? tempsWithDates[tempsWithDates.length - 1].temp
    : null

  if (bbtRiseDay !== null) {
    return { hasData: true, lastTemperature, trend: 'post-shift', daysUntilThermalShift: null }
  }

  if (tempsWithDates.length < 3) {
    return { hasData: tempsWithDates.length > 0, lastTemperature, trend: null, daysUntilThermalShift: null }
  }

  const recent = tempsWithDates.slice(-4)
  const last = recent[recent.length - 1].temp
  const prior = recent.slice(0, -1)
  const priorMean = prior.reduce((sum, t) => sum + t.temp, 0) / prior.length
  const diff = last - priorMean

  let trend: TempTrend['trend']
  if (diff > 0.1) trend = 'rising'
  else if (diff < -0.1) trend = 'falling'
  else trend = 'stable'

  // Estimate days until thermal shift: need 3 consecutive days above threshold.
  // Count how many trailing days are already elevated above priorMean + 0.2
  let daysUntilThermalShift: number | null = null
  if (trend === 'rising') {
    const threshold = priorMean + 0.2
    let elevatedCount = 0
    for (let i = recent.length - 1; i >= 0; i--) {
      if (recent[i].temp >= threshold) elevatedCount++
      else break
    }
    daysUntilThermalShift = Math.max(0, 3 - elevatedCount)
  }

  return { hasData: true, lastTemperature, trend, daysUntilThermalShift }
}

/**
 * Calculates the fertile window using the symptothermal method.
 *
 * Rules:
 * - bbtRiseDay: from detectBBTRise
 * - peakMucusDay: from detectPeakMucus
 * - ovulationEstimate: the earlier of bbtRiseDay and peakMucusDay (or whichever is available)
 * - fertileStart: 5 days before ovulationEstimate (or day 6 of cycle if ovulation not estimated)
 * - fertileEnd: 3 days after ovulationEstimate (confirmed post-ovulatory infertility starts 4th morning after BBT rise + peak mucus)
 */
export function calculateFertileWindow(days: DayData[], cycleStartDate?: Date): FertileWindow {
  const bbtRiseDay = detectBBTRise(days)
  const peakMucusDay = detectPeakMucus(days)

  // Determine ovulation estimate: the earlier of the two signals
  let ovulationEstimate: Date | null = null
  if (bbtRiseDay && peakMucusDay) {
    ovulationEstimate = bbtRiseDay < peakMucusDay ? bbtRiseDay : peakMucusDay
  } else if (bbtRiseDay) {
    ovulationEstimate = bbtRiseDay
  } else if (peakMucusDay) {
    ovulationEstimate = peakMucusDay
  }

  let fertileStart: Date | null = null
  let fertileEnd: Date | null = null

  if (ovulationEstimate) {
    // Calculate fertile window relative to ovulation
    fertileStart = new Date(ovulationEstimate)
    fertileStart.setDate(fertileStart.getDate() - 5)

    fertileEnd = new Date(ovulationEstimate)
    fertileEnd.setDate(fertileEnd.getDate() + 3)
  } else if (cycleStartDate) {
    // If no ovulation signals, use day 6 of cycle as default fertile start
    fertileStart = new Date(cycleStartDate)
    fertileStart.setDate(fertileStart.getDate() + 5) // Day 6 (0-indexed: day 5)
  }

  return {
    fertileStart,
    fertileEnd,
    ovulationEstimate,
    peakMucusDay,
    bbtRiseDay,
  }
}
