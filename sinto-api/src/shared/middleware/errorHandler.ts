/**
 * MODULE: errorHandler
 * Global Fastify error handler. Maps AppError and validation errors to consistent JSON responses.
 *
 * Exports: errorHandler
 * Depends on: AppError
 */

import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '../errors/AppError'

export function errorHandler(
  error: FastifyError | AppError | Error,
  _req: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.code ?? 'APP_ERROR',
      message: error.message,
    })
  }

  // Fastify validation errors
  if ('statusCode' in error && error.statusCode === 400) {
    return reply.status(400).send({
      error: 'VALIDATION_ERROR',
      message: error.message,
    })
  }

  console.error(error)
  return reply.status(500).send({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  })
}
