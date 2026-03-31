import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { updateNotificationPrefsSchema, registerDeviceSchema } from './notifications.schema'
import * as notificationsService from './notifications.service'
import { getRequestUserId } from '../../shared/utils/requestUser'
import { authGuard } from '../../shared/middleware/authGuard'

export async function notificationsRoutes(app: FastifyInstance) {
  app.patch<{ Body: unknown }>(
    '/users/me/notifications',
    { preHandler: authGuard },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const input = updateNotificationPrefsSchema.parse(req.body)
      const userId = getRequestUserId(req)
      const result = await notificationsService.updatePreferences(userId, input)
      return reply.send(result)
    },
  )

  app.get(
    '/users/me/devices',
    { preHandler: authGuard },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const userId = getRequestUserId(req)
      const result = await notificationsService.listDevices(userId)
      return reply.send(result)
    },
  )

  app.post<{ Body: unknown }>(
    '/users/me/devices',
    { preHandler: authGuard },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const input = registerDeviceSchema.parse(req.body)
      const userId = getRequestUserId(req)
      const result = await notificationsService.registerDevice(userId, input)
      return reply.status(201).send(result)
    },
  )

  app.delete<{ Params: { token: string } }>(
    '/users/me/devices/:token',
    { preHandler: authGuard },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { token } = req.params as { token: string }
      const userId = getRequestUserId(req)
      await notificationsService.removeDevice(userId, token)
      return reply.status(204).send()
    },
  )
}
