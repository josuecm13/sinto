import { FastifyInstance } from 'fastify'
import { Phase } from '@prisma/client'
import { authGuard } from '../../shared/middleware/authGuard'
import { getRequestUserId } from '../../shared/utils/requestUser'
import { AppError } from '../../shared/errors/AppError'
import * as phasesService from './phases.service'

export async function phasesRoutes(app: FastifyInstance) {
  // GET /phases - Public route, returns phase list
  app.get('/phases', async (req, reply) => {
    const locale = (req.query as { locale?: string }).locale ?? 'es'
    const result = await phasesService.listPhases(locale)
    return reply.send(result)
  })

  // GET /phases/current - Protected route, must be before /:phase
  app.get('/phases/current', { preHandler: authGuard }, async (req, reply) => {
    const userId = getRequestUserId(req)
    const { cycleId } = req.query as { cycleId?: string }

    if (!cycleId) {
      throw new AppError('cycleId query parameter is required', 400, 'MISSING_CYCLE_ID')
    }

    const { phase, cycleDay } = await phasesService.getCurrentPhase(userId, cycleId)
    const phaseContent = await phasesService.getPhaseContent(phase)

    return reply.send({
      phase,
      cycleDay,
      content: phaseContent.content,
    })
  })

  // GET /phases/:phase - Public route, returns full phase content
  app.get('/phases/:phase', async (req, reply) => {
    const { phase: phaseParam } = req.params as { phase: string }
    const locale = (req.query as { locale?: string }).locale ?? 'es'

    // Convert to uppercase and validate
    const upperPhase = phaseParam.toUpperCase()
    const validPhases: Phase[] = ['MENSTRUAL', 'FOLLICULAR', 'OVULATORY', 'LUTEAL']

    if (!validPhases.includes(upperPhase as Phase)) {
      throw new AppError('Invalid phase', 404, 'INVALID_PHASE')
    }

    const result = await phasesService.getPhaseContent(upperPhase as Phase, locale)
    return reply.send(result)
  })
}
