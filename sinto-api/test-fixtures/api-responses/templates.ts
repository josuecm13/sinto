/**
 * Mock API response generators for test assertions.
 * These mirror the actual API response shapes from route handlers.
 */

import {
  TEST_USER_ID,
  TEST_CYCLE_ID,
  TEST_LOG_ID,
  createTestUser,
  createTestCycle,
  createTestDailyLog,
  type TestUser,
  type TestCycle,
  type TestDailyLog,
} from '../database/seeds'

// ─── Auth responses ─────────────────────────────────────────────────────────

export function authRegisterResponse(overrides: Partial<TestUser> = {}) {
  const user = createTestUser(overrides)
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
    },
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  }
}

export function authLoginResponse(overrides: Partial<TestUser> = {}) {
  const user = createTestUser(overrides)
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
    },
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  }
}

export function authRefreshResponse() {
  return {
    accessToken: 'new-mock-access-token',
    refreshToken: 'new-mock-refresh-token',
  }
}

// ─── Cycle responses ────────────────────────────────────────────────────────

export function cycleResponse(overrides: Partial<TestCycle> = {}) {
  const cycle = createTestCycle(overrides)
  return {
    id: cycle.id,
    userId: cycle.userId,
    startDate: cycle.startDate.toISOString(),
    endDate: cycle.endDate?.toISOString() ?? null,
    cycleLength: cycle.cycleLength,
    lutealPhaseLength: cycle.lutealPhaseLength,
    logsCount: 0,
    createdAt: cycle.createdAt.toISOString(),
    updatedAt: cycle.updatedAt.toISOString(),
  }
}

export function cycleListResponse(count: number = 2) {
  const cycles = []
  for (let i = 0; i < count; i++) {
    cycles.push(cycleResponse({
      id: `cycle-${i}`,
      startDate: new Date(`2024-0${i + 1}-01`),
    }))
  }
  return cycles
}

// ─── Log responses ──────────────────────────────────────────────────────────

export function logResponse(overrides: Partial<TestDailyLog> = {}) {
  const log = createTestDailyLog(overrides)
  return {
    id: log.id,
    cycleId: log.cycleId,
    date: log.date.toISOString(),
    temperature: log.temperature,
    phase: log.phase,
    isMenstruating: log.isMenstruating,
    menstrualLog: log.menstrualLog,
    symptomLog: log.symptomLog,
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
  }
}

// ─── Error responses ────────────────────────────────────────────────────────

export function errorResponse(code: string, message: string) {
  return {
    error: code,
    message,
  }
}

export const COMMON_ERRORS = {
  unauthorized: errorResponse('UNAUTHORIZED', 'Authentication required'),
  invalidCredentials: errorResponse('INVALID_CREDENTIALS', 'Invalid credentials'),
  cycleNotFound: errorResponse('CYCLE_NOT_FOUND', 'Cycle not found'),
  logNotFound: errorResponse('LOG_NOT_FOUND', 'Log not found'),
  emailTaken: errorResponse('EMAIL_TAKEN', 'Email already in use'),
  openCycleExists: errorResponse('OPEN_CYCLE_EXISTS', 'User already has an open cycle'),
  logAlreadyExists: errorResponse('LOG_ALREADY_EXISTS', 'Log for this date already exists'),
  validationError: (msg: string) => errorResponse('VALIDATION_ERROR', msg),
}

// ─── Prediction responses ───────────────────────────────────────────────────

export function predictionResponse() {
  return {
    cycleId: TEST_CYCLE_ID,
    cycleDay: 14,
    estimatedCycleDuration: 28,
    durationVariance: {
      min: 26,
      max: 31,
      stdDev: 1.5,
    },
    currentPhase: {
      name: 'ovulatory',
      estimatedStartDay: 14,
      estimatedEndDay: 16,
      dayInPhase: 1,
    },
    expectedOvulation: {
      estimatedDate: '2024-01-14T00:00:00.000Z',
      daysUntil: 0,
    },
    fertilityWindow: {
      estimatedStartDate: '2024-01-09T00:00:00.000Z',
      estimatedEndDate: '2024-01-17T00:00:00.000Z',
      daysRemaining: 3,
      isCurrentlyFertile: true,
    },
    temperatureTrend: {
      hasData: true,
      lastTemperature: 36.8,
      trend: 'rising',
      daysUntilThermalShift: 2,
    },
    nextExpectedMenstruation: '2024-01-29T00:00:00.000Z',
    confidenceLevel: 'medium',
  }
}
