/**
 * MODULE: BBT Chart Flow
 * Interactive chart flow: loads cycle logs and prediction, renders temperature chart.
 *
 * Endpoints: GET /cycles/:id, GET /cycles/:id/prediction
 *
 * Exports: chartFlow
 * Depends on: @clack/prompts, lib/api, lib/credentials, tui/chart, lib/fmt
 */

import * as p from '@clack/prompts'
import pc from 'picocolors'
import { apiGet } from '../../lib/api'
import { requireAuth, getActiveCycleId } from '../../lib/credentials'
import { handleError, formatDate } from '../../lib/fmt'
import { renderBBTChart, ChartDay } from '../chart'

interface Log {
  date: string
  temperature?: number | null
  phase?: string
}

interface PredictionResponse {
  dailyProbability: { date: string; isFertile: boolean }[]
}

interface Cycle {
  id: string
  startDate: string
  endDate: string | null
  logs: Log[]
}

export async function chartFlow() {
  const creds = requireAuth()
  const cycleId = getActiveCycleId(creds)

  const spinner = p.spinner()
  spinner.start('Cargando gráfica...')

  try {
    const [cycle, prediction] = await Promise.all([
      apiGet<Cycle>(`/cycles/${cycleId}`, creds.accessToken),
      apiGet<PredictionResponse>(`/cycles/${cycleId}/prediction`, creds.accessToken).catch(() => null),
    ])

    spinner.stop('')

    // Build fertile set from prediction
    const fertileSet = new Set<string>()
    if (prediction) {
      for (const d of prediction.dailyProbability) {
        if (d.isFertile) fertileSet.add(d.date.slice(0, 10))
      }
    }

    // Map logs to chart format
    const chartDays: ChartDay[] = cycle.logs.map((log, idx) => ({
      cycleDay: idx + 1,
      date: log.date.slice(0, 10),
      temperature: log.temperature ?? null,
      phase: log.phase,
      isFertile: fertileSet.has(log.date.slice(0, 10)),
    }))

    // Render chart
    renderBBTChart(
      chartDays,
      formatDate(cycle.startDate),
      cycle.endDate ? formatDate(cycle.endDate) : undefined,
    )

    // Wait for user to continue
    await p.text({ message: pc.dim('Presiona Enter para continuar...') })
  } catch (err) {
    spinner.stop('Error')
    handleError(err, 'cargar gráfica')
  }
}
