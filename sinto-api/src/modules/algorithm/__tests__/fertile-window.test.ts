import { describe, it, expect } from 'vitest'
import { detectBBTRise, detectPeakMucus, calculateFertileWindow, analyzeTempTrend, DayData } from '../fertile-window'

describe('detectBBTRise', () => {
  it('should return null when no temperatures', () => {
    const days: DayData[] = []
    const result = detectBBTRise(days)
    expect(result).toBeNull()
  })

  it('should return null when fewer than 3 consecutive elevated days', () => {
    const days: DayData[] = [
      { date: new Date('2024-01-01'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-02'), temperature: 36.4, mucusQuality: null },
      { date: new Date('2024-01-03'), temperature: 36.6, mucusQuality: null },
      { date: new Date('2024-01-04'), temperature: 36.3, mucusQuality: null },
      { date: new Date('2024-01-05'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-06'), temperature: 36.4, mucusQuality: null },
      { date: new Date('2024-01-07'), temperature: 36.9, mucusQuality: null },
      { date: new Date('2024-01-08'), temperature: 36.8, mucusQuality: null },
    ]
    const result = detectBBTRise(days)
    expect(result).toBeNull()
  })

  it('should return the first elevated day when 3+ consecutive days >= 0.2C above baseline', () => {
    const days: DayData[] = [
      { date: new Date('2024-01-01'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-02'), temperature: 36.4, mucusQuality: null },
      { date: new Date('2024-01-03'), temperature: 36.6, mucusQuality: null },
      { date: new Date('2024-01-04'), temperature: 36.3, mucusQuality: null },
      { date: new Date('2024-01-05'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-06'), temperature: 36.4, mucusQuality: null },
      { date: new Date('2024-01-07'), temperature: 36.8, mucusQuality: null },
      { date: new Date('2024-01-08'), temperature: 36.9, mucusQuality: null },
      { date: new Date('2024-01-09'), temperature: 37.0, mucusQuality: null },
    ]
    // Baseline: (36.5 + 36.4 + 36.6 + 36.3 + 36.5 + 36.4) / 6 = 36.45
    // Threshold: 36.45 + 0.2 = 36.65
    // Days 7, 8, 9 are all >= 36.65
    const result = detectBBTRise(days)
    expect(result).toEqual(new Date('2024-01-07'))
  })
})

describe('detectPeakMucus', () => {
  it('should return null when no mucus data', () => {
    const days: DayData[] = []
    const result = detectPeakMucus(days)
    expect(result).toBeNull()
  })

  it('should return last PEAK day', () => {
    const days: DayData[] = [
      { date: new Date('2024-01-01'), temperature: null, mucusQuality: 'LOW' },
      { date: new Date('2024-01-02'), temperature: null, mucusQuality: 'MEDIUM' },
      { date: new Date('2024-01-03'), temperature: null, mucusQuality: 'PEAK' },
      { date: new Date('2024-01-04'), temperature: null, mucusQuality: 'HIGH' },
      { date: new Date('2024-01-05'), temperature: null, mucusQuality: 'PEAK' },
      { date: new Date('2024-01-06'), temperature: null, mucusQuality: 'LOW' },
    ]
    const result = detectPeakMucus(days)
    expect(result).toEqual(new Date('2024-01-05'))
  })

  it('should fall back to last MEDIUM if no PEAK/HIGH', () => {
    const days: DayData[] = [
      { date: new Date('2024-01-01'), temperature: null, mucusQuality: 'LOW' },
      { date: new Date('2024-01-02'), temperature: null, mucusQuality: 'MEDIUM' },
      { date: new Date('2024-01-03'), temperature: null, mucusQuality: 'LOW' },
      { date: new Date('2024-01-04'), temperature: null, mucusQuality: 'MEDIUM' },
      { date: new Date('2024-01-05'), temperature: null, mucusQuality: 'LOW' },
    ]
    const result = detectPeakMucus(days)
    expect(result).toEqual(new Date('2024-01-04'))
  })
})

describe('calculateFertileWindow', () => {
  it('should return all nulls when no data', () => {
    const days: DayData[] = []
    const result = calculateFertileWindow(days)
    expect(result.fertileStart).toBeNull()
    expect(result.fertileEnd).toBeNull()
    expect(result.ovulationEstimate).toBeNull()
  })

  it('should estimate fertile window from BBT rise', () => {
    const days: DayData[] = [
      { date: new Date('2024-01-01'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-02'), temperature: 36.4, mucusQuality: null },
      { date: new Date('2024-01-03'), temperature: 36.6, mucusQuality: null },
      { date: new Date('2024-01-04'), temperature: 36.3, mucusQuality: null },
      { date: new Date('2024-01-05'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-06'), temperature: 36.4, mucusQuality: null },
      { date: new Date('2024-01-07'), temperature: 36.8, mucusQuality: null },
      { date: new Date('2024-01-08'), temperature: 36.9, mucusQuality: null },
      { date: new Date('2024-01-09'), temperature: 37.0, mucusQuality: null },
    ]
    const result = calculateFertileWindow(days)
    expect(result.bbtRiseDay).toEqual(new Date('2024-01-07'))
    expect(result.ovulationEstimate).toEqual(new Date('2024-01-07'))
    expect(result.fertileStart).toEqual(new Date('2024-01-02'))
    expect(result.fertileEnd).toEqual(new Date('2024-01-10'))
  })

  it('should estimate fertile window from peak mucus', () => {
    const days: DayData[] = [
      { date: new Date('2024-01-01'), temperature: null, mucusQuality: 'LOW' },
      { date: new Date('2024-01-02'), temperature: null, mucusQuality: 'MEDIUM' },
      { date: new Date('2024-01-03'), temperature: null, mucusQuality: 'PEAK' },
      { date: new Date('2024-01-04'), temperature: null, mucusQuality: 'LOW' },
    ]
    const result = calculateFertileWindow(days)
    expect(result.peakMucusDay).toEqual(new Date('2024-01-03'))
    expect(result.ovulationEstimate).toEqual(new Date('2024-01-03'))
    expect(result.fertileStart).toEqual(new Date('2023-12-29'))
    expect(result.fertileEnd).toEqual(new Date('2024-01-06'))
  })

  it('should combine both signals and take earlier estimate', () => {
    const days: DayData[] = [
      { date: new Date('2024-01-01'), temperature: 36.5, mucusQuality: 'LOW' },
      { date: new Date('2024-01-02'), temperature: 36.4, mucusQuality: 'MEDIUM' },
      { date: new Date('2024-01-03'), temperature: 36.6, mucusQuality: 'PEAK' },
      { date: new Date('2024-01-04'), temperature: 36.3, mucusQuality: 'LOW' },
      { date: new Date('2024-01-05'), temperature: 36.5, mucusQuality: 'LOW' },
      { date: new Date('2024-01-06'), temperature: 36.4, mucusQuality: 'LOW' },
      { date: new Date('2024-01-07'), temperature: 36.8, mucusQuality: 'LOW' },
      { date: new Date('2024-01-08'), temperature: 36.9, mucusQuality: 'LOW' },
      { date: new Date('2024-01-09'), temperature: 37.0, mucusQuality: 'LOW' },
    ]
    // BBT rise: Jan 7 (baseline ~36.45, threshold ~36.65)
    // Peak mucus: Jan 3
    // Earlier estimate: Jan 3
    const result = calculateFertileWindow(days)
    expect(result.peakMucusDay).toEqual(new Date('2024-01-03'))
    expect(result.bbtRiseDay).toEqual(new Date('2024-01-07'))
    expect(result.ovulationEstimate).toEqual(new Date('2024-01-03'))
    expect(result.fertileStart).toEqual(new Date('2023-12-29'))
  })

  it('should use cycleStartDate day 6 as default fertile start when no signals', () => {
    const days: DayData[] = [
      { date: new Date('2024-01-01'), temperature: 36.5, mucusQuality: 'LOW' },
      { date: new Date('2024-01-02'), temperature: 36.4, mucusQuality: 'LOW' },
    ]
    const result = calculateFertileWindow(days, new Date('2024-01-01'))
    expect(result.ovulationEstimate).toBeNull()
    expect(result.fertileStart).toEqual(new Date('2024-01-06'))
    expect(result.fertileEnd).toBeNull()
  })

  it('should handle days with only null temperatures', () => {
    const days: DayData[] = Array.from({ length: 10 }, (_, i) => ({
      date: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
      temperature: null,
      mucusQuality: 'LOW' as const,
    }))
    const result = calculateFertileWindow(days)
    expect(result.bbtRiseDay).toBeNull()
    expect(result.ovulationEstimate).toBeNull()
  })

  it('should handle days with only null mucusQuality', () => {
    const days: DayData[] = Array.from({ length: 10 }, (_, i) => ({
      date: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
      temperature: 36.4,
      mucusQuality: null,
    }))
    const result = calculateFertileWindow(days)
    expect(result.peakMucusDay).toBeNull()
  })
})

// ─── analyzeTempTrend ─────────────────────────────────────────────────────

describe('analyzeTempTrend', () => {
  it('should return post-shift when bbtRiseDay is set', () => {
    const days: DayData[] = [
      { date: new Date('2024-01-01'), temperature: 37.0, mucusQuality: null },
    ]
    const result = analyzeTempTrend(days, new Date('2024-01-01'))
    expect(result.trend).toBe('post-shift')
    expect(result.hasData).toBe(true)
    expect(result.lastTemperature).toBe(37.0)
    expect(result.daysUntilThermalShift).toBeNull()
  })

  it('should return hasData: false when fewer than 1 temp reading', () => {
    const result = analyzeTempTrend([], null)
    expect(result.hasData).toBe(false)
    expect(result.trend).toBeNull()
    expect(result.lastTemperature).toBeNull()
  })

  it('should return trend: null when fewer than 3 temp readings', () => {
    const days: DayData[] = [
      { date: new Date('2024-01-01'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-02'), temperature: 36.6, mucusQuality: null },
    ]
    const result = analyzeTempTrend(days, null)
    expect(result.hasData).toBe(true)
    expect(result.trend).toBeNull()
    expect(result.lastTemperature).toBe(36.6)
  })

  it('should detect rising trend', () => {
    const days: DayData[] = [
      { date: new Date('2024-01-01'), temperature: 36.3, mucusQuality: null },
      { date: new Date('2024-01-02'), temperature: 36.4, mucusQuality: null },
      { date: new Date('2024-01-03'), temperature: 36.3, mucusQuality: null },
      { date: new Date('2024-01-04'), temperature: 36.8, mucusQuality: null },
    ]
    const result = analyzeTempTrend(days, null)
    expect(result.trend).toBe('rising')
    expect(result.daysUntilThermalShift).toBeDefined()
  })

  it('should detect falling trend', () => {
    const days: DayData[] = [
      { date: new Date('2024-01-01'), temperature: 36.8, mucusQuality: null },
      { date: new Date('2024-01-02'), temperature: 36.7, mucusQuality: null },
      { date: new Date('2024-01-03'), temperature: 36.9, mucusQuality: null },
      { date: new Date('2024-01-04'), temperature: 36.5, mucusQuality: null },
    ]
    const result = analyzeTempTrend(days, null)
    expect(result.trend).toBe('falling')
    expect(result.daysUntilThermalShift).toBeNull()
  })

  it('should detect stable trend', () => {
    const days: DayData[] = [
      { date: new Date('2024-01-01'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-02'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-03'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-04'), temperature: 36.5, mucusQuality: null },
    ]
    const result = analyzeTempTrend(days, null)
    expect(result.trend).toBe('stable')
    expect(result.daysUntilThermalShift).toBeNull()
  })

  it('should filter out null temperatures', () => {
    const days: DayData[] = [
      { date: new Date('2024-01-01'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-02'), temperature: null, mucusQuality: null },
      { date: new Date('2024-01-03'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-04'), temperature: null, mucusQuality: null },
    ]
    // Only 2 non-null temps, so trend should be null
    const result = analyzeTempTrend(days, null)
    expect(result.trend).toBeNull()
    expect(result.lastTemperature).toBe(36.5)
  })
})
