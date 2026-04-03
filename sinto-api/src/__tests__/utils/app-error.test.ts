import { describe, it, expect } from 'vitest'
import { AppError } from '../../shared/errors/AppError'

describe('AppError', () => {
  it('should create an error with message, statusCode, and code', () => {
    const err = new AppError('Not found', 404, 'NOT_FOUND')

    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(AppError)
    expect(err.message).toBe('Not found')
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
    expect(err.name).toBe('AppError')
  })

  it('should default statusCode to 400', () => {
    const err = new AppError('Bad request')

    expect(err.statusCode).toBe(400)
    expect(err.code).toBeUndefined()
  })

  it('should be catchable as Error', () => {
    try {
      throw new AppError('test', 500, 'INTERNAL')
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
      expect((e as AppError).statusCode).toBe(500)
    }
  })
})
