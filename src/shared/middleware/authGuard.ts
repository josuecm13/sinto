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
