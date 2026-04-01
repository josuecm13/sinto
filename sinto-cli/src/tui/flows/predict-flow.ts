/**
 * MODULE: Predict Flow
 * Interactive fertility prediction flow: shows fertile window, ovulation estimate, and daily probability table.
 *
 * Endpoints: GET /cycles/:id/prediction — retrieve fertility prediction
 *
 * Exports: predictFlow
 * Depends on: @clack/prompts, picocolors, lib/api, lib/credentials, lib/fmt, tui/state
 */
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { apiGet } from '../../lib/api'
import { requireAuth, getActiveCycleId } from '../../lib/credentials'
import { handleError, formatDate, probabilityBar } from '../../lib/fmt'
import { setState } from '../state'

interface FertileWindow {
  fertileStart: string | null
  fertileEnd: string | null
  ovulationEstimate: string | null
}
interface DayProb { date: string; cycleDay: number; probability: number; isFertile: boolean }
interface Prediction {
  fertileWindow: FertileWindow
  dailyProbability: DayProb[]
  summary: { estimatedOvulation: string | null; currentDayProbability: number; isCurrentlyFertile: boolean }
}

export async function predictFlow() {
  const creds = requireAuth()
  const cycleId = getActiveCycleId(creds)

  const spinner = p.spinner()
  spinner.start('Calculando predicción...')

  try {
    const data = await apiGet<Prediction>(`/cycles/${cycleId}/prediction`, creds.accessToken)
    spinner.stop('')

    setState({
      isCurrentlyFertile: data.summary.isCurrentlyFertile,
      todayProbability: data.summary.currentDayProbability,
    })

    const { fertileWindow: fw, summary, dailyProbability } = data

    console.log()
    console.log(`  ${pc.bold('Predicción de fertilidad')}`)
    console.log(`  ${pc.dim('─'.repeat(48))}`)
    console.log()

    const fertile = summary.isCurrentlyFertile ? pc.red('● Sí') : pc.dim('○ No')
    console.log(`  ${pc.dim('Ovulación estimada')}   ${formatDate(summary.estimatedOvulation)}`)
    console.log(`  ${pc.dim('Ventana fértil')}       ${fw.fertileStart ? `${formatDate(fw.fertileStart)} → ${formatDate(fw.fertileEnd)}` : pc.dim('—')}`)
    console.log(`  ${pc.dim('Actualmente fértil')}   ${fertile}`)
    console.log(`  ${pc.dim('Probabilidad hoy')}     ${probabilityBar(summary.currentDayProbability, 18)}`)
    console.log()

    if (dailyProbability.length > 0) {
      console.log(`  ${pc.bold('Próximos días')}`)
      console.log(`  ${pc.dim('FECHA         DÍA  FÉRTIL  PROBABILIDAD')}`)
      const upcoming = dailyProbability
        .filter((d) => new Date(d.date) >= new Date(new Date().toISOString().slice(0, 10)))
        .slice(0, 12)

      for (const d of upcoming) {
        const date = formatDate(d.date).padEnd(14)
        const day = String(d.cycleDay).padEnd(5)
        const fertileStr = d.isFertile ? pc.red('sí   ') : pc.dim('no   ')
        const bar = probabilityBar(d.probability, 14)
        console.log(`  ${date} ${day}${fertileStr} ${bar}`)
      }
      console.log()
    } else {
      console.log(`  ${pc.dim('Registra temperaturas y mucosa para obtener predicciones.')}`)
      console.log()
    }

    await p.text({ message: pc.dim('Enter para continuar...') })
  } catch (err) {
    spinner.stop('Error')
    handleError(err, 'calcular predicción')
  }
}
