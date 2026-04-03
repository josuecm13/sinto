import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { execSync } from 'child_process'
import { setupTestEnvironment } from './setup'

let app: any
let stopFn: (() => Promise<void>) | undefined

// Quick check for docker availability; if Docker isn't present, skip entire suite.
let dockerAvailable = true
try {
  execSync('docker --version', { stdio: 'ignore' })
} catch (err) {
  dockerAvailable = false
}

if (!dockerAvailable) {
  describe.skip('e2e auth', () => {
    it('skipped because docker not available', () => {
      expect(true).toBe(true)
    })
  })
} else {
  describe('e2e auth', () => {
    beforeAll(async () => {
      const env = await setupTestEnvironment()
      app = env.app
      stopFn = env.stop
    })

    afterAll(async () => {
      if (stopFn) await stopFn()
    })

    it('should register a new user, login, refresh tokens, and logout', async () => {
      const unique = Date.now()
      const email = `e2e+${unique}@example.com`
      const password = 'Password123!'

      // Register
      const resRegister = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { email, name: 'E2E Test', password, username: `u${unique}` },
      })
      expect(resRegister.statusCode).toBe(201)
      const bodyRegister = resRegister.json()
      expect(bodyRegister).toHaveProperty('user')
      expect(bodyRegister).toHaveProperty('accessToken')
      expect(bodyRegister).toHaveProperty('refreshToken')

      const { accessToken, refreshToken } = bodyRegister

      // Login
      const resLogin = await app.inject({ method: 'POST', url: '/auth/login', payload: { email, password } })
      expect(resLogin.statusCode).toBe(200)
      const bodyLogin = resLogin.json()
      expect(bodyLogin).toHaveProperty('accessToken')
      expect(bodyLogin).toHaveProperty('refreshToken')

      // Refresh
      const resRefresh = await app.inject({ method: 'POST', url: '/auth/refresh', payload: { refreshToken } })
      expect(resRefresh.statusCode).toBe(200)
      const bodyRefresh = resRefresh.json()
      expect(bodyRefresh).toHaveProperty('accessToken')
      expect(bodyRefresh).toHaveProperty('refreshToken')

      // Logout
      const resLogout = await app.inject({ method: 'POST', url: '/auth/logout', payload: { refreshToken } })
      expect(resLogout.statusCode).toBe(204)

      // Refresh after logout should fail
      const resRefreshAfter = await app.inject({ method: 'POST', url: '/auth/refresh', payload: { refreshToken } })
      expect(resRefreshAfter.statusCode).toBeGreaterThanOrEqual(401)
    })
  })
}
