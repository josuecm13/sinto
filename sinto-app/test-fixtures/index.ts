/**
 * Test fixtures for sinto-app (React frontend).
 * Provides mock data for component tests and E2E tests.
 */

export const TEST_USER = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  username: 'testuser',
}

export const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123',
}

export const TEST_CYCLE = {
  id: 'cycle-1',
  startDate: '2024-01-01',
  endDate: null,
  cycleLength: null,
  logsCount: 5,
}

export const TEST_PREDICTION = {
  cycleDay: 14,
  currentPhase: { name: 'ovulatory' },
  fertilityWindow: { isCurrentlyFertile: true, daysRemaining: 3 },
  expectedOvulation: { daysUntil: 0 },
  confidenceLevel: 'medium',
}
