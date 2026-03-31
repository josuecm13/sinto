import { FastifyRequest } from 'fastify'

export function getRequestUserId(req: FastifyRequest): string {
  const payload = req.user as { sub: string }
  return payload.sub
}
