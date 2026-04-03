## ADDED Requirements

### Requirement: Shared test fixtures and utilities
The test suite SHALL provide reusable fixtures, data generators, and utilities across all projects via a shared `test-fixtures/` directory.

#### Scenario: Database fixtures for common states
- **WHEN** test imports `fixtures.user.empty()`
- **THEN** function returns a Prisma seed object with a user (no cycles)
- **WHEN** test imports `fixtures.cycle.full28Day()`
- **THEN** function returns cycle with 28 daily logs (complete data: BBT, mucus, mood, symptoms across all phases)

#### Scenario: Deterministic test data with seeding
- **WHEN** test uses seed generator with value 12345
- **WHEN** test generates cycle data (BBT values, dates, mucus progression)
- **WHEN** same test runs again with seed 12345
- **THEN** generated data is identical (dates, temperatures, phases)

#### Scenario: Mock API response templates
- **WHEN** test imports `fixtures.api.registerResponse()`
- **THEN** returns object with all fields: accessToken, refreshToken, expiresIn
- **WHEN** test imports `fixtures.api.cyclesListResponse(3)`
- **THEN** returns array of 3 cycles with all required fields

#### Scenario: Auth token generation utility
- **WHEN** test calls `fixtures.auth.generateToken(userId, expiresIn)`
- **THEN** returns valid JWT token with correct payload
- **WHEN** test calls `fixtures.auth.parseToken(token)`
- **THEN** returns decoded payload with userId and expiration

### Requirement: Docker test containers for database and cache
Test infrastructure SHALL provide Docker Compose configuration for PostgreSQL and Redis in isolated test environment.

#### Scenario: Test database on separate port
- **WHEN** test suite runs with `docker-compose -f docker-compose.test.yml up`
- **THEN** PostgreSQL container starts on port 5434 (separate from dev port 5433)
- **THEN** Redis container starts on port 6380 (separate from dev port 6379)
- **THEN** containers are initialized with empty database and schema

#### Scenario: Database migrations run automatically
- **WHEN** test containers start
- **THEN** Prisma migrations (from `sinto-api/prisma/migrations/`) are applied automatically
- **THEN** database schema matches production schema

#### Scenario: Containers are cleaned up after tests
- **WHEN** test suite completes
- **THEN** containers are stopped and removed (via `docker-compose down`)
- **THEN** volumes are cleaned to ensure next run starts fresh

#### Scenario: Test containers are isolated from development
- **WHEN** dev containers are running (port 5433)
- **WHEN** test containers start (port 5434)
- **THEN** both run simultaneously without conflict
- **THEN** dev database is unaffected by test runs

### Requirement: Test helpers and utilities library
Test infrastructure SHALL provide utility functions for common testing patterns (mocking, assertions, test data).

#### Scenario: API request mocking helper
- **WHEN** test calls `mockAPI.get('/cycles', { fixture: 'cycles.json' })`
- **THEN** all GET requests to `/cycles` return fixture data
- **WHEN** test calls `mockAPI.post('/auth/register', { status: 409, body: { error: 'USER_EXISTS' } })`
- **THEN** all POST requests to `/auth/register` return 409 error

#### Scenario: Database seeding helper
- **WHEN** test calls `seed.user({ email: 'test@example.com' })`
- **THEN** user is inserted into test database
- **THEN** function returns user object with generated id

#### Scenario: Authentication helper
- **WHEN** test calls `auth.loginAs('test@example.com')`
- **THEN** helper performs login via API or creates token directly
- **THEN** helper returns authorization header ready for use in subsequent requests
- **WHEN** test calls `auth.logout()`
- **THEN** token is invalidated and removed from test context

### Requirement: GitHub Actions CI/CD workflows
Test infrastructure SHALL include GitHub Actions workflows for automated test runs on PR and main branch.

