import { FastifyInstance } from 'fastify'
import { registerSchema, loginSchema, refreshSchema } from './auth.schema'
import * as authService from './auth.service'

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (req, reply) => {
    const input = registerSchema.parse(req.body)
    const result = await authService.registerUser(app, input)
    return reply.status(201).send(result)
  })

  app.post('/auth/login', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (req, reply) => {
    const input = loginSchema.parse(req.body)
    const result = await authService.loginUser(app, input)
    return reply.send(result)
  })

  app.post('/auth/refresh', async (req, reply) => {
    const { refreshToken } = refreshSchema.parse(req.body)
    const result = await authService.refreshTokens(app, refreshToken)
    return reply.send(result)
  })

  app.post('/auth/logout', async (req, reply) => {
    const { refreshToken } = refreshSchema.parse(req.body)
    await authService.logoutUser(app, refreshToken)
    return reply.status(204).send()
  })
}
