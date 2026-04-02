/**
 * MODULE: TUI App
 * Main TUI event loop: loads state from API, renders dashboard, and dispatches to flow modules.
 *
 * Exports: runApp
 * Depends on: @clack/prompts, picocolors, lib/api, lib/credentials, tui/dashboard, tui/state, all flows
 */
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { apiGet } from '../lib/api'
import { requireAuth, getActiveCycleId } from '../lib/credentials'
import { renderDashboard, clearScreen } from './dashboard'
import { setState, state } from './state'
import { logFlow } from './flows/log-flow'
import { cycleFlow } from './flows/cycle-flow'
import { phaseFlow } from './flows/phase-flow'
import { predictFlow } from './flows/predict-flow'
import { calendarFlow } from './flows/calendar-flow'
import { chartFlow } from './flows/chart-flow'

interface UserProfile {
  name: string
  email: string
}

interface CurrentPhase {
  phase: string
  cycleDay: number
}

interface Prediction {
  summary: { currentDayProbability: number; isCurrentlyFertile: boolean }
}

async function loadState() {
  const creds = requireAuth()
  try {
    const [user, phaseData, predData] = await Promise.allSettled([
      apiGet<UserProfile>('/users/me', creds.accessToken),
      creds.activeCycleId
        ? apiGet<CurrentPhase>(`/phases/current?cycleId=${creds.activeCycleId}`, creds.accessToken)
        : Promise.reject(),
      creds.activeCycleId
        ? apiGet<Prediction>(`/cycles/${creds.activeCycleId}/prediction`, creds.accessToken)
        : Promise.reject(),
    ])

    if (user.status === 'fulfilled') {
      setState({ name: user.value.name, email: user.value.email })
    } else {
      setState({ email: creds.email })
    }

    if (phaseData.status === 'fulfilled') {
      setState({ phase: phaseData.value.phase, cycleDay: phaseData.value.cycleDay, activeCycleId: creds.activeCycleId ?? null })
    }

    if (predData.status === 'fulfilled') {
      setState({
        isCurrentlyFertile: predData.value.summary.isCurrentlyFertile,
        todayProbability: predData.value.summary.currentDayProbability,
      })
    }
  } catch {
    setState({ email: creds.email })
  }
}

export async function runApp() {
  // Check auth before starting
  requireAuth()

  // Load initial state
  const initSpinner = p.spinner()
  clearScreen()
  console.log()
  initSpinner.start('Cargando...')
  await loadState()
  initSpinner.stop('')

  // Main loop
  while (true) {
    renderDashboard()

    const hasCycle = !!state.activeCycleId

    const choice = await p.select({
      message: '¿Qué quieres hacer?',
      options: [
        ...(hasCycle ? [
          { value: 'log', label: `${pc.cyan('📝')} Registrar síntomas de hoy` },
          { value: 'calendar', label: `${pc.cyan('📅')} Ver calendario del ciclo` },
          { value: 'chart', label: `${pc.cyan('📊')} Gráfica de temperatura` },
          { value: 'phase', label: `${pc.cyan('🌿')} Guía de fase actual` },
          { value: 'predict', label: `${pc.cyan('🔮')} Predicción de fertilidad` },
        ] : []),
        { value: 'cycle', label: `${pc.cyan('🔄')} Gestionar ciclos` },
        { value: 'refresh', label: pc.dim('↺  Actualizar') },
        { value: 'quit', label: pc.dim('✕  Salir') },
      ],
    })

    if (p.isCancel(choice) || choice === 'quit') {
      clearScreen()
      console.log()
      console.log(`  ${pc.magenta('◆')} ${pc.dim('Hasta pronto.')}`)
      console.log()
      process.exit(0)
    }

    if (choice === 'refresh') {
      const s = p.spinner()
      s.start('Actualizando...')
      await loadState()
      s.stop('')
      continue
    }

    if (choice === 'log') await logFlow()
    if (choice === 'calendar') await calendarFlow()
    if (choice === 'chart') await chartFlow()
    if (choice === 'phase') await phaseFlow()
    if (choice === 'predict') await predictFlow()
    if (choice === 'cycle') await cycleFlow()

    // Reload state after any action
    await loadState()
  }
}
