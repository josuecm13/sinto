import nock from 'nock'
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'

import { useNodeFetchForNock, setupNock, teardownNock } from './setup'
import { AUTH_RESPONSES, ME_RESPONSE, CYCLE_RESPONSES, LOG_RESPONSES, PREDICTION_RESPONSE, PHASE_RESPONSES } from '../../test-fixtures/api-responses'
import * as credsModule from '../lib/credentials'

// Commands
import { loginCommand } from '../commands/login'
import { meCommand } from '../commands/me'
import { cycleCommand } from '../commands/cycle'
import { logCommand } from '../commands/log'
import { predictCommand } from '../commands/predict'
import { phaseCommand } from '../commands/phase'

// Ensure fetch is node-fetch so nock can intercept
useNodeFetchForNock()

beforeAll(() => {
  setupNock()
})

afterAll(() => {
  teardownNock()
})

describe('CLI integration (mocked API)', () => {
  it('login command (non-interactive) saves credentials', async () => {
    // Stub saveCredentials to avoid writing to disk
    const saveSpy = vi.spyOn(credsModule, 'saveCredentials').mockImplementation(() => undefined as any)

    nock('http://localhost:3000')
      .post('/auth/login', { email: 'test@example.com', password: 'password' })
      .reply(200, AUTH_RESPONSES.login)

    await loginCommand.parseAsync(['login', '--email', 'test@example.com', '--password', 'password'], { from: 'user' })

    expect(saveSpy).toHaveBeenCalled()

    saveSpy.mockRestore()
  })

  it('me command fetches profile and prints (requires auth)', async () => {
    vi.spyOn(credsModule, 'requireAuth').mockImplementation(() => ({ email: 'test@example.com', accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', activeCycleId: 'cycle-2' } as any))

    nock('http://localhost:3000').get('/users/me').reply(200, ME_RESPONSE)

    await meCommand.parseAsync(['me'], { from: 'user' })
  })

  it('cycle list prints cycles', async () => {
    vi.spyOn(credsModule, 'requireAuth').mockImplementation(() => ({ email: 'test@example.com', accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', activeCycleId: 'cycle-2' } as any))

    nock('http://localhost:3000').get('/cycles').reply(200, CYCLE_RESPONSES.list)

    await cycleCommand.parseAsync(['list'], { from: 'user' })
  })

  it('log add (non-interactive) posts a log', async () => {
    vi.spyOn(credsModule, 'requireAuth').mockImplementation(() => ({ email: 'test@example.com', accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', activeCycleId: 'cycle-2' } as any))

    nock('http://localhost:3000')
      .post('/cycles/cycle-2/logs')
      .reply(201, LOG_RESPONSES.created)

    await logCommand.parseAsync(['add', '--date', '2024-02-05', '--temperature', '36.5'], { from: 'user' })
  })

  it('predict command fetches prediction', async () => {
    vi.spyOn(credsModule, 'requireAuth').mockImplementation(() => ({ email: 'test@example.com', accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', activeCycleId: 'cycle-2' } as any))

    nock('http://localhost:3000').get('/cycles/cycle-2/prediction').reply(200, PREDICTION_RESPONSE)

    await predictCommand.parseAsync(['predict'], { from: 'user' })
  })

  it('phase command shows content and current phase', async () => {
    vi.spyOn(credsModule, 'requireAuth').mockImplementation(() => ({ email: 'test@example.com', accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', activeCycleId: 'cycle-2' } as any))

    nock('http://localhost:3000').get('/phases/current').query({ cycleId: 'cycle-2' }).reply(200, PHASE_RESPONSES.current)
    nock('http://localhost:3000').get('/phases/content').reply(200, PHASE_RESPONSES.content)

    await phaseCommand.parseAsync([], { from: 'user' })
  })
})
