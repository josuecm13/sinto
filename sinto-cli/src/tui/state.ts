/**
 * MODULE: TUI App State
 * Shared mutable singleton for TUI app state: user, phase, cycle, and fertility data.
 *
 * Exports: AppState, state, setState
 * Depends on: (none)
 */

export interface AppState {
  email: string
  name: string
  activeCycleId: string | null
  cycleDay: number | null
  phase: string | null
  isCurrentlyFertile: boolean
  todayProbability: number
}

export let state: AppState = {
  email: '',
  name: '',
  activeCycleId: null,
  cycleDay: null,
  phase: null,
  isCurrentlyFertile: false,
  todayProbability: 0,
}

export function setState(patch: Partial<AppState>) {
  state = { ...state, ...patch }
}
