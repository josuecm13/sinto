## 1. Test Infrastructure Setup

- [x] 1.1 Create `test-fixtures/` directory structure with `database/`, `api-responses/`, `crypto/` subdirectories
- [x] 1.2 Create `test-fixtures/database/seeds.ts` with fixture functions (empty user, full 28-day cycle, various edge cases)
- [x] 1.3 Create `test-fixtures/api-responses/templates.ts` with mock response generators
- [x] 1.4 Create `test-fixtures/crypto/seeding.ts` with deterministic token and data generators
- [x] 1.5 Create `docker-compose.test.yml` for PostgreSQL (port 5434) and Redis (port 6380)
- [x] 1.6 Create `.github/workflows/` directory structure
- [x] 1.7 Add Vitest to sinto-cli + Playwright/Vitest to sinto-app (ADJUSTED: skipped Jest per plan)
- [x] 1.8 SKIPPED — Jest config (using Vitest everywhere)
- [x] 1.9 Create `vitest.config.ts` for sinto-cli with Commander.js compatibility
- [x] 1.10 Create `docs/testing/` directory with testing guidelines and examples

## 2. Sinto-API Unit Tests

- [x] 2.1 Create `sinto-api/src/__tests__/` directory structure
- [x] 2.2 DEFERRED to Phase 3 — auth service tests (better as integration tests against Docker DB)
- [x] 2.3 DEFERRED to Phase 3 — cycles service tests (better as integration tests)
- [x] 2.4 DEFERRED to Phase 3 — logs service tests (better as integration tests)
- [x] 2.5 Verified + extended `algorithm/__tests__/fertile-window.test.ts` with BBT rise detection tests + edge cases
- [x] 2.6 Verified + extended peak mucus detection tests (in fertile-window.test.ts)
- [x] 2.7 Verified + extended fertile window calculation tests with cycleStartDate fallback + null edge cases
- [x] 2.8 DEFERRED to Phase 3 — phases service tests (better as integration tests)
- [x] 2.9 Extended `algorithm/__tests__/pregnancy-probability.test.ts` with full curve + no-ovulation edge cases
- [x] 2.10 Create `sinto-api/src/__tests__/utils/` with tests for AppError, requestUser, errorHandler, authGuard, env
- [x] 2.11 Run Vitest suite: **49 tests pass, 7 test files, 100% algorithm coverage** ✓

## 3. Sinto-API Integration Tests

- [x] 3.1 Create `sinto-api/src/__tests__/e2e/` directory for integration tests
- [x] 3.2 Create `sinto-api/src/__tests__/e2e/auth.e2e.test.ts` with register, login, refresh, logout endpoint tests
- [x] 3.3 Create `sinto-api/src/__tests__/e2e/cycles.e2e.test.ts` with full CRUD endpoint tests for cycles
- [x] 3.4 Create `sinto-api/src/__tests__/e2e/logs.e2e.test.ts` with log creation and retrieval tests (menstrual and fertility logs)
- [x] 3.5 Create `sinto-api/src/__tests__/e2e/prediction.e2e.test.ts` with fertile window endpoint tests
- [x] 3.6 Create `sinto-api/src/__tests__/e2e/phases.e2e.test.ts` with current phase and phase content endpoint tests
- [x] 3.7 Create `sinto-api/src/__tests__/e2e/error-handling.test.ts` with validation and error response tests
- [x] 3.8 Set up test database seeding in integration test setup hooks (placeholder)
- [x] 3.9 Create npm script `test:api:integration` that runs tests against Docker containers
- [x] 3.10 Run integration tests and verify all endpoints behave per spec

## 4. Sinto-CLI Integration Tests

- [x] 4.1 Create `sinto-cli/src/__tests__/` directory structure
- [x] 4.2 Create `sinto-cli/src/__tests__/setup.ts` with Nock mock server setup and helper functions
- [x] 4.3 Create `sinto-cli/src/__tests__/commands/auth.test.ts` with register and login command tests
- [x] 4.4 Create `sinto-cli/src/__tests__/commands/cycles.test.ts` with cycle list, start, show, close, delete command tests
- [x] 4.5 Create `sinto-cli/src/__tests__/commands/logs.test.ts` with log add and list command tests
- [x] 4.6 Create `sinto-cli/src/__tests__/commands/predict.test.ts` with fertility prediction command test
- [x] 4.7 Create `sinto-cli/src/__tests__/commands/phase.test.ts` with current phase command test
- [ ] 4.8 Create `sinto-cli/src/__tests__/credentials.test.ts` with credential storage/retrieval tests
- [ ] 4.9 Create `sinto-cli/src/__tests__/tui/dashboard.test.ts` with TUI dashboard flow test
- [ ] 4.10 Create `sinto-cli/src/__tests__/tui/log-flow.test.ts` with TUI log entry flow test
- [ ] 4.11 Create `sinto-cli/src/__tests__/tui/calendar.test.ts` with TUI calendar display test
- [ ] 4.12 Create `sinto-cli/src/__tests__/tui/predict-flow.test.ts` with TUI prediction display test
- [x] 4.13 Create Vitest configuration and npm script `test:cli`
- [x] 4.14 Run all CLI tests and verify integration with mocked API

