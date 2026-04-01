/**
 * MODULE: Cycles routes
 * Endpoints: POST /cycles, GET /cycles, GET /cycles/:cycleId, PATCH /cycles/:cycleId, DELETE /cycles/:cycleId
 * All routes protected by authGuard. Depends on: cycles.service
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { createCycleSchema, updateCycleSchema } from './cycles.schema'
import * as cyclesService from './cycles.service'
import { getRequestUserId } from '../../shared/utils/requestUser'
import { authGuard } from '../../shared/middleware/authGuard'

export async function cyclesRoutes(app: FastifyInstance) {
  app.post<{ Body: unknown }>(
    '/cycles',
    { preHandler: authGuard },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const input = createCycleSchema.parse(req.body)
      const userId = getRequestUserId(req)
      const result = await cyclesService.createCycle(userId, input)
      return reply.status(201).send(result)
    },
  )

  app.get<{ Params: unknown }>(
    '/cycles',
    { preHandler: authGuard },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const userId = getRequestUserId(req)
      const result = await cyclesService.listCycles(userId)
      return reply.send(result)
    },
  )

  app.get<{ Params: { cycleId: string } }>(
    '/cycles/:cycleId',
    { preHandler: authGuard },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const userId = getRequestUserId(req)
      const { cycleId } = req.params as { cycleId: string }
      const result = await cyclesService.getCycle(userId, cycleId)
      return reply.send(result)
    },
  )

  app.patch<{ Params: { cycleId: string }; Body: unknown }>(
    '/cycles/:cycleId',
    { preHandler: authGuard },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const input = updateCycleSchema.parse(req.body)
      const userId = getRequestUserId(req)
      const { cycleId } = req.params as { cycleId: string }
      const result = await cyclesService.updateCycle(userId, cycleId, input)
      return reply.send(result)
    },
  )

  app.delete<{ Params: { cycleId: string } }>(
    '/cycles/:cycleId',
    { preHandler: authGuard },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const userId = getRequestUserId(req)
      const { cycleId } = req.params as { cycleId: string }
      await cyclesService.deleteCycle(userId, cycleId)
      return reply.status(204).send()
    },
  )
}
