/**
 * MODULE: Log Command Group
 * Commander command group `sinto log`; subcommands: add, list.
 *
 * Endpoints: POST /cycles/:id/logs — add log; GET /cycles/:id/logs — list logs
 *
 * Exports: logCommand
 * Depends on: @clack/prompts, lib/api, lib/credentials, lib/fmt
 */
import { Command } from 'commander'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { apiGet, apiPost } from '../lib/api'
import { requireAuth, getActiveCycleId } from '../lib/credentials'
import { handleError, section, row, formatDate, today } from '../lib/fmt'

interface LogEntry {
  date: string
  temperature?: number
  isMenstruating: boolean
  flowLevel?: string
  color?: string
  consistency?: string
  mood?: string
  mucusType?: string
  mucusQuality?: string
  symptoms?: string[]
}

interface LogsResponse {
  logs: LogEntry[]
}

interface CycleResponse {
  id: string
}

const logCommand = new Command('log').description('Log daily symptoms')

// log add
logCommand
  .command('add')
  .option('--cycle <id>', 'Cycle ID (defaults to active cycle)')
  .action(async (options: { cycle?: string }) => {
    try {
      const creds = requireAuth()
      const cycleId = getActiveCycleId(creds, options.cycle)

      const fields = await p.group(
        {
          date: () =>
            p.text({
              message: 'Date',
              defaultValue: today(),
              validate: (v) => {
                if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
                  return 'Enter date in YYYY-MM-DD format'
                }
                return undefined
              },
            }),
          temperature: () =>
            p.text({
              message: 'Temperature (°C)',
              placeholder: '36.5',
              validate: (v) => {
                if (v === '') return undefined
                const num = parseFloat(v)
                if (isNaN(num) || num < 35.0 || num > 42.0) {
                  return 'Temperature must be between 35.0 and 42.0'
                }
                return undefined
              },
            }),
          isMenstruating: () =>
            p.confirm({
              message: 'Are you menstruating?',
            }),
        },
        { onCancel: () => { p.cancel('Cancelled'); process.exit(0) } },
      )

      if (p.isCancel(fields)) {
        p.cancel('Cancelled')
        process.exit(0)
      }

      let menstruationData = {}
      let nonMenstruationData = {}

      if (fields.isMenstruating) {
        const mensFields = await p.group(
          {
            flowLevel: () =>
              p.select({
                message: 'Flow level',
                options: [
                  { value: 'SPOTTING', label: 'Spotting' },
                  { value: 'LIGHT', label: 'Light' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HEAVY', label: 'Heavy' },
                ],
              }),
            color: () =>
              p.select({
                message: 'Color',
                options: [
                  { value: 'BRIGHT_RED', label: 'Bright red' },
                  { value: 'DARK_RED', label: 'Dark red' },
                  { value: 'PINK', label: 'Pink' },
                  { value: 'BROWN', label: 'Brown' },
                  { value: 'BLACK', label: 'Black' },
                ],
              }),
            consistency: () =>
              p.select({
                message: 'Consistency',
                options: [
                  { value: 'WATERY', label: 'Watery' },
                  { value: 'NORMAL', label: 'Normal' },
                  { value: 'CLOTTY', label: 'Clotty' },
                ],
              }),
          },
          { onCancel: () => { p.cancel('Cancelled'); process.exit(0) } },
        )

        if (p.isCancel(mensFields)) {
          p.cancel('Cancelled')
          process.exit(0)
        }

        menstruationData = mensFields
      } else {
        const nonMensFields = await p.group(
          {
            mood: () =>
              p.select({
                message: 'Mood',
                options: [
                  { value: 'SKIP', label: 'Skip' },
                  { value: 'HAPPY', label: 'Happy' },
                  { value: 'CALM', label: 'Calm' },
                  { value: 'ANXIOUS', label: 'Anxious' },
                  { value: 'IRRITABLE', label: 'Irritable' },
                  { value: 'SAD', label: 'Sad' },
                  { value: 'ENERGETIC', label: 'Energetic' },
                  { value: 'TIRED', label: 'Tired' },
                ],
              }),
            mucusType: () =>
              p.select({
                message: 'Mucus type',
                options: [
                  { value: 'SKIP', label: 'Skip' },
                  { value: 'DRY', label: 'Dry' },
                  { value: 'STICKY', label: 'Sticky' },
                  { value: 'CREAMY', label: 'Creamy' },
                  { value: 'EGG_WHITE', label: 'Egg white' },
                  { value: 'WATERY', label: 'Watery' },
                ],
              }),
            mucusQuality: () =>
              p.select({
                message: 'Mucus quality',
                options: [
                  { value: 'NONE', label: 'None' },
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'PEAK', label: 'Peak' },
                ],
              }),
            symptoms: () =>
              p.multiselect({
                message: 'Symptoms',
                options: [
                  { value: 'NAUSEA', label: 'Nausea' },
                  { value: 'BREAST_PAIN', label: 'Breast pain' },
                  { value: 'HEADACHE', label: 'Headache' },
                  { value: 'CRAMPS', label: 'Cramps' },
                  { value: 'BLOATING', label: 'Bloating' },
                  { value: 'BACKACHE', label: 'Backache' },
                  { value: 'FATIGUE', label: 'Fatigue' },
                  { value: 'ACNE', label: 'Acne' },
                  { value: 'INSOMNIA', label: 'Insomnia' },
                ],
                required: false,
              }),
          },
          { onCancel: () => { p.cancel('Cancelled'); process.exit(0) } },
        )

        if (p.isCancel(nonMensFields)) {
          p.cancel('Cancelled')
          process.exit(0)
        }

        nonMenstruationData = {
          mood: nonMensFields.mood === 'SKIP' ? undefined : nonMensFields.mood,
          mucusType: nonMensFields.mucusType === 'SKIP' ? undefined : nonMensFields.mucusType,
          mucusQuality: nonMensFields.mucusQuality,
          symptoms: nonMensFields.symptoms.length > 0 ? nonMensFields.symptoms : undefined,
        }
      }

      const body: LogEntry = {
        date: fields.date,
        temperature: fields.temperature ? parseFloat(fields.temperature) : undefined,
        isMenstruating: fields.isMenstruating,
        ...(fields.isMenstruating ? menstruationData : nonMenstruationData),
      }

      const spinner = p.spinner()
      spinner.start('Saving log...')

      await apiPost(`/cycles/${cycleId}/logs`, body, creds.accessToken)

      spinner.stop('Done!')
      console.log(`\n  Log saved for ${fields.date}\n`)
    } catch (err) {
      handleError(err, 'saving log')
    }
  })

