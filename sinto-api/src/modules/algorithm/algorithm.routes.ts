/**
 * MODULE: Algorithm routes
 * Endpoints: GET /cycles/:cycleId/prediction (protected)
 * Returns fertile window, ovulation estimate, and daily pregnancy probability.
 * Depends on: algorithm.service
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authGuard } from '../../shared/middleware/authGuard'
import { getRequestUserId } from '../../shared/utils/requestUser'
import * as algorithmService from './algorithm.service'

export async function algorithmRoutes(app: FastifyInstance) {
  app.get<{ Params: { cycleId: string } }>(
    '/cycles/:cycleId/prediction',
    { preHandler: authGuard },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const userId = getRequestUserId(req)
      const { cycleId } = req.params as { cycleId: string }
      const result = await algorithmService.getCyclePrediction(userId, cycleId)
      return reply.send(result)
    },
  )
}
