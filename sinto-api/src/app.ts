/**
 * MODULE: App factory
 * Builds and configures the Fastify instance: registers plugins (JWT, CORS, helmet, rate-limit, swagger) and all route modules.
 *
 * Exports: buildApp
 * Depends on: all route modules, errorHandler, env
 */

import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { env } from './config/env'
import { redis } from './shared/utils/redis'
import { errorHandler } from './shared/middleware/errorHandler'
import { authRoutes } from './modules/auth/auth.routes'
import { cyclesRoutes } from './modules/cycles/cycles.routes'
import { logsRoutes } from './modules/logs/logs.routes'
import { phasesRoutes } from './modules/phases/phases.routes'
import { usersRoutes } from './modules/users/users.routes'
import { notificationsRoutes } from './modules/notifications/notifications.routes'
import { algorithmRoutes } from './modules/algorithm/algorithm.routes'

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'test' ? 'silent' : 'info',
    },
  })

  // Plugins
  app.register(helmet)
  app.register(cors, { origin: true })
  app.register(jwt, { secret: env.JWT_SECRET })
  app.register(rateLimit, {
    global: false,
    redis,
    max: 100,
    timeWindow: '1 minute',
  })
  app.register(swagger, {
    openapi: {
      info: {
        title: 'Sinto App API',
        description: 'Backend API for the Sintotérmico cycle tracking app',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  })
  app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list' },
  })

  // Routes
  app.register(authRoutes)
  app.register(cyclesRoutes)
  app.register(logsRoutes)
  app.register(phasesRoutes)
  app.register(usersRoutes)
  app.register(notificationsRoutes)
  app.register(algorithmRoutes)

  // Health check
  app.get('/health', async () => ({ status: 'ok' }))
  app.get('/ready', async () => ({ status: 'ready' }))

  // Global error handler
  app.setErrorHandler(errorHandler)

  return app
}
