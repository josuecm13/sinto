/**
 * MODULE: Calendar Flow
 * Interactive calendar flow: loads cycle logs and prediction, renders up to 3 months in the terminal.
 *
 * Endpoints: GET /cycles/:id — retrieve cycle logs; GET /cycles/:id/prediction — retrieve prediction
 *
 * Exports: calendarFlow
 * Depends on: @clack/prompts, picocolors, lib/api, lib/credentials, lib/fmt, tui/calendar
 */
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { apiGet } from '../../lib/api'
import { requireAuth, getActiveCycleId } from '../../lib/credentials'
import { handleError } from '../../lib/fmt'
import { renderCalendar, CalendarDay } from '../calendar'

interface Log {
  date: string
  phase?: string
  isMenstruating: boolean
  temperature?: number | null
}

interface Prediction {
  currentPhase: { name: string }
  fertilityWindow: {
    estimatedStartDate: string
    estimatedEndDate: string
    isCurrentlyFertile: boolean
  }
  expectedOvulation: { estimatedDate: string }
  nextExpectedMenstruation: string
}

interface Cycle {
  id: string
  startDate: string
  endDate: string | null
}

interface LogsResponse {
  logs: Log[]
}

export async function calendarFlow() {
  const creds = requireAuth()
  const cycleId = getActiveCycleId(creds)

  const spinner = p.spinner()
  spinner.start('Cargando ciclo...')

  try {
    const [cycle, logsResponse, prediction] = await Promise.all([
      apiGet<Cycle>(`/cycles/${cycleId}`, creds.accessToken),
      apiGet<LogsResponse>(`/cycles/${cycleId}/logs`, creds.accessToken),
      apiGet<Prediction>(`/cycles/${cycleId}/prediction`, creds.accessToken).catch(() => null),
    ])
    spinner.stop('')

    // Build fertility window date range from prediction
    let fertileStart: string | null = null
    let fertileEnd: string | null = null
    if (prediction) {
      fertileStart = prediction.fertilityWindow.estimatedStartDate.slice(0, 10)
      fertileEnd = prediction.fertilityWindow.estimatedEndDate.slice(0, 10)
    }

    const inFertileWindow = (date: string) =>
      !!fertileStart && !!fertileEnd && date >= fertileStart && date <= fertileEnd

    // Build CalendarDay array from actual logs
    const loggedDates = new Set<string>()
    const calDays: CalendarDay[] = logsResponse.logs.map((log) => {
      const date = log.date.slice(0, 10)
      loggedDates.add(date)
      return {
        date,
        phase: log.phase ?? undefined,
        isMenstruating: log.isMenstruating,
        temperature: log.temperature,
        isFertile: inFertileWindow(date),
        hasLog: true,
      }
    })

    // Add predicted days for unlocked dates (cycle start → next expected menstruation)
    if (prediction) {
      const cycleStart = cycle.startDate.slice(0, 10)
      const cycleEnd = prediction.nextExpectedMenstruation.slice(0, 10)
      const cursor = new Date(cycleStart)
      const endDate = new Date(cycleEnd)
      const cycleStartDate = new Date(cycleStart)

      while (cursor <= endDate) {
        const dateStr = cursor.toISOString().slice(0, 10)
        if (!loggedDates.has(dateStr)) {
          // Estimate phase based on position relative to cycle start and fertility window
          const dayOfCycle = Math.floor((cursor.getTime() - cycleStartDate.getTime()) / 86400000) + 1
          let phase: string
          if (dayOfCycle <= 5) {
            phase = 'MENSTRUAL'
          } else if (fertileStart && dateStr < fertileStart) {
            phase = 'FOLLICULAR'
          } else if (fertileStart && fertileEnd && dateStr >= fertileStart && dateStr <= fertileEnd) {
            phase = 'OVULATORY'
          } else {
            phase = 'LUTEAL'
          }

          calDays.push({
            date: dateStr,
            phase,
            isFertile: inFertileWindow(dateStr),
            isPredicted: true,
            hasLog: false,
          })
        }
        cursor.setDate(cursor.getDate() + 1)
      }
    }

    // Determine which months to show
    const start = new Date(cycle.startDate)
    const end = prediction
      ? new Date(prediction.nextExpectedMenstruation)
      : cycle.endDate ? new Date(cycle.endDate) : new Date()

    let year = start.getFullYear()
    let month = start.getMonth()
    const endYear = end.getFullYear()
    const endMonth = end.getMonth()

    // Render up to 3 months
    let rendered = 0
    while ((year < endYear || (year === endYear && month <= endMonth)) && rendered < 3) {
      renderCalendar(year, month, calDays)
      month++
      if (month > 11) { month = 0; year++ }
      rendered++
    }

    await p.text({ message: pc.dim('Enter para continuar...') })
  } catch (err) {
    spinner.stop('Error')
    handleError(err, 'cargar calendario')
  }
}
