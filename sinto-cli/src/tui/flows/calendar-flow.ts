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
  dailyProbability: { date: string; isFertile: boolean }[]
}

interface Cycle {
  id: string
  startDate: string
  endDate: string | null
  logs: Log[]
}

export async function calendarFlow() {
  const creds = requireAuth()
  const cycleId = getActiveCycleId(creds)

  const spinner = p.spinner()
  spinner.start('Cargando ciclo...')

  try {
    const [cycle, prediction] = await Promise.all([
      apiGet<Cycle>(`/cycles/${cycleId}`, creds.accessToken),
      apiGet<Prediction>(`/cycles/${cycleId}/prediction`, creds.accessToken).catch(() => null),
    ])
    spinner.stop('')

    // Build fertile set
    const fertileSet = new Set<string>()
    if (prediction) {
      for (const d of prediction.dailyProbability) {
        if (d.isFertile) fertileSet.add(d.date)
      }
    }

    // Build CalendarDay array
    const calDays: CalendarDay[] = cycle.logs.map((log) => ({
      date: log.date.slice(0, 10),
      phase: log.phase ?? undefined,
      isMenstruating: log.isMenstruating,
      temperature: log.temperature,
      isFertile: fertileSet.has(log.date.slice(0, 10)),
      hasLog: true,
    }))

    // Determine which months to show
    const start = new Date(cycle.startDate)
    const end = cycle.endDate ? new Date(cycle.endDate) : new Date()

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
