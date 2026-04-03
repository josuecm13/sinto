## ADDED Requirements

### Requirement: Integration tests for CLI commands with mocked API
The sinto-cli project SHALL have integration tests for all CLI commands using a mocked HTTP server to avoid depending on a live API.

#### Scenario: Register command prompts for input and creates account
- **WHEN** test runs `sinto register` with mocked API
- **WHEN** prompts are automatically answered: name=Test User, email=test@example.com, password=Pass123!
- **THEN** mock API receives POST to `/auth/register` with correct payload
- **THEN** command saves tokens to `~/.sinto/credentials.json`

#### Scenario: Login command authenticates user
- **WHEN** test runs `sinto login` with mocked API
- **WHEN** prompts are answered: email=test@example.com, password=Pass123!
- **THEN** mock API receives POST to `/auth/login`
- **THEN** tokens are saved to credentials file

#### Scenario: Cycle list command displays user's cycles
- **WHEN** test runs `sinto cycle list` with mocked API (3 cycles in mock response)
- **THEN** command displays table with cycle dates and statuses
- **THEN** mock API received GET to `/cycles`

#### Scenario: Start cycle command creates new cycle
- **WHEN** test runs `sinto cycle start` with today's date
- **THEN** mock API receives POST to `/cycles` with today's date
- **THEN** new cycle is displayed in output

#### Scenario: Log add command logs daily data
- **WHEN** test runs `sinto log add`
- **WHEN** prompts are answered: BBT=36.5, mucus=STRETCHY, mood=HAPPY
- **THEN** mock API receives POST to `/cycles/:id/logs` with logged data
- **THEN** confirmation message is displayed

#### Scenario: Predict command displays fertile window
- **WHEN** test runs `sinto predict` on cycle with BBT and mucus data
- **THEN** mock API receives GET to `/cycles/:id/prediction`
- **THEN** output displays fertile window dates and probability table

#### Scenario: Phase command shows current phase
- **WHEN** test runs `sinto phase` on active cycle
- **THEN** mock API receives GET to `/phases/current?cycleId=:id`
- **THEN** output displays phase name and cycle day

### Requirement: HTTP mocking with Nock library
Integration tests SHALL use Nock to intercept HTTP requests and return mock responses without hitting a real API.

#### Scenario: Mock response matches API schema
- **WHEN** test mocks GET `/cycles` with Nock
- **THEN** response includes all required cycle fields: id, startDate, endDate, status, logs

#### Scenario: Mock request verification
- **WHEN** test runs CLI command with mocked API
- **WHEN** test completes
- **THEN** Nock verifies all expected requests were made
- **THEN** test fails if any mocked endpoint was not called

### Requirement: TUI flow integration tests
The sinto-cli interactive TUI (dashboard, log today, calendar, predict, phase guide) SHALL be tested end-to-end.

#### Scenario: Dashboard displays current phase and fertility status
- **WHEN** test launches TUI with active cycle
- **THEN** dashboard renders with phase badge (MENSTRUAL/FOLLICULAR/OVULATORY/LUTEAL)
- **THEN** dashboard shows fertility status bar
- **THEN** dashboard includes account info

#### Scenario: Log flow guides user through data entry
- **WHEN** test selects "Log today" from dashboard menu
- **WHEN** prompts are answered: BBT, menstrual flow (if menstruating), mood, mucus, symptoms
- **THEN** log is created via API
- **THEN** TUI returns to dashboard

#### Scenario: Calendar view displays all cycle phases
- **WHEN** test selects "Calendar" from dashboard
- **THEN** calendar renders up to 3 months
- **THEN** menstruation days shown with 🔴
- **THEN** fertile days shown with ◈
- **THEN** today is highlighted

#### Scenario: Predict flow displays fertile window and probability table
- **WHEN** test selects "Predict" from dashboard
- **THEN** TUI displays fertile window dates
- **THEN** TUI displays daily probability table (28 rows × 3 columns)

#### Scenario: Phase guide shows content by category
- **WHEN** test selects "Phase guide" from dashboard on FOLLICULAR phase
- **THEN** TUI displays 5 categories: GENERAL, EXERCISE, NUTRITION, TIPS, DANGERS
- **THEN** content is in Spanish (per seeding)

### Requirement: CLI credential storage testing
Integration tests SHALL verify that credentials are correctly stored and retrieved from `~/.sinto/credentials.json`.

#### Scenario: Credentials file is created with required fields
- **WHEN** test runs `sinto register` and completes
- **THEN** `~/.sinto/credentials.json` exists
- **THEN** file contains: accessToken, refreshToken, email, activeCycleId

#### Scenario: Credentials file is loaded on next command
- **WHEN** first test run creates credentials
- **WHEN** second test run (separate process) runs `sinto cycle list`
- **THEN** command reads credentials from file
- **THEN** mock API request includes auth bearer token

#### Scenario: Logout removes credentials
- **WHEN** test runs `sinto logout`
- **THEN** credentials file is deleted
- **WHEN** test tries to run authenticated command
- **THEN** command prompts to login first

### Requirement: CLI error handling and user messaging
Integration tests SHALL verify error messages are user-friendly for common failure scenarios.

#### Scenario: Invalid email returns helpful error
- **WHEN** test runs `sinto register` with invalid email (no @)
- **THEN** CLI displays: "Invalid email format. Please try again."

#### Scenario: Duplicate email returns clear message
- **WHEN** mock API returns 409 error for duplicate email
- **THEN** CLI displays: "Email already registered. Try logging in instead."

#### Scenario: Network error shows offline message
- **WHEN** Nock is not set up to mock an endpoint (simulating network error)
- **THEN** CLI displays: "Connection error. Please check your internet and try again."

### Requirement: Deterministic test data generation
Integration tests SHALL use seeded fixtures to generate reproducible test data.

#### Scenario: Seed generates consistent cycle data
- **WHEN** test uses seed 12345 to generate cycle data
- **WHEN** same test runs again with same seed
- **THEN** cycle dates, BBT values, and phases are identical
