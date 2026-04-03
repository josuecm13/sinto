/**
 * Mock API response fixtures for CLI tests.
 * Mirrors the shapes returned by sinto-api endpoints.
 */

export const AUTH_RESPONSES = {
  register: {
    user: { id: 'user-1', email: 'test@example.com', name: 'Test User', username: 'testuser' },
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  },
  login: {
    user: { id: 'user-1', email: 'test@example.com', name: 'Test User', username: 'testuser' },
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  },
  refresh: {
    accessToken: 'new-access-token',
    refreshToken: 'new-refresh-token',
  },
}

export const CYCLE_RESPONSES = {
  list: [
    {
      id: 'cycle-1',
      userId: 'user-1',
      startDate: '2024-01-01',
      endDate: '2024-01-28',
      cycleLength: 28,
      logsCount: 28,
    },
    {
      id: 'cycle-2',
      userId: 'user-1',
      startDate: '2024-02-01',
      endDate: null,
      cycleLength: null,
      logsCount: 5,
    },
  ],
  single: {
    id: 'cycle-2',
    userId: 'user-1',
    startDate: '2024-02-01',
    endDate: null,
    cycleLength: null,
    logs: [],
  },
}

export const LOG_RESPONSES = {
  created: {
    id: 'log-1',
    cycleId: 'cycle-2',
    date: '2024-02-05',
    temperature: 36.5,
    isMenstruating: false,
    menstrualLog: null,
    symptomLog: null,
    cycleTransitioned: false,
  },
  list: [
    {
      id: 'log-1',
      cycleId: 'cycle-2',
      date: '2024-02-01',
      temperature: 36.3,
      isMenstruating: true,
    },
    {
      id: 'log-2',
      cycleId: 'cycle-2',
      date: '2024-02-02',
      temperature: 36.4,
      isMenstruating: true,
    },
  ],
}

export const PREDICTION_RESPONSE = {
  cycleId: 'cycle-2',
  cycleDay: 10,
  estimatedCycleDuration: 28,
  currentPhase: { name: 'follicular', estimatedStartDay: 6, estimatedEndDay: 13, dayInPhase: 5 },
  expectedOvulation: { estimatedDate: '2024-02-14', daysUntil: 4 },
  fertilityWindow: {
    estimatedStartDate: '2024-02-09',
    estimatedEndDate: '2024-02-17',
    daysRemaining: 7,
    isCurrentlyFertile: true,
  },
  confidenceLevel: 'medium',
}

export const PHASE_RESPONSES = {
  current: { phase: 'FOLLICULAR', cycleDay: 10 },
  content: {
    phase: 'FOLLICULAR',
    content: {
      EXERCISE: [{ id: '1', title: 'Cardio', body: 'Good time for high-intensity workouts' }],
      NUTRITION: [{ id: '2', title: 'Iron', body: 'Increase iron-rich foods' }],
      TIPS: [],
      DANGERS: [],
      GENERAL: [],
    },
  },
}

export const ME_RESPONSE = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  username: 'testuser',
  createdAt: '2024-01-01T00:00:00.000Z',
}
