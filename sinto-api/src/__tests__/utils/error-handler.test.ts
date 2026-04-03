import { describe, it, expect, vi } from 'vitest'
import { errorHandler } from '../../shared/middleware/errorHandler'
import { AppError } from '../../shared/errors/AppError'

function createMockReply() {
  const reply: any = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  }
  return reply
}

function createMockRequest() {
  return {} as any
}

describe('errorHandler', () => {
  it('should handle AppError with correct status and code', () => {
    const reply = createMockReply()
    const error = new AppError('Not found', 404, 'NOT_FOUND')

    errorHandler(error, createMockRequest(), reply)

    expect(reply.status).toHaveBeenCalledWith(404)
    expect(reply.send).toHaveBeenCalledWith({
      error: 'NOT_FOUND',
      message: 'Not found',
    })
  })

  it('should use APP_ERROR when AppError has no code', () => {
    const reply = createMockReply()
    const error = new AppError('Something wrong', 400)

    errorHandler(error, createMockRequest(), reply)

    expect(reply.status).toHaveBeenCalledWith(400)
    expect(reply.send).toHaveBeenCalledWith({
      error: 'APP_ERROR',
      message: 'Something wrong',
    })
  })

  it('should handle Fastify validation errors (statusCode 400)', () => {
    const reply = createMockReply()
    const error = { statusCode: 400, message: 'body must have required property "email"' } as any

    errorHandler(error, createMockRequest(), reply)

    expect(reply.status).toHaveBeenCalledWith(400)
    expect(reply.send).toHaveBeenCalledWith({
      error: 'VALIDATION_ERROR',
      message: 'body must have required property "email"',
    })
  })

  it('should handle unknown errors as 500', () => {
    const reply = createMockReply()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('unexpected')

    errorHandler(error, createMockRequest(), reply)

    expect(reply.status).toHaveBeenCalledWith(500)
    expect(reply.send).toHaveBeenCalledWith({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    })
    consoleError.mockRestore()
  })
})
