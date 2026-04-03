/**
 * Deterministic token and crypto generators for tests.
 * Ensures reproducible test runs by providing fixed tokens and hashes.
 */

/** Pre-computed bcrypt hash for "password123" with cost 12 */
export const HASHED_PASSWORD = '$2a$12$LJ3m4ys3Lk0TSwHkfE0dHeHi6R1ZtEfMcvtzVTFJE4fASN1oZbPmS'

/** Raw password that matches HASHED_PASSWORD */
export const RAW_PASSWORD = 'password123'

/** A second password for change-password tests */
export const RAW_PASSWORD_2 = 'newPassword456!'

/** Deterministic JWT-like tokens for mocking */
export const MOCK_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItY2x4eHh4eHh4eHh4eHh4eHh4eCIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3MDQwNjcyMDB9.mock-signature'
export const MOCK_REFRESH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItY2x4eHh4eHh4eHh4eHh4eHh4eCIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzA0MDY3MjAwfQ.mock-signature'
export const MOCK_EXPIRED_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJ0eXBlIjoiYWNjZXNzIiwiZXhwIjoxfQ.mock-expired'

/** Deterministic JWT secret for test Fastify instances */
export const TEST_JWT_SECRET = 'test-jwt-secret-at-least-16-chars-long'

/** Generates a deterministic mock token with a given prefix */
export function mockToken(prefix: string, index: number = 0): string {
  return `mock-${prefix}-token-${index}-${Date.now()}`
}

/** Generates a deterministic user ID */
export function mockUserId(index: number = 0): string {
  return `test-user-${index}-cl${'x'.repeat(20)}`
}

/** Generates a deterministic cycle ID */
export function mockCycleId(index: number = 0): string {
  return `test-cycle-${index}-cl${'z'.repeat(18)}`
}
