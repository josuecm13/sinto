/**
 * Test database seed fixtures.
 * Provides factory functions for creating test data without hitting a real DB.
 * All IDs are deterministic for snapshot-stable tests.
 */

export const TEST_USER_ID = 'test-user-clxxxxxxxxxxxxxxxxx'
export const TEST_USER_ID_2 = 'test-user-2-clyyyyyyyyyyyyyy'
export const TEST_CYCLE_ID = 'test-cycle-clzzzzzzzzzzzzzz'
export const TEST_CYCLE_ID_2 = 'test-cycle-2-clwwwwwwwwwwwww'
export const TEST_LOG_ID = 'test-log-clvvvvvvvvvvvvvvvv'

export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: TEST_USER_ID,
    email: 'test@example.com',
    name: 'Test User',
    username: 'testuser',
    avatarUrl: null,
    passwordHash: '$2a$12$LJ3m4ys3Lk0TSwHkfE0dHeHi6R1ZtEfMcvtzVTFJE4fASN1oZbPmS', // "password123"
    isPublic: false,
    remindersEnabled: false,
    reminderTime: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  }
}

export function createTestCycle(overrides: Partial<TestCycle> = {}): TestCycle {
  return {
    id: TEST_CYCLE_ID,
    userId: TEST_USER_ID,
    startDate: new Date('2024-01-01'),
    endDate: null,
    cycleLength: null,
    lutealPhaseLength: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  }
}

export function createCompletedCycle(overrides: Partial<TestCycle> = {}): TestCycle {
  return createTestCycle({
    endDate: new Date('2024-01-28'),
    cycleLength: 28,
    ...overrides,
  })
}

export function createTestDailyLog(overrides: Partial<TestDailyLog> = {}): TestDailyLog {
  return {
    id: TEST_LOG_ID,
    cycleId: TEST_CYCLE_ID,
    date: new Date('2024-01-01'),
    temperature: 36.5,
    phase: null,
    isMenstruating: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    menstrualLog: null,
    symptomLog: null,
    ...overrides,
  }
}

export function createTestMenstrualLog(overrides: Partial<TestMenstrualLog> = {}): TestMenstrualLog {
  return {
    id: 'test-mlog-claaaaaaaaaaaaaa',
    dailyLogId: TEST_LOG_ID,
    flowLevel: 'MEDIUM',
    color: 'BRIGHT_RED',
    consistency: 'NORMAL',
    ...overrides,
  }
}

export function createTestSymptomLog(overrides: Partial<TestSymptomLog> = {}): TestSymptomLog {
  return {
    id: 'test-slog-clbbbbbbbbbbbbbb',
    dailyLogId: TEST_LOG_ID,
    mood: 'CALM',
    mucusType: 'CREAMY',
    mucusQuality: 'MEDIUM',
    symptoms: [],
    ...overrides,
  }
}

export function createTestCycleStatistics(overrides: Partial<TestCycleStatistics> = {}): TestCycleStatistics {
  return {
    id: 'test-stats-clcccccccccccc',
    userId: TEST_USER_ID,
    avgDurationDays: 28.5,
    minDurationDays: 26,
    maxDurationDays: 31,
    stdDev: 1.5,
    cycleCount: 6,
    lastUpdated: new Date('2024-06-01T00:00:00Z'),
    ...overrides,
  }
}

/**
 * Generates a full 28-day cycle with daily logs, including
 * temperature pattern that shows BBT rise around day 14.
 */
export function createFull28DayCycle(): { cycle: TestCycle; logs: TestDailyLog[] } {
  const cycle = createCompletedCycle()
  const logs: TestDailyLog[] = []

  // Follicular phase temps (days 1-13): ~36.3-36.5
  const follicularTemps = [36.3, 36.4, 36.5, 36.3, 36.4, 36.5, 36.3, 36.4, 36.5, 36.4, 36.3, 36.5, 36.4]
  // Luteal phase temps (days 14-28): ~36.7-37.0 (post-ovulation rise)
  const lutealTemps = [36.8, 36.9, 37.0, 36.9, 36.8, 36.9, 37.0, 36.9, 36.8, 36.9, 37.0, 36.9, 36.8, 36.7, 36.5]

  const allTemps = [...follicularTemps, ...lutealTemps]

  for (let day = 0; day < 28; day++) {
    const date = new Date('2024-01-01')
    date.setDate(date.getDate() + day)

    logs.push(createTestDailyLog({
      id: `test-log-day-${day + 1}`,
      date,
      temperature: allTemps[day] ?? 36.5,
      isMenstruating: day < 5, // menstruating first 5 days
      menstrualLog: day < 5 ? createTestMenstrualLog({ dailyLogId: `test-log-day-${day + 1}` }) : null,
      symptomLog: createTestSymptomLog({
        dailyLogId: `test-log-day-${day + 1}`,
        mucusQuality: day >= 10 && day <= 14 ? (day === 13 ? 'PEAK' : day >= 12 ? 'HIGH' : 'MEDIUM') : 'LOW',
      }),
    }))
  }

  return { cycle, logs }
}

// ─── Type definitions ───────────────────────────────────────────────────────

export interface TestUser {
  id: string
  email: string
  name: string
  username: string | null
  avatarUrl: string | null
  passwordHash: string | null
  isPublic: boolean
  remindersEnabled: boolean
  reminderTime: string | null
  createdAt: Date
  updatedAt: Date
}

export interface TestCycle {
  id: string
  userId: string
  startDate: Date
  endDate: Date | null
  cycleLength: number | null
  lutealPhaseLength: number | null
  createdAt: Date
  updatedAt: Date
}

export interface TestDailyLog {
  id: string
  cycleId: string
  date: Date
  temperature: number | null
  phase: string | null
  isMenstruating: boolean
  createdAt: Date
  updatedAt: Date
  menstrualLog: TestMenstrualLog | null
  symptomLog: TestSymptomLog | null
}

export interface TestMenstrualLog {
  id: string
  dailyLogId: string
  flowLevel: string
  color: string
  consistency: string
}

export interface TestSymptomLog {
  id: string
  dailyLogId: string
  mood: string | null
  mucusType: string | null
  mucusQuality: string | null
  symptoms: string[]
}

export interface TestCycleStatistics {
  id: string
  userId: string
  avgDurationDays: number
  minDurationDays: number
  maxDurationDays: number
  stdDev: number
  cycleCount: number
  lastUpdated: Date
}
