import { describe, it, expect } from 'vitest'
import { buildApp } from '../../../app'

// Integration tests require a Docker-backed test DB and Redis. Placeholder test is skipped
// to avoid introducing flaky CI dependencies. Replace describe.skip with describe when
// running against a configured test environment.

describe.skip('auth e2e tests (placeholder)', () => {
  it('placeholder test - PR adds integration tests to be run against Docker test DB', async () => {
    const app = buildApp()
    // smoke: health endpoint works
    const res = await app.inject({ method: 'GET', url: '/health' })
    expect(res.statusCode).toBe(200)
    const body = res.json() as any
    expect(body).toEqual({ status: 'ok' })
  })
})
