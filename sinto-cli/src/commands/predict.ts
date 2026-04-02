/**
 * MODULE: Predict Command
 * Commander command `sinto predict`; shows fertile window and daily probability table.
 *
 * Endpoints: GET /cycles/:id/prediction — retrieve fertility prediction
 *
 * Exports: predictCommand
 * Depends on: lib/api, lib/credentials, lib/fmt
 */
import { Command } from 'commander'
import pc from 'picocolors'
import * as p from '@clack/prompts'
import { apiGet } from '../lib/api'
import { requireAuth, getActiveCycleId } from '../lib/credentials'
import { handleError, section, row, formatDate, probabilityBar } from '../lib/fmt'

interface FertileWindow {
  ovulationEstimate: string
  fertileStart: string | null
  fertileEnd: string | null
}

interface DailyProbability {
  date: string
  cycleDay: number
  isFertile: boolean
  probability: number
}

interface PredictionResponse {
  fertileWindow: FertileWindow
  summary: {
    isCurrentlyFertile: boolean
    currentDayProbability: number
  }
  dailyProbability: DailyProbability[]
}

const predictCommand = new Command('predict')
  .description('Fertility prediction for a cycle')
  .option('--cycle <id>', 'Cycle ID (defaults to active cycle)')
  .action(async (options: { cycle?: string }) => {
    try {
      const creds = requireAuth()
      const cycleId = getActiveCycleId(creds, options.cycle)

      const spinner = p.spinner()
      spinner.start('Fetching prediction...')

      const prediction = await apiGet<PredictionResponse>(
        `/cycles/${cycleId}/prediction`,
        creds.accessToken,
      )

      spinner.stop('Done!')

      section('Fertility Prediction')

      row('Estimated ovulation', formatDate(prediction.fertileWindow.ovulationEstimate))

      const fertileWindowStr =
        prediction.fertileWindow.fertileStart && prediction.fertileWindow.fertileEnd
          ? `${formatDate(prediction.fertileWindow.fertileStart)} → ${formatDate(prediction.fertileWindow.fertileEnd)}`
          : '—'
      row('Fertile window', fertileWindowStr)

      row(
        'Currently fertile',
        prediction.summary.isCurrentlyFertile ? pc.red('Yes') : pc.green('No'),
      )

      row('Today probability', probabilityBar(prediction.summary.currentDayProbability))

      section('Daily Probability')

      console.log(`  ${'DATE'.padEnd(12)} ${'DAY'.padEnd(6)} ${'FERTILE'.padEnd(10)} BAR`)
      console.log(`  ${pc.dim('─'.repeat(70))}`)

      prediction.dailyProbability.slice(0, 10).forEach((dayProb) => {
        const dateStr = formatDate(dayProb.date).padEnd(12)
        const dayStr = dayProb.cycleDay.toString().padEnd(6)
        const fertileStr = dayProb.isFertile ? pc.red('yes') : pc.dim('no')
        const barStr = probabilityBar(dayProb.probability, 15)

        console.log(`  ${dateStr} ${dayStr} ${fertileStr.padEnd(10)} ${barStr}`)
      })

      console.log()
    } catch (err) {
      handleError(err, 'fetching prediction')
    }
  })

export { predictCommand }
