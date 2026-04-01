/**
 * MODULE: Cycle Flow
 * Interactive cycle management flow: list, start, show, close, use, and delete cycles.
 *
 * Endpoints: GET /cycles — list cycles; POST /cycles — start cycle; PATCH /cycles/:id — close cycle
 *
 * Exports: cycleFlow
 * Depends on: @clack/prompts, picocolors, lib/api, lib/credentials, lib/fmt
 */
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { apiGet, apiPost, apiPatch } from '../../lib/api'
import { requireAuth, getActiveCycleId, setActiveCycle } from '../../lib/credentials'
import { handleError, formatDate, today } from '../../lib/fmt'
import { setState } from '../state'

interface Cycle {
  id: string
  startDate: string
  endDate: string | null
  cycleLength: number | null
  logsCount: number
}

export async function cycleFlow() {
  const creds = requireAuth()

  const action = await p.select({
    message: pc.bold('Ciclos'),
    options: [
      { value: 'list', label: 'Ver mis ciclos' },
      { value: 'start', label: 'Iniciar nuevo ciclo' },
      { value: 'close', label: 'Cerrar ciclo activo' },
      { value: 'back', label: pc.dim('← Volver') },
    ],
  })

  if (p.isCancel(action) || action === 'back') return

  if (action === 'list') {
    const spinner = p.spinner()
    spinner.start('Cargando ciclos...')
    try {
      const cycles = await apiGet<Cycle[]>('/cycles', creds.accessToken)
      spinner.stop('')
      if (!cycles.length) {
        console.log(`\n  ${pc.dim('No hay ciclos todavía.')}\n`)
        return
      }
      console.log()
      cycles.forEach((c, i) => {
        const start = formatDate(c.startDate)
        const end = c.endDate ? formatDate(c.endDate) : pc.cyan('presente')
        const active = c.id === creds.activeCycleId ? ` ${pc.bgCyan(pc.black(' ACTIVO '))}` : ''
        const logs = pc.dim(`${c.logsCount} registros`)
        console.log(`  ${pc.dim(`${i + 1}.`)} ${start} → ${end}${active}  ${logs}`)
      })
      console.log()

      const pick = await p.select({
        message: 'Seleccionar ciclo activo',
        options: [
          ...cycles.map((c, i) => ({
            value: c.id,
            label: `${i + 1}. ${formatDate(c.startDate)}`,
          })),
          { value: 'back', label: pc.dim('← Sin cambios') },
        ],
      })

      if (!p.isCancel(pick) && pick !== 'back') {
        setActiveCycle(pick as string)
        setState({ activeCycleId: pick as string })
        p.outro(pc.green('✓ Ciclo activo actualizado'))
      }
    } catch (err) {
      spinner.stop('Error')
      handleError(err, 'cargar ciclos')
    }
  }

  if (action === 'start') {
    const startDate = await p.text({
      message: 'Fecha de inicio',
      initialValue: today(),
      validate: (v) => (!/^\d{4}-\d{2}-\d{2}$/.test(v) ? 'Formato: YYYY-MM-DD' : undefined),
    })
    if (p.isCancel(startDate)) return

    const spinner = p.spinner()
    spinner.start('Creando ciclo...')
    try {
      const cycle = await apiPost<Cycle>('/cycles', { startDate }, creds.accessToken)
      setActiveCycle(cycle.id)
      setState({ activeCycleId: cycle.id, cycleDay: 1 })
      spinner.stop('')
      p.outro(pc.green(`✓ Ciclo iniciado el ${formatDate(cycle.startDate)}`))
    } catch (err) {
      spinner.stop('Error')
      handleError(err, 'crear ciclo')
    }
  }

  if (action === 'close') {
    const cycleId = getActiveCycleId(creds)
    const endDate = await p.text({
      message: 'Fecha de cierre',
      initialValue: today(),
      validate: (v) => (!/^\d{4}-\d{2}-\d{2}$/.test(v) ? 'Formato: YYYY-MM-DD' : undefined),
    })
    if (p.isCancel(endDate)) return

    const spinner = p.spinner()
    spinner.start('Cerrando ciclo...')
    try {
      await apiPatch(`/cycles/${cycleId}`, { endDate }, creds.accessToken)
      setState({ phase: null, cycleDay: null })
      spinner.stop('')
      p.outro(pc.green('✓ Ciclo cerrado'))
    } catch (err) {
      spinner.stop('Error')
      handleError(err, 'cerrar ciclo')
    }
  }
}
