/**
 * MODULE: Phase Flow
 * Interactive phase guide flow: shows current phase summary and content by category (GENERAL, EXERCISE, NUTRITION, TIPS, DANGERS).
 *
 * Endpoints: GET /phases/:name — retrieve phase info; GET /phases/current — retrieve current phase
 *
 * Exports: phaseFlow
 * Depends on: @clack/prompts, picocolors, lib/api, lib/credentials, lib/fmt
 */
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { apiGet } from '../../lib/api'
import { requireAuth, getActiveCycleId } from '../../lib/credentials'
import { handleError, formatPhase } from '../../lib/fmt'
import { state } from '../state'

interface ContentItem { title: string; body: string }
interface PhaseResponse {
  phase: string
  cycleDay?: number
  content: Record<string, ContentItem[]>
}

function wrap(text: string, w = 58): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const word of words) {
    if ((cur + word).length > w) { if (cur) lines.push(cur); cur = word }
    else cur = cur ? `${cur} ${word}` : word
  }
  if (cur) lines.push(cur)
  return lines
}

function printContent(data: PhaseResponse) {
  const order = ['GENERAL', 'EXERCISE', 'NUTRITION', 'TIPS', 'DANGERS']
  const labels: Record<string, string> = {
    GENERAL: 'General', EXERCISE: '🏃 Ejercicio',
    NUTRITION: '🥗 Alimentación', TIPS: '💡 Tips', DANGERS: '⚠️  Alertas',
  }
  for (const cat of order) {
    const items = data.content[cat]
    if (!items?.length) continue
    console.log()
    console.log(`  ${pc.bold(labels[cat] ?? cat)}`)
    for (const item of items) {
      console.log(`  ${pc.cyan('▸')} ${item.title}`)
      wrap(item.body).forEach((l) => console.log(`    ${pc.dim(l)}`))
    }
  }
  console.log()
}

export async function phaseFlow() {
  const choice = await p.select({
    message: pc.bold('Guía de fases'),
    options: [
      { value: 'current', label: state.phase ? `Fase actual — ${formatPhase(state.phase)}` : 'Fase actual' },
      { value: 'MENSTRUAL', label: '🔴 Menstrual' },
      { value: 'FOLLICULAR', label: '🟡 Folicular' },
      { value: 'OVULATORY', label: '🟢 Ovulatoria' },
      { value: 'LUTEAL', label: '🟣 Lútea' },
      { value: 'back', label: pc.dim('← Volver') },
    ],
  })

  if (p.isCancel(choice) || choice === 'back') return

  const spinner = p.spinner()
  spinner.start('Cargando...')

  try {
    let data: PhaseResponse
    if (choice === 'current') {
      const creds = requireAuth()
      const cycleId = getActiveCycleId(creds)
      data = await apiGet<PhaseResponse>(`/phases/current?cycleId=${cycleId}`, creds.accessToken)
    } else {
      data = await apiGet<PhaseResponse>(`/phases/${choice}`)
    }
    spinner.stop('')
    console.log()
    if (data.cycleDay) {
      console.log(`  ${pc.dim('Día')} ${pc.bold(String(data.cycleDay))} — ${formatPhase(data.phase)}`)
    } else {
      console.log(`  ${formatPhase(data.phase)}`)
    }
    printContent(data)
    await p.text({ message: pc.dim('Enter para continuar...') })
  } catch (err) {
    spinner.stop('Error')
    handleError(err, 'cargar fase')
  }
}
