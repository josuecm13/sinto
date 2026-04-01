/**
 * MODULE: Cycle Command Group
 * Commander command group `sinto cycle`; subcommands: list, start, show, close, use, delete.
 *
 * Endpoints: GET /cycles — list cycles; POST /cycles — start cycle; GET /cycles/:id — show cycle; PATCH /cycles/:id — close cycle; DELETE /cycles/:id — delete cycle
 *
 * Exports: cycleCommand
 * Depends on: @clack/prompts, lib/api, lib/credentials, lib/fmt
 */
import { Command } from 'commander'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { apiGet, apiPost, apiPatch, apiDelete } from '../lib/api'
import { requireAuth, setActiveCycle, getActiveCycleId } from '../lib/credentials'
import { handleError, section, row, formatDate, today } from '../lib/fmt'

interface Log {
  date: string
  temperature?: number
  bleedingType?: string
  cervicalFluidType?: string
}

interface Cycle {
  id: string
  startDate: string
  endDate: string | null
  cycleLength: number
  lutealPhaseLength: number
  logsCount: number
  logs: Log[]
}

interface CycleListItem {
  id: string
  startDate: string
  endDate: string | null
  cycleLength: number
}

const cycleCommand = new Command('cycle').description('Manage your cycles')

// cycle list
cycleCommand
  .command('list')
  .description('List all your cycles')
  .action(async () => {
    try {
      const creds = requireAuth()

      const spinner = p.spinner()
      spinner.start('Fetching cycles...')

      const cycles = await apiGet<CycleListItem[]>('/cycles', creds.accessToken)

      spinner.stop('Done!')

      if (cycles.length === 0) {
        console.log('\n  No cycles yet. Run: sinto cycle start\n')
        return
      }

      section('Your Cycles')
      cycles.forEach((cycle, idx) => {
        const startStr = formatDate(cycle.startDate)
        const endStr = cycle.endDate ? formatDate(cycle.endDate) : 'present'
        const daysStr = `(${cycle.cycleLength} days)`
        const active = cycle.id === creds.activeCycleId ? `  ${pc.cyan('[ACTIVE]')}` : ''
        console.log(`  ${(idx + 1).toString().padEnd(3)} ${startStr} → ${endStr}  ${daysStr}${active}`)
      })
      console.log()
    } catch (err) {
      handleError(err, 'fetching cycles')
    }
  })

// cycle start
cycleCommand
  .command('start')
  .description('Start a new cycle')
  .action(async () => {
    try {
      const creds = requireAuth()

      const startDate = await p.text({
        message: 'Start date? (YYYY-MM-DD)',
        placeholder: today(),
        defaultValue: today(),
      })

      const spinner = p.spinner()
      spinner.start('Creating cycle...')

      const cycle = await apiPost<Cycle>('/cycles', { startDate }, creds.accessToken)

      setActiveCycle(cycle.id)

      spinner.stop('Cycle started!')
      console.log(`\n  Cycle started! (ID: ${cycle.id})`)
      console.log(`  Set as active cycle.\n`)
    } catch (err) {
      handleError(err, 'creating cycle')
    }
  })

// cycle show
cycleCommand
  .command('show [cycleId]')
  .description('Show cycle details')
  .action(async (cycleId?: string) => {
    try {
      const creds = requireAuth()
      const id = getActiveCycleId(creds, cycleId)

      const spinner = p.spinner()
      spinner.start('Fetching cycle...')

      const cycle = await apiGet<Cycle>(`/cycles/${id}`, creds.accessToken)

      spinner.stop('Done!')

      section(`Cycle ${cycle.id}`)
      row('Start date', formatDate(cycle.startDate))
      row('End date', formatDate(cycle.endDate))
      row('Cycle length', `${cycle.cycleLength} days`)
      row('Luteal phase length', `${cycle.lutealPhaseLength} days`)
      row('Logs', `${cycle.logsCount}`)

      if (cycle.logs && cycle.logs.length > 0) {
        console.log(`  ${pc.dim('─'.repeat(40))}`)
        section('Logs')
        cycle.logs.forEach((log) => {
          let logStr = `  ${formatDate(log.date)}`
          if (log.temperature) logStr += `  🌡 ${log.temperature}°C`
          if (log.bleedingType) logStr += `  🩸 ${log.bleedingType}`
          if (log.cervicalFluidType) logStr += `  💧 ${log.cervicalFluidType}`
          console.log(logStr)
        })
      }
      console.log()
    } catch (err) {
      handleError(err, 'fetching cycle')
    }
  })

// cycle close
cycleCommand
  .command('close [cycleId]')
  .description('Close a cycle')
  .action(async (cycleId?: string) => {
    try {
      const creds = requireAuth()
      const id = getActiveCycleId(creds, cycleId)

      const endDate = await p.text({
        message: 'End date? (YYYY-MM-DD)',
        placeholder: today(),
        defaultValue: today(),
      })

      const spinner = p.spinner()
      spinner.start('Closing cycle...')

      await apiPatch<Cycle>(`/cycles/${id}`, { endDate }, creds.accessToken)

      spinner.stop('Done!')
      console.log(`\n  Cycle closed.\n`)
    } catch (err) {
      handleError(err, 'closing cycle')
    }
  })

// cycle use
cycleCommand
  .command('use <cycleId>')
  .description('Set active cycle')
  .action((cycleId: string) => {
    try {
      setActiveCycle(cycleId)
      console.log(`\n  Active cycle set to ${cycleId}.\n`)
    } catch (err) {
      handleError(err, 'setting active cycle')
    }
  })

// cycle delete
cycleCommand
  .command('delete <cycleId>')
  .description('Delete a cycle')
  .action(async (cycleId: string) => {
    try {
      const confirmed = await p.confirm({
        message: 'Delete this cycle and all its logs?',
      })

      if (!confirmed) {
        p.cancel('Cancelled.')
        return
      }

      const spinner = p.spinner()
      spinner.start('Deleting cycle...')

      await apiDelete(`/cycles/${cycleId}`, requireAuth().accessToken)

      spinner.stop('Done!')
      console.log(`\n  Cycle deleted.\n`)
    } catch (err) {
      handleError(err, 'deleting cycle')
    }
  })

export { cycleCommand }
