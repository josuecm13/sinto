import { describe, it, expect } from 'vitest'
import { calculateDailyProbabilities, DailyProbability } from '../pregnancy-probability'
import { DayData, FertileWindow } from '../fertile-window'

describe('calculateDailyProbabilities', () => {
  it('should return empty array when no days', () => {
    const days: DayData[] = []
    const cycleStartDate = new Date('2024-01-01')
    const fertileWindow: FertileWindow = {
      fertileStart: null,
      fertileEnd: null,
      ovulationEstimate: null,
      peakMucusDay: null,
      bbtRiseDay: null,
    }
    const result = calculateDailyProbabilities(days, cycleStartDate, fertileWindow)
    expect(result).toEqual([])
  })

  it('should assign peak probability on ovulation day (0.25)', () => {
    const ovulationDate = new Date('2024-01-10')
    const days: DayData[] = [
      { date: new Date('2024-01-08'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-09'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-10'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-11'), temperature: 36.5, mucusQuality: null },
    ]
    const cycleStartDate = new Date('2024-01-01')
    const fertileWindow: FertileWindow = {
      fertileStart: new Date('2024-01-05'),
      fertileEnd: new Date('2024-01-13'),
      ovulationEstimate: ovulationDate,
      peakMucusDay: null,
      bbtRiseDay: null,
    }
    const result = calculateDailyProbabilities(days, cycleStartDate, fertileWindow)
    const ovulationDayProb = result.find((p) => p.date.getTime() === ovulationDate.getTime())
    expect(ovulationDayProb?.probability).toBe(0.25)
  })

  it('should assign highest probability day before ovulation (0.30)', () => {
    const ovulationDate = new Date('2024-01-10')
    const dayBefore = new Date('2024-01-09')
    const days: DayData[] = [
      { date: new Date('2024-01-08'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-09'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-10'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-11'), temperature: 36.5, mucusQuality: null },
    ]
    const cycleStartDate = new Date('2024-01-01')
    const fertileWindow: FertileWindow = {
      fertileStart: new Date('2024-01-05'),
      fertileEnd: new Date('2024-01-13'),
      ovulationEstimate: ovulationDate,
      peakMucusDay: null,
      bbtRiseDay: null,
    }
    const result = calculateDailyProbabilities(days, cycleStartDate, fertileWindow)
    const dayBeforeProb = result.find((p) => p.date.getTime() === dayBefore.getTime())
    expect(dayBeforeProb?.probability).toBe(0.30)
  })

  it('should mark days within fertile window as isFertile: true', () => {
    const days: DayData[] = [
      { date: new Date('2024-01-01'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-05'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-10'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-15'), temperature: 36.5, mucusQuality: null },
    ]
    const cycleStartDate = new Date('2024-01-01')
    const fertileWindow: FertileWindow = {
      fertileStart: new Date('2024-01-05'),
      fertileEnd: new Date('2024-01-13'),
      ovulationEstimate: new Date('2024-01-10'),
      peakMucusDay: null,
      bbtRiseDay: null,
    }
    const result = calculateDailyProbabilities(days, cycleStartDate, fertileWindow)

    const beforeFertile = result[0]
    const inFertile1 = result[1]
    const inFertile2 = result[2]
    const afterFertile = result[3]

    expect(beforeFertile.isFertile).toBe(false)
    expect(inFertile1.isFertile).toBe(true)
    expect(inFertile2.isFertile).toBe(true)
    expect(afterFertile.isFertile).toBe(false)
  })

  it('should have correct cycle day numbering', () => {
    const days: DayData[] = [
      { date: new Date('2024-01-01'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-02'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-03'), temperature: 36.5, mucusQuality: null },
    ]
    const cycleStartDate = new Date('2024-01-01')
    const fertileWindow: FertileWindow = {
      fertileStart: null,
      fertileEnd: null,
      ovulationEstimate: null,
      peakMucusDay: null,
      bbtRiseDay: null,
    }
    const result = calculateDailyProbabilities(days, cycleStartDate, fertileWindow)

    expect(result[0].cycleDay).toBe(1)
    expect(result[1].cycleDay).toBe(2)
    expect(result[2].cycleDay).toBe(3)
  })

  it('should assign 0.05 probability for 5 days before ovulation', () => {
    const ovulationDate = new Date('2024-01-10')
    const fiveDaysBefore = new Date('2024-01-05')
    const days: DayData[] = [
      { date: new Date('2024-01-05'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-10'), temperature: 36.5, mucusQuality: null },
    ]
    const cycleStartDate = new Date('2024-01-01')
    const fertileWindow: FertileWindow = {
      fertileStart: new Date('2024-01-05'),
      fertileEnd: new Date('2024-01-13'),
      ovulationEstimate: ovulationDate,
      peakMucusDay: null,
      bbtRiseDay: null,
    }
    const result = calculateDailyProbabilities(days, cycleStartDate, fertileWindow)
    const fiveDaysBeforeProb = result.find((p) => p.date.getTime() === fiveDaysBefore.getTime())
    expect(fiveDaysBeforeProb?.probability).toBe(0.05)
  })

  it('should assign 0.10 probability for 1 day after ovulation', () => {
    const ovulationDate = new Date('2024-01-10')
    const oneDayAfter = new Date('2024-01-11')
    const days: DayData[] = [
      { date: new Date('2024-01-10'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-11'), temperature: 36.5, mucusQuality: null },
    ]
    const cycleStartDate = new Date('2024-01-01')
    const fertileWindow: FertileWindow = {
      fertileStart: new Date('2024-01-05'),
      fertileEnd: new Date('2024-01-13'),
      ovulationEstimate: ovulationDate,
      peakMucusDay: null,
      bbtRiseDay: null,
    }
    const result = calculateDailyProbabilities(days, cycleStartDate, fertileWindow)
    const oneDayAfterProb = result.find((p) => p.date.getTime() === oneDayAfter.getTime())
    expect(oneDayAfterProb?.probability).toBe(0.10)
  })

  it('should assign 0.01 probability for days 2+ after ovulation or non-fertile days', () => {
    const ovulationDate = new Date('2024-01-10')
    const twoDaysAfter = new Date('2024-01-12')
    const threeDaysAfter = new Date('2024-01-13')
    const days: DayData[] = [
      { date: new Date('2024-01-01'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-12'), temperature: 36.5, mucusQuality: null },
      { date: new Date('2024-01-13'), temperature: 36.5, mucusQuality: null },
    ]
    const cycleStartDate = new Date('2024-01-01')
    const fertileWindow: FertileWindow = {
      fertileStart: new Date('2024-01-05'),
      fertileEnd: new Date('2024-01-13'),
      ovulationEstimate: ovulationDate,
      peakMucusDay: null,
      bbtRiseDay: null,
    }
    const result = calculateDailyProbabilities(days, cycleStartDate, fertileWindow)
    const day1 = result[0]
    const twoDaysAfterProb = result.find((p) => p.date.getTime() === twoDaysAfter.getTime())
    const threeDaysAfterProb = result.find((p) => p.date.getTime() === threeDaysAfter.getTime())

    expect(day1.probability).toBe(0.01)
    expect(twoDaysAfterProb?.probability).toBe(0.01)
    expect(threeDaysAfterProb?.probability).toBe(0.01)
  })
})
