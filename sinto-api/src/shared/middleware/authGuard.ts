/**
 * MODULE: authGuard
 * Fastify preHandler that verifies the JWT access token. Attach as `preHandler` on any protected route.
 *
 * Exports: authGuard
 * Depends on: @fastify/jwt
 */

import { FastifyRequest, FastifyReply } from 'fastify'

export async function authGuard(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
    const payload = req.user as { sub: string; type: string }
    if (payload.type !== 'access') {
      return reply.status(401).send({ error: 'INVALID_TOKEN', message: 'Access token required' })
    }
  } catch {
    return reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Authentication required' })
  }
}
