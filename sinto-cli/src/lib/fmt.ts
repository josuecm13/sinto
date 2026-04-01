/**
 * MODULE: Terminal Formatting Helpers
 * Provides utilities for formatting dates, phase names, probability bars, and error display.
 *
 * Exports: handleError, row, section, formatDate, formatPhase, probabilityBar, today
 * Depends on: picocolors
 */
import pc from 'picocolors'
import { ApiError } from './api'

export function handleError(err: unknown, action = 'operation'): never {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      console.error(`\n  ${pc.red('✖')} Session expired. Run: sinto login\n`)
    } else {
      console.error(`\n  ${pc.red('✖')} ${err.message} ${pc.dim(`(${err.code})`)}\n`)
    }
  } else {
    console.error(`\n  ${pc.red('✖')} Could not reach API during ${action}. Is the server running?\n`)
  }
  process.exit(1)
}

export function label(text: string) {
  return pc.dim(text.padEnd(18))
}

export function row(key: string, value: string | null | undefined) {
  if (value == null || value === '') return
  console.log(`  ${label(key)} ${value}`)
}

export function section(title: string) {
  console.log()
  console.log(`  ${pc.bold(pc.white(title))}`)
  console.log(`  ${pc.dim('─'.repeat(40))}`)
}

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return pc.dim('—')
  return new Date(d).toLocaleDateString('es-CR', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatPhase(phase: string): string {
  const map: Record<string, string> = {
    MENSTRUAL: pc.red('● Menstrual'),
    FOLLICULAR: pc.yellow('● Folicular'),
    OVULATORY: pc.green('● Ovulatoria'),
    LUTEAL: pc.magenta('● Lútea'),
  }
  return map[phase] ?? phase
}

export function probabilityBar(prob: number, width = 20): string {
  const filled = Math.round(prob * width)
  const bar = '█'.repeat(filled) + pc.dim('░'.repeat(width - filled))
  const pct = `${Math.round(prob * 100)}%`.padStart(4)
  const color = prob >= 0.2 ? pc.red : prob >= 0.1 ? pc.yellow : pc.dim
  return `${color(bar)} ${pc.bold(pct)}`
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}