// log list
logCommand
  .command('list')
  .option('--cycle <id>', 'Cycle ID (defaults to active cycle)')
  .action(async (options: { cycle?: string }) => {
    try {
      const creds = requireAuth()
      const cycleId = getActiveCycleId(creds, options.cycle)

      const spinner = p.spinner()
      spinner.start('Fetching logs...')

      const { logs } = await apiGet<LogsResponse>(`/cycles/${cycleId}/logs`, creds.accessToken)

      spinner.stop('Done!')

      if (logs.length === 0) {
        console.log('\n  No logs for this cycle yet.\n')
        return
      }

      section('Logs')
      console.log(`  ${'DATE'.padEnd(12)} ${'TEMP'.padEnd(8)} ${'MENST'.padEnd(8)} ${'MOOD'.padEnd(12)} MUCUS`)
      console.log(`  ${pc.dim('─'.repeat(60))}`)

      logs.forEach((log) => {
        const dateStr = formatDate(log.date).padEnd(12)
        const tempStr = log.temperature ? `${log.temperature}°C`.padEnd(8) : ''.padEnd(8)
        const menstrStr = log.isMenstruating ? '🩸'.padEnd(8) : ''.padEnd(8)
        const moodStr = log.mood ? log.mood.padEnd(12) : ''.padEnd(12)
        const mucusStr = log.mucusType || ''

        console.log(`  ${dateStr} ${tempStr} ${menstrStr} ${moodStr} ${mucusStr}`)
      })
      console.log()
    } catch (err) {
      handleError(err, 'fetching logs')
    }
  })

export { logCommand }
