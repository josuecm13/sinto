/**
 * MODULE: Phase Command
 * Commander command `sinto phase [name]`; shows current phase or guide for named phase.
 *
 * Endpoints: GET /phases/:name — retrieve phase info; GET /phases/current — retrieve current phase info
 *
 * Exports: phaseCommand
 * Depends on: @clack/prompts, lib/api, lib/credentials, lib/fmt
 */
import { Command } from 'commander'
import pc from 'picocolors'
import { apiGet } from '../lib/api'
import { requireAuth, getActiveCycleId } from '../lib/credentials'
import { handleError, section, formatPhase } from '../lib/fmt'

interface PhaseContent {
  title: string
  body: string
}

interface ContentItem {
  title: string
  body: string
  category: string
}

interface PhaseResponse {
  phase: string
  content: Record<string, ContentItem[]>
}

interface CurrentPhaseResponse {
  phase: string
  cycleDay: number
  content: Record<string, ContentItem[]>
}

function wrapText(text: string, width: number = 60): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  words.forEach((word) => {
    if ((currentLine + word).length > width) {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = currentLine ? `${currentLine} ${word}` : word
    }
  })

  if (currentLine) lines.push(currentLine)
  return lines
}

const phaseCommand = new Command('phase').description('View phase info')

phaseCommand
  .argument('[name]', 'Phase name: menstrual, follicular, ovulatory, luteal')
  .option('--cycle <id>', 'Cycle ID (for current phase lookup)')
  .action(async (name?: string, options?: { cycle?: string }) => {
    try {
      let response: PhaseResponse | CurrentPhaseResponse
      let phaseName: string
      let cycleDay: number | undefined

      if (name) {
        const phaseMap: Record<string, string> = {
          menstrual: 'MENSTRUAL',
          follicular: 'FOLLICULAR',
          ovulatory: 'OVULATORY',
          luteal: 'LUTEAL',
        }

        const mappedName = phaseMap[name.toLowerCase()]
        if (!mappedName) {
          console.error(
            `\n  ${pc.red('✖')} Unknown phase. Use: menstrual, follicular, ovulatory, or luteal\n`,
          )
          process.exit(1)
        }

        response = await apiGet<PhaseResponse>(`/phases/${mappedName}`)
        phaseName = mappedName
      } else {
        const creds = requireAuth()
        const cycleId = getActiveCycleId(creds, options?.cycle)

        response = await apiGet<CurrentPhaseResponse>(
          `/phases/current?cycleId=${cycleId}`,
          creds.accessToken,
        )

        phaseName = (response as CurrentPhaseResponse).phase
        cycleDay = (response as CurrentPhaseResponse).cycleDay

        console.log()
        console.log(`  Day ${cycleDay} of cycle — ${formatPhase(phaseName)}`)
      }

      section(`Fase: ${phaseName}`)

      const contentMap = response.content || {}
      const categoryOrder = ['GENERAL', 'EXERCISE', 'NUTRITION', 'TIPS', 'DANGERS']
      categoryOrder.forEach((cat) => {
        const items = contentMap[cat]
        if (!items?.length) return
        console.log()
        console.log(`  ${pc.bold(cat)}`)
        items.forEach((item) => {
          console.log(`  ${pc.cyan('▸')} ${item.title}`)
          const wrappedLines = wrapText(item.body, 60)
          wrappedLines.forEach((line) => {
            console.log(`    ${pc.dim(line)}`)
          })
        })
      })

      console.log()
    } catch (err) {
      handleError(err, 'fetching phase info')
    }
  })

export { phaseCommand }
