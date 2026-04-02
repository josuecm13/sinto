/**
 * MODULE: BBT Chart
 * Renders a vertical bar temperature chart: X = cycle day, Y = temperature (°C).
 * Phase colors from PHASE_COLOR. Fertile window marked with ◈. Baseline line.
 *
 * Exports: renderBBTChart, ChartDay
 * Depends on: picocolors
 */

import pc from 'picocolors'

export interface ChartDay {
  cycleDay: number
  date: string
  temperature: number | null
  phase?: string
  isMenstruating?: boolean
  isFertile?: boolean
}

const PHASE_COLOR: Record<string, (s: string) => string> = {
  MENSTRUAL: (s) => pc.red(s),
  FOLLICULAR: (s) => pc.yellow(s),
  OVULATORY: (s) => pc.green(s),
  LUTEAL: (s) => pc.magenta(s),
}

export function renderBBTChart(days: ChartDay[], cycleStartDate?: string, cycleEndDate?: string): void {
  // Filter to logged days only
  const logged = days.filter((d) => d.temperature != null)
  if (logged.length === 0) {
    console.log('  No temperature data to chart.')
    return
  }

  // Compute stats
  const temps = logged.map((d) => d.temperature!).sort((a, b) => a - b)
  const min = temps[0]
  const max = temps[temps.length - 1]
  const baseline = logged
    .filter((d) => d.phase === 'MENSTRUAL' || d.phase === 'FOLLICULAR')
    .slice(0, 6)
    .reduce((s, d) => s + (d.temperature ?? 0), 0) / Math.min(6, logged.length)

  // Build Y-axis (temperature rows)
  const yMax = Math.ceil((max + 0.1) * 10) / 10
  const yMin = Math.floor((min - 0.1) * 10) / 10
  const rows: number[] = []
  for (let y = yMax; y >= yMin; y -= 0.1) {
    rows.push(Math.round(y * 10) / 10)
  }

  // Header
  console.log()
  const title = `BBT – Ciclo (${cycleStartDate ?? 'inicio'} → ${cycleEndDate ?? 'presente'})`
  console.log(`  ${pc.bold(pc.white(title))}`)
  console.log()

  // Chart body: iterate rows top-to-bottom
  for (const rowTemp of rows) {
    const rowLabel = rowTemp.toFixed(1).padStart(5)
    process.stdout.write(`  ${rowLabel} ┤ `)

    // Draw each day column
    for (const day of logged) {
      const colorFn = day.phase ? PHASE_COLOR[day.phase] : (s: string) => s
      const temp = day.temperature ?? 0

      if (Math.abs(temp - rowTemp) < 0.05) {
        // Day's bar reaches this row
        process.stdout.write(colorFn('█ '))
      } else if (temp > rowTemp) {
        // Bar extends above this row
        process.stdout.write(colorFn('█ '))
      } else {
        // No bar at this row
        process.stdout.write('  ')
      }
    }

    // Mark baseline row with dashes
    if (Math.abs(baseline - rowTemp) < 0.05) {
      process.stdout.write(pc.dim(' ─'))
    }

    console.log()
  }

  // X-axis
  process.stdout.write('       └')
  for (const day of logged) process.stdout.write('─ ')
  console.log()

  // Day numbers (cycle day)
  process.stdout.write('         ')
  for (const day of logged) {
    process.stdout.write(String(day.cycleDay).padStart(2) + ' ')
  }
  console.log()

  // Fertile marker row (◈ under fertile days)
  process.stdout.write('         ')
  for (const day of logged) {
    if (day.isFertile) {
      process.stdout.write(pc.green('◈ '))
    } else {
      process.stdout.write('  ')
    }
  }
  console.log()

  // Legend
  console.log()
  console.log(`  ${pc.red('●')} Menstrual  ${pc.yellow('●')} Follicular  ${pc.green('●')} Ovulatory  ${pc.magenta('●')} Luteal`)
  console.log(`  ${pc.green('◈')} Fertile window  ${pc.dim('─')} Baseline average`)
  console.log()
}
