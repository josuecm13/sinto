/**
 * MODULE: Users routes
 * Endpoints: GET /users/me (protected), PATCH /users/me (protected), GET /users/:username/profile (public)
 * Depends on: users.service
 */

import { FastifyInstance } from 'fastify'
import { updateProfileSchema } from './users.schema'
import * as usersService from './users.service'
import { getRequestUserId } from '../../shared/utils/requestUser'
import { authGuard } from '../../shared/middleware/authGuard'

export async function usersRoutes(app: FastifyInstance) {
  // GET /users/me - Protected route
  app.get('/users/me', { preHandler: authGuard }, async (req, reply) => {
    const userId = getRequestUserId(req)
    const user = await usersService.getMe(userId)
    return reply.send(user)
  })

  // PATCH /users/me - Protected route
  app.patch('/users/me', { preHandler: authGuard }, async (req, reply) => {
    const userId = getRequestUserId(req)
    const input = updateProfileSchema.parse(req.body)
    const updatedUser = await usersService.updateMe(userId, input)
    return reply.send(updatedUser)
  })

  // GET /users/:username/profile - Public route
  app.get('/users/:username/profile', async (req, reply) => {
    const { username } = req.params as { username: string }
    const profile = await usersService.getPublicProfile(username)
    return reply.send(profile)
  })
}
