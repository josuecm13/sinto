/**
 * MODULE: Daily log routes
 * Endpoints: POST /cycles/:cycleId/logs, GET /cycles/:cycleId/logs, GET /cycles/:cycleId/logs/:logId, PATCH /cycles/:cycleId/logs/:logId
 * All protected by authGuard. Depends on: logs.service
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { createLogSchema, updateLogSchema } from './logs.schema'
import * as logsService from './logs.service'
import { getRequestUserId } from '../../shared/utils/requestUser'
import { authGuard } from '../../shared/middleware/authGuard'

export async function logsRoutes(app: FastifyInstance) {
  app.post<{ Params: { cycleId: string }; Body: unknown }>(
    '/cycles/:cycleId/logs',
    { preHandler: authGuard },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const input = createLogSchema.parse(req.body)
      const userId = getRequestUserId(req)
      const { cycleId } = req.params as { cycleId: string }
      const result = await logsService.createLog(userId, cycleId, input)
      return reply.status(201).send(result)
    },
  )

  app.get<{ Params: { cycleId: string } }>(
    '/cycles/:cycleId/logs',
    { preHandler: authGuard },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const userId = getRequestUserId(req)
      const { cycleId } = req.params as { cycleId: string }
      const result = await logsService.listLogs(userId, cycleId)
      return reply.send(result)
    },
  )

  app.get<{ Params: { cycleId: string; logId: string } }>(
    '/cycles/:cycleId/logs/:logId',
    { preHandler: authGuard },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const userId = getRequestUserId(req)
      const { cycleId, logId } = req.params as { cycleId: string; logId: string }
      const result = await logsService.getLog(userId, cycleId, logId)
      return reply.send(result)
    },
  )

  app.patch<{ Params: { cycleId: string; logId: string }; Body: unknown }>(
    '/cycles/:cycleId/logs/:logId',
    { preHandler: authGuard },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const input = updateLogSchema.parse(req.body)
      const userId = getRequestUserId(req)
      const { cycleId, logId } = req.params as { cycleId: string; logId: string }
      const result = await logsService.updateLog(userId, cycleId, logId, input)
      return reply.send(result)
    },
  )
}
