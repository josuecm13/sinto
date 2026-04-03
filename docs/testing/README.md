# Testing Guide

## Overview

Sinto uses **Vitest** for unit/integration tests across all projects and **Playwright** for E2E tests in sinto-app.

## Running Tests

### sinto-api (Fastify backend)
```bash
cd sinto-api
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### sinto-cli (Commander.js CLI)
```bash
cd sinto-cli
npm test              # Run all tests
npm run test:coverage # With coverage report
```

### sinto-app (React frontend)
```bash
cd sinto-app
npm test              # Unit/component tests
npm run test:e2e      # Playwright E2E tests
npm run test:coverage # Unit tests with coverage
```

## Test Infrastructure

### Docker (Integration Tests)
```bash
cd sinto-api
docker compose -f docker-compose.test.yml up -d   # Start test DB + Redis
docker compose -f docker-compose.test.yml down     # Tear down
```

Test containers use isolated ports:
- PostgreSQL: **5434** (vs 5433 for dev)
- Redis: **6380** (vs 6379 for dev)

### Test Fixtures
Each project owns its fixtures in `test-fixtures/`:
- `sinto-api/test-fixtures/` - DB seeds, API response templates, crypto helpers
- `sinto-cli/test-fixtures/` - Mock API responses, credential fixtures
- `sinto-app/test-fixtures/` - Component test data

## Coverage Targets
- **Algorithm modules**: >= 80% (mission-critical fertility calculations)
- **Service modules**: >= 70% (business logic)
- **Routes/middleware**: >= 50% (covered more by integration tests)

## Writing Tests
- Co-locate unit tests next to source: `module.ts` -> `module.test.ts` or `__tests__/module.test.ts`
- Use factories from `test-fixtures/` for consistent test data
- Mock external dependencies (Prisma, Redis) at the module boundary
- Keep algorithm tests pure -- no mocks, just input/output verification