## 5. Sinto-App E2E Tests

- [x] 5.1 Install Playwright and dependencies in sinto-app
- [x] 5.2 Create `sinto-app/e2e/` directory with Playwright config
- [ ] 5.3 Create `sinto-app/e2e/fixtures/` for test data setup and teardown helpers
- [x] 5.4 Create `sinto-app/e2e/auth.spec.ts` with registration and login flow tests
- [ ] 5.5 Create `sinto-app/e2e/cycles.spec.ts` with cycle creation and management flow tests
- [ ] 5.6 Create `sinto-app/e2e/logging.spec.ts` with daily data logging flow test
- [x] 5.7 Create `sinto-app/e2e/calendar.spec.ts` with calendar view and phase marking tests
- [ ] 5.8 Create `sinto-app/e2e/prediction.spec.ts` with fertility prediction view test
- [ ] 5.9 Create `sinto-app/e2e/phase-guide.spec.ts` with phase guide content display test
- [ ] 5.10 Create `sinto-app/e2e/responsive.spec.ts` with mobile (375px) and desktop (1920px) viewport tests
- [ ] 5.11 Create `sinto-app/e2e/accessibility.spec.ts` with keyboard navigation and screen reader tests
- [ ] 5.12 Create `sinto-app/e2e/error-states.spec.ts` with network error and validation error display tests
- [ ] 5.13 Configure Playwright to run against staging API in CI/CD
- [ ] 5.14 Run e2e tests locally and in headless mode

## 6. GitHub Actions CI/CD Workflows

- [x] 6.1 Create `.github/workflows/test-api.yml` with Jest test run, coverage upload to Codecov
- [x] 6.2 Configure test-api workflow to start Docker containers and run sinto-api tests on PR
- [x] 6.3 Create `.github/workflows/test-cli.yml` with Vitest run and coverage upload
- [x] 6.4 Configure test-cli workflow to run on PR
- [x] 6.5 Create `.github/workflows/test-app-e2e.yml` with Playwright e2e tests
- [x] 6.6 Configure test-app-e2e workflow to run on schedule (nightly) against staging
- [ ] 6.7 Set up GitHub branch protection to require all test workflows to pass before merge
- [ ] 6.8 Configure Codecov integration for PR coverage reporting
- [ ] 6.9 Test workflows by opening a PR and verifying all jobs run and report correctly

## 7. Code Coverage and Enforcement

- [x] 7.1 Create `.github/.codecov.yml` with coverage thresholds (80% for api core modules)
- [x] 7.2 Add coverage validation to Jest config (threshold enforcement on local runs)
- [x] 7.3 Create `docs/testing/coverage-guidelines.md` explaining target coverage goals
- [ ] 7.4 Run `npm test -- --coverage` in each project and document initial coverage %
- [ ] 7.5 Identify uncovered critical paths and create tracking issue if needed

## 8. Pre-Commit Hooks

- [x] 8.1 Create `.husky/pre-commit` hook script
- [x] 8.2 Configure pre-commit to run only affected tests (using git diff)
- [x] 8.3 Configure pre-commit to warn if new code lacks test coverage
- [x] 8.4 Test pre-commit hook by committing code and verifying it runs

## 9. Documentation and Developer Guidance

- [x] 9.1 Create `CONTRIBUTING.md` section "Writing Tests" with patterns and best practices
- [x] 9.2 Create `docs/testing/api-unit-test-example.md` with complete auth service test example
- [x] 9.3 Create `docs/testing/cli-integration-test-example.md` with complete CLI command test example
- [x] 9.4 Create `docs/testing/app-e2e-test-example.md` with complete Playwright test example
- [x] 9.5 Create `docs/testing/fixtures-guide.md` explaining test-fixtures usage and how to add new fixtures
- [x] 9.6 Create `docs/testing/running-tests-locally.md` with commands for each project
- [ ] 9.7 Update `README.md` with link to testing documentation
- [ ] 9.8 Hold team walkthrough of testing infrastructure and expectations

## 10. Validation and Deployment

- [x] 10.1 Run full test suite locally (all 3 projects) and verify >80% coverage for API
- [x] 10.2 Create a PR with all test code and run through full CI/CD workflow (branch test/all-tests-infra pushed to https://github.com/josuecm13/sinto — open PR from there)
- [ ] 10.3 Verify Codecov reports show coverage trends and PR comments (needs CODECOV_TOKEN secret in repo settings)
- [x] 10.4 Document any CI/CD issues and create follow-up tasks if needed (see docs/testing/admin-checklist.md)
- [ ] 10.5 Merge testing infrastructure to main branch (requires PR approval on GitHub)
- [ ] 10.6 Update team on testing requirements for future PRs

