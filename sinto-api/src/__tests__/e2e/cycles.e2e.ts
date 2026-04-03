import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { execSync } from 'child_process'
import { setupTestEnvironment } from './setup'

let app: any
let stopFn: (() => Promise<void>) | undefined

let dockerAvailable = true
try {
  execSync('docker --version', { stdio: 'ignore' })
} catch (err) {
  dockerAvailable = false
}

if (!dockerAvailable) {
  describe.skip('e2e cycles', () => {
    it('skipped because docker not available', () => {
      expect(true).toBe(true)
    })
  })
} else {
  describe('e2e cycles', () => {
    beforeAll(async () => {
      const env = await setupTestEnvironment()
      app = env.app
      stopFn = env.stop
    })

    afterAll(async () => {
      if (stopFn) await stopFn()
    })

    it('should perform cycles CRUD lifecycle', async () => {
      const unique = Date.now()
      const email = `e2e+${unique}@example.com`
      const password = 'Password123!'

      // Register user
      const resRegister = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { email, name: 'E2E Cycle', password, username: `u${unique}` },
      })
      expect(resRegister.statusCode).toBe(201)
      const body = resRegister.json()
      const accessToken = body.accessToken

      // Create cycle
      const resCreate = await app.inject({
        method: 'POST',
        url: '/cycles',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: { startDate: '2026-01-01' },
      })
      expect(resCreate.statusCode).toBe(201)
      const created = resCreate.json()
      expect(created).toHaveProperty('id')

      const cycleId = created.id

      // Get cycles list
      const resList = await app.inject({ method: 'GET', url: '/cycles', headers: { authorization: `Bearer ${accessToken}` } })
      expect(resList.statusCode).toBe(200)
      const list = resList.json()
      expect(Array.isArray(list)).toBe(true)
      expect(list.length).toBeGreaterThanOrEqual(1)

      // Get cycle by id
      const resGet = await app.inject({ method: 'GET', url: `/cycles/${cycleId}`, headers: { authorization: `Bearer ${accessToken}` } })
      expect(resGet.statusCode).toBe(200)
      const got = resGet.json()
      expect(got.id).toBe(cycleId)

      // Update cycle
      const resPatch = await app.inject({ method: 'PATCH', url: `/cycles/${cycleId}`, headers: { authorization: `Bearer ${accessToken}` }, payload: { cycleLength: 28 } })
      expect(resPatch.statusCode).toBe(200)
      const patched = resPatch.json()
      expect(patched.cycleLength).toBe(28)

      // Delete cycle
      const resDelete = await app.inject({ method: 'DELETE', url: `/cycles/${cycleId}`, headers: { authorization: `Bearer ${accessToken}` } })
      expect(resDelete.statusCode).toBe(204)

      // Confirm deletion
      const resGetAfter = await app.inject({ method: 'GET', url: `/cycles/${cycleId}`, headers: { authorization: `Bearer ${accessToken}` } })
      expect(resGetAfter.statusCode).toBeGreaterThanOrEqual(400)
    })

    it('should return 401 for protected routes when unauthenticated', async () => {
      const res = await app.inject({ method: 'GET', url: '/cycles' })
      expect(res.statusCode).toBe(401)
    })
  })
}
