/**
 * MODULE: TUI Calendar
 * Renders a month calendar grid in the terminal with phase colors, fertility markers, and today highlight.
 *
 * Exports: CalendarDay, renderCalendar
 * Depends on: picocolors
 */
import pc from 'picocolors'

export interface CalendarDay {
  date: string          // YYYY-MM-DD
  isMenstruating?: boolean
  phase?: string
  temperature?: number | null
  isFertile?: boolean
  isToday?: boolean
  hasLog?: boolean
}

const PHASE_COLOR: Record<string, (s: string) => string> = {
  MENSTRUAL:   (s) => pc.red(s),
  FOLLICULAR:  (s) => pc.yellow(s),
  OVULATORY:   (s) => pc.green(s),
  LUTEAL:      (s) => pc.magenta(s),
}

const DAYS_HEADER = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function daySymbol(day: CalendarDay | undefined, dayNum: number): string {
  const num = String(dayNum).padStart(2, ' ')

  if (!day) return pc.dim(`  ${num} `)

  const colorFn = day.phase ? PHASE_COLOR[day.phase] : (s: string) => s

  let cell = `  ${num} `

  if (day.isToday) {
    cell = pc.bold(pc.bgWhite(pc.black(` ${num} `))) + ' '
  } else if (day.isMenstruating) {
    cell = colorFn(pc.bold(` 🔴 `)) + ' '
  } else if (day.isFertile) {
    cell = pc.green(pc.bold(` ◈${num.trim()} `)) + ' '
  } else if (day.hasLog) {
    cell = colorFn(`  ${num} `)
  } else {
    cell = pc.dim(`  ${num} `)
  }

  return cell
}

export function renderCalendar(
  year: number,
  month: number,           // 0-indexed
  days: CalendarDay[],
): void {
  const dayMap = new Map<string, CalendarDay>()
  for (const d of days) dayMap.set(d.date, d)

  const today = new Date().toISOString().slice(0, 10)

  console.log()
  console.log(`  ${pc.bold(`${MONTH_NAMES[month]} ${year}`)}`)
  console.log(`  ${pc.dim('─'.repeat(38))}`)
  console.log(`  ${DAYS_HEADER.map((d) => pc.dim(d.padEnd(4))).join('')}`)
  console.log()

  const firstDay = new Date(year, month, 1).getDay()
  // Convert Sunday=0 to Monday-first: Mon=0..Sun=6
  const startOffset = (firstDay + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  let row = '  '
  let col = 0

  // Blank padding before first day
  for (let i = 0; i < startOffset; i++) {
    row += '    '
    col++
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dayData = dayMap.get(dateStr)
    const meta: CalendarDay = dayData
      ? { ...dayData, isToday: dateStr === today }
      : { date: dateStr, isToday: dateStr === today }

    row += daySymbol(meta, d)
    col++

    if (col === 7) {
      console.log(row)
      row = '  '
      col = 0
    }
  }

  if (col > 0) console.log(row)
  console.log()

  // Legend
  console.log(`  ${pc.red('🔴')} menstruando  ${pc.green('◈')} fértil  ${pc.bgWhite(pc.black(' hoy '))}  ${pc.dim('· sin registro')}`)
  console.log()
}
