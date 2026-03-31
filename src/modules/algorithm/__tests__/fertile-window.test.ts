import { describe, it, expect } from 'vitest'
import { detectBBTRise, detectPeakMucus, calculateFertileWindow, DayData } from '../fertile-window'

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
})
