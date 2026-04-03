## ADDED Requirements

### Requirement: Jest test framework configured for sinto-api
The sinto-api project SHALL use Jest as the primary unit test runner, configured with TypeScript support, module aliases, and test coverage reporting.

#### Scenario: Jest runs API unit tests
- **WHEN** developer runs `npm test` in sinto-api directory
- **THEN** Jest discovers and runs all `*.test.ts` files with TypeScript transpilation
- **THEN** coverage report is generated in `coverage/` directory

#### Scenario: Module aliases resolve in tests
- **WHEN** test imports `src/modules/algorithm` via `@/modules/algorithm`
- **THEN** Jest resolves the alias correctly without path errors

### Requirement: Unit tests for authentication service
The sinto-api authentication service (register, login, refresh, logout) SHALL have unit test coverage for all functions and edge cases.

#### Scenario: Register flow validates input
- **WHEN** test calls `authService.register()` with invalid email
- **THEN** service throws `AppError` with code `INVALID_EMAIL`

#### Scenario: Login returns access + refresh tokens
- **WHEN** test calls `authService.login()` with valid credentials
- **THEN** service returns object with `accessToken` and `refreshToken` fields
- **THEN** both tokens are non-empty strings

#### Scenario: Refresh token flow validates token
- **WHEN** test calls `authService.refresh()` with expired refresh token
- **THEN** service throws `AppError` with code `TOKEN_EXPIRED`

#### Scenario: Logout blacklists refresh token
- **WHEN** test calls `authService.logout()` with valid refresh token
- **THEN** token is added to blacklist
- **WHEN** subsequent call to `authService.refresh()` with same token
- **THEN** service throws `AppError` with code `TOKEN_BLACKLISTED`

### Requirement: Unit tests for cycle management
The sinto-api cycle service (create, list, get, update, delete cycles) SHALL have unit test coverage for all state transitions.

#### Scenario: Start new cycle
- **WHEN** test calls `cycleService.create()` with valid startDate
- **THEN** cycle is created with status `ACTIVE` and `endDate` is null

#### Scenario: Close active cycle
- **WHEN** test calls `cycleService.update()` with endDate on active cycle
- **THEN** cycle status changes to `COMPLETED`

#### Scenario: Delete cycle removes associated logs
- **WHEN** test calls `cycleService.delete()` on cycle with 10 daily logs
- **THEN** cycle and all associated logs are removed from database

### Requirement: Unit tests for algorithm logic
The sinto-api algorithm module (fertile window, BBT rise detection, phase calculation) SHALL have unit test coverage with edge cases.

#### Scenario: BBT rise detection finds 3-day sustained rise
- **WHEN** test calls `detectBBTRise()` with BBT data: [36.5, 36.6, 36.4, 36.7, 36.8, 36.9]
- **THEN** function returns day index where rise is detected (day 3)

#### Scenario: BBT rise detection handles no rise
- **WHEN** test calls `detectBBTRise()` with flat BBT data: [36.5, 36.4, 36.6, 36.5, 36.4]
- **THEN** function returns null (no rise detected)

#### Scenario: Peak mucus detection identifies PEAK day
- **WHEN** test calls `detectPeakMucus()` with mucus progression: [NONE, CREAMY, STRETCHY, PEAK, CREAMY, NONE]
- **THEN** function returns index of last PEAK day

#### Scenario: Fertile window calculation combines BBT + mucus
- **WHEN** test calls `calculateFertileWindow()` with valid BBT rise on day 15 and peak mucus on day 13
- **THEN** function returns window spanning 5 days before BBT rise through 3 days after

### Requirement: Test fixtures for common database states
Unit tests SHALL use reusable fixtures to seed common database states (empty user, user with cycles, 28-day cycle with full logs).

#### Scenario: Fixture creates user with no cycles
- **WHEN** test uses `fixtures.user.empty()`
- **THEN** user is created with email, password, and zero cycles

#### Scenario: Fixture creates 28-day cycle with complete data
- **WHEN** test uses `fixtures.cycle.full28Day()`
- **THEN** cycle is created with 28 daily logs including BBT, mucus, mood, symptoms across all phases

### Requirement: Code coverage targets for unit tests
Unit tests for sinto-api SHALL maintain ≥80% code coverage for core modules (auth, cycles, algorithm).

#### Scenario: Coverage report shows 80%+ line coverage
- **WHEN** developer runs `npm test -- --coverage`
- **THEN** coverage report shows >80% for `src/modules/auth/`, `src/modules/cycles/`, `src/modules/algorithm/`
