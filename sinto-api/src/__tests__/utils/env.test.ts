import { describe, it, expect } from 'vitest'

/**
 * Tests for the env validation schema logic.
 * We test the Zod schema directly rather than the module-level singleton
 * (which calls process.exit on failure).
 */
import { z } from 'zod'

// Replicate the schema from config/env.ts
const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
})

describe('env schema validation', () => {
  const validEnv = {
    PORT: '3000',
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    REDIS_URL: 'redis://localhost:6379',
    JWT_SECRET: 'a-secret-at-least-16-chars',
    JWT_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY: '7d',
  }

  it('should parse valid environment variables', () => {
    const result = envSchema.safeParse(validEnv)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.PORT).toBe(3000)
      expect(result.data.NODE_ENV).toBe('test')
    }
  })

  it('should coerce PORT from string to number', () => {
    const result = envSchema.safeParse({ ...validEnv, PORT: '8080' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.PORT).toBe(8080)
    }
  })

  it('should default PORT to 3000', () => {
    const { PORT, ...envWithoutPort } = validEnv
    const result = envSchema.safeParse(envWithoutPort)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.PORT).toBe(3000)
    }
  })

  it('should reject invalid DATABASE_URL', () => {
    const result = envSchema.safeParse({ ...validEnv, DATABASE_URL: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('should reject JWT_SECRET shorter than 16 chars', () => {
    const result = envSchema.safeParse({ ...validEnv, JWT_SECRET: 'short' })
    expect(result.success).toBe(false)
  })

  it('should reject invalid NODE_ENV', () => {
    const result = envSchema.safeParse({ ...validEnv, NODE_ENV: 'staging' })
    expect(result.success).toBe(false)
  })

  it('should default NODE_ENV to development', () => {
    const { NODE_ENV, ...envWithoutNodeEnv } = validEnv
    const result = envSchema.safeParse(envWithoutNodeEnv)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.NODE_ENV).toBe('development')
    }
  })
})