#### Scenario: API test workflow runs on every PR
- **WHEN** pull request is opened against main
- **THEN** `.github/workflows/test-api.yml` is triggered
- **THEN** workflow checks out code, installs deps, runs Jest tests
- **THEN** workflow uploads coverage to Codecov
- **WHEN** tests fail
- **THEN** workflow fails and PR cannot be merged

#### Scenario: CLI test workflow runs on every PR
- **WHEN** pull request is opened against main
- **THEN** `.github/workflows/test-cli.yml` is triggered
- **THEN** workflow runs Vitest suite for sinto-cli
- **THEN** workflow generates and publishes coverage report

#### Scenario: App e2e test workflow runs nightly
- **WHEN** scheduled time (2 AM UTC daily) is reached
- **THEN** `.github/workflows/test-app-e2e.yml` is triggered
- **THEN** workflow runs e2e tests against staging API
- **WHEN** tests fail
- **THEN** workflow sends notification (email or Slack)

#### Scenario: All workflows require Docker (services)
- **WHEN** API test workflow runs
- **THEN** workflow starts PostgreSQL and Redis containers via Docker
- **THEN** tests run against containerized services
- **WHEN** containers are no longer needed
- **THEN** services are stopped automatically (no cleanup step needed)

### Requirement: Code coverage reporting and thresholds
Test infrastructure SHALL enforce code coverage thresholds and publish reports.

#### Scenario: Coverage thresholds enforced for API
- **WHEN** test suite runs with `npm test -- --coverage`
- **WHEN** coverage for `src/modules/auth/` falls below 80%
- **THEN** test run fails with message: "Coverage threshold not met for src/modules/auth/"

#### Scenario: Coverage reports published to Codecov
- **WHEN** test workflow completes on main branch
- **THEN** coverage report is uploaded to Codecov
- **THEN** Codecov comment is posted on PR (if applicable) showing coverage change

#### Scenario: Coverage trending tracked
- **WHEN** PR is opened
- **THEN** Codecov compares coverage against main branch
- **WHEN** coverage decreases
- **THEN** Codecov comments on PR: "Coverage decreased by 2.5%"
- **WHEN** coverage increases
- **THEN** Codecov comments: "Coverage increased by 1.2%"

### Requirement: Test documentation and guidelines
Test infrastructure SHALL include documentation for writing and running tests.

#### Scenario: Testing guide documents exist
- **WHEN** developer opens `CONTRIBUTING.md`
- **THEN** section "Writing Tests" explains test structure and patterns
- **THEN** section "Running Tests Locally" shows commands for each project
- **THEN** section "Coverage Goals" explains coverage thresholds

#### Scenario: Test examples are provided
- **WHEN** developer views `docs/testing/api-unit-test-example.md`
- **THEN** document shows complete example of auth service unit test
- **WHEN** developer views `docs/testing/cli-integration-test-example.md`
- **THEN** document shows example of CLI command test with mocked API

#### Scenario: Test naming conventions documented
- **WHEN** developer reads testing guide
- **THEN** guide specifies test file naming: `*.test.ts` or `*.spec.ts`
- **THEN** guide specifies test suite names: `describe('moduleName', () => { ... })`
- **THEN** guide specifies test names: `it('should do X when Y', () => { ... })`

### Requirement: Pre-commit hooks for test validation
Test infrastructure SHALL include Git hooks to validate tests before commit.

#### Scenario: Pre-commit hook runs affected tests
- **WHEN** developer commits code to `sinto-api/src/modules/auth/auth.service.ts`
- **THEN** pre-commit hook runs only auth service tests (not full suite)
- **WHEN** tests pass
- **THEN** commit proceeds
- **WHEN** tests fail
- **THEN** commit is blocked with error message

#### Scenario: Pre-commit hook checks for test files
- **WHEN** developer commits new feature to `sinto-api/src/modules/cycles/`
- **WHEN** no corresponding test file exists
- **THEN** pre-commit hook warns: "No test file found for cycles module"
- **THEN** developer can override with `--no-verify` if intentional (documented)
