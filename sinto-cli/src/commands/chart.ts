/**
 * MODULE: Chart Command
 * Commander command `sinto chart`; renders BBT temperature chart for active cycle.
 *
 * Endpoints: GET /cycles/:id, GET /cycles/:id/prediction
 *
 * Exports: chartCommand
 * Depends on: lib/api, lib/credentials, tui/chart, lib/fmt
 */

import { Command } from 'commander'
import * as p from '@clack/prompts'
import { apiGet } from '../lib/api'
import { requireAuth, getActiveCycleId } from '../lib/credentials'
import { handleError, formatDate } from '../lib/fmt'
import { renderBBTChart, ChartDay } from '../tui/chart'

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

const chartCommand = new Command('chart').description('BBT temperature chart').action(async () => {
  try {
    const creds = requireAuth()
    const cycleId = getActiveCycleId(creds)

    const spinner = p.spinner()
    spinner.start('Cargando gráfica...')

    const [cycle, prediction] = await Promise.all([
      apiGet<Cycle>(`/cycles/${cycleId}`, creds.accessToken),
      apiGet<PredictionResponse>(`/cycles/${cycleId}/prediction`, creds.accessToken).catch(() => null),
    ])

    spinner.stop('Done!')

    // Build fertile set
    const fertileSet = new Set<string>()
    if (prediction) {
      for (const d of prediction.dailyProbability) {
        if (d.isFertile) fertileSet.add(d.date.slice(0, 10))
      }
    }

    // Map logs
    const chartDays: ChartDay[] = cycle.logs.map((log, idx) => ({
      cycleDay: idx + 1,
      date: log.date.slice(0, 10),
      temperature: log.temperature ?? null,
      phase: log.phase,
      isFertile: fertileSet.has(log.date.slice(0, 10)),
    }))

    renderBBTChart(
      chartDays,
      formatDate(cycle.startDate),
      cycle.endDate ? formatDate(cycle.endDate) : undefined,
    )
  } catch (err) {
    handleError(err, 'rendering chart')
  }
})

export { chartCommand }
