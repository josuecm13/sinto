import { describe, it, expect, vi } from 'vitest'
import { authGuard } from '../../shared/middleware/authGuard'

function createMockReply() {
  const reply: any = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  }
  return reply
}

describe('authGuard', () => {
  it('should pass when access token is valid', async () => {
    const req: any = {
      jwtVerify: vi.fn().mockResolvedValue(undefined),
      user: { sub: 'user-1', type: 'access' },
    }
    const reply = createMockReply()

    await authGuard(req, reply)

    expect(reply.status).not.toHaveBeenCalled()
  })

  it('should reject refresh token type with 401', async () => {
    const req: any = {
      jwtVerify: vi.fn().mockResolvedValue(undefined),
      user: { sub: 'user-1', type: 'refresh' },
    }
    const reply = createMockReply()

    await authGuard(req, reply)

    expect(reply.status).toHaveBeenCalledWith(401)
    expect(reply.send).toHaveBeenCalledWith({
      error: 'INVALID_TOKEN',
      message: 'Access token required',
    })
  })

  it('should reject missing/invalid token with 401', async () => {
    const req: any = {
      jwtVerify: vi.fn().mockRejectedValue(new Error('invalid token')),
    }
    const reply = createMockReply()

    await authGuard(req, reply)

    expect(reply.status).toHaveBeenCalledWith(401)
    expect(reply.send).toHaveBeenCalledWith({
      error: 'UNAUTHORIZED',
      message: 'Authentication required',
    })
  })
})
