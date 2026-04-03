import { describe, it, expect } from 'vitest'
import { getRequestUserId } from '../../shared/utils/requestUser'

describe('getRequestUserId', () => {
  it('should extract user ID from JWT payload', () => {
    const mockReq = {
      user: { sub: 'user-123', type: 'access' },
    } as any

    const userId = getRequestUserId(mockReq)
    expect(userId).toBe('user-123')
  })

  it('should return sub even if type is refresh', () => {
    const mockReq = {
      user: { sub: 'user-456', type: 'refresh' },
    } as any

    const userId = getRequestUserId(mockReq)
    expect(userId).toBe('user-456')
  })
})
