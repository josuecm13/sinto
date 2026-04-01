/**
 * MODULE: Request user helper
 * Extracts the authenticated user ID from a verified JWT payload on a Fastify request.
 *
 * Exports: getRequestUserId(req) → string
 * Depends on: authGuard (must run first)
 */

import { FastifyRequest } from 'fastify'

export function getRequestUserId(req: FastifyRequest): string {
  const payload = req.user as { sub: string }
  return payload.sub
}
