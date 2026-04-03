import { describe, it, expect } from 'vitest'

// Placeholder skipped integration test for phases endpoints. Run against Docker test DB.

describe.skip('phases e2e tests (placeholder)', () => {
  it('placeholder smoke test - health endpoint', async () => {
    const { buildApp } = await import('../../app')
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/health' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ status: 'ok' })
  })
})
