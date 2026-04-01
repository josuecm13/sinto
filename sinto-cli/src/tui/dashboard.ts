/**
 * MODULE: TUI Dashboard
 * Renders the TUI home screen: phase badge, probability bar, fertility status, and account info.
 *
 * Exports: renderDashboard, clearScreen
 * Depends on: picocolors, tui/state
 */
import pc from 'picocolors'
import { state } from './state'
import { formatPhase, probabilityBar } from '../lib/fmt'

const WIDTH = 52

function line(char = '─') {
  return pc.dim(char.repeat(WIDTH))
}

function badge(text: string, color: (s: string) => string) {
  return color(`  ${text}  `)
}

const PHASE_BADGE: Record<string, string> = {
  MENSTRUAL: badge('Menstrual', pc.bgRed),
  FOLLICULAR: badge('Folicular', (s) => pc.bgYellow(pc.black(s))),
  OVULATORY: badge('Ovulatoria', pc.bgGreen),
  LUTEAL: badge('Lútea', pc.bgMagenta),
}

export function clearScreen() {
  process.stdout.write('\x1Bc')
}

export function renderDashboard() {
  clearScreen()
  console.log()
  console.log(`  ${pc.magenta('◆')} ${pc.bold(pc.white('sinto'))} ${pc.dim('─')} ${pc.dim('Sintotérmico')}`)
  console.log(`  ${line()}`)
  console.log()

  if (state.phase) {
    const phaseBadge = PHASE_BADGE[state.phase] ?? formatPhase(state.phase)
    const dayStr = state.cycleDay ? `  ${pc.dim('Día')} ${pc.bold(String(state.cycleDay))}` : ''
    console.log(`  ${phaseBadge}${dayStr}`)
    console.log()

    if (state.todayProbability > 0 || state.isCurrentlyFertile) {
      const bar = probabilityBar(state.todayProbability, 18)
      const fertile = state.isCurrentlyFertile
        ? pc.red(' ● Ventana fértil')
        : pc.dim(' ○ No fértil')
      console.log(`  Hoy  ${bar}${fertile}`)
      console.log()
    }
  } else {
    console.log(`  ${pc.dim('Sin ciclo activo')}`)
    console.log()
  }

  console.log(`  ${pc.dim('cuenta')}  ${pc.cyan(state.email)}`)
  console.log(`  ${line()}`)
  console.log()
}
