## ADDED Requirements

### Requirement: End-to-end tests for critical user journeys
The sinto-app frontend SHALL have e2e tests for critical user flows (registration, cycle management, logging, fertility prediction) using Playwright or similar e2e framework.

#### Scenario: User registration flow
- **WHEN** user navigates to app homepage
- **THEN** "Sign up" button is visible
- **WHEN** user clicks "Sign up"
- **THEN** registration form is displayed with fields: name, email, password, confirm password
- **WHEN** user fills form with: name=Jane Doe, email=jane@example.com, password=Pass123!
- **WHEN** user submits form
- **THEN** API call is made to `/auth/register`
- **THEN** user is redirected to dashboard
- **THEN** "Welcome Jane Doe" message is displayed

#### Scenario: User login flow
- **WHEN** user navigates to login page
- **THEN** login form is displayed with email and password fields
- **WHEN** user enters registered email and password
- **WHEN** user submits form
- **THEN** API call is made to `/auth/login`
- **THEN** user is redirected to dashboard
- **THEN** user profile shows logged-in email

#### Scenario: Start first cycle
- **WHEN** logged-in user views dashboard
- **THEN** "Start cycle" button is visible
- **WHEN** user clicks "Start cycle"
- **THEN** date picker is displayed defaulting to today
- **WHEN** user submits
- **THEN** API call is made to POST `/cycles`
- **THEN** dashboard now shows cycle information (start date, current phase)

#### Scenario: Log daily data
- **WHEN** user is on dashboard with active cycle
- **THEN** "Log today" button is visible
- **WHEN** user clicks "Log today"
- **THEN** log form is displayed with fields: BBT, mucus, mood, symptoms
- **WHEN** user fills form: BBT=36.5, mucus=STRETCHY, mood=HAPPY, symptoms=[NONE]
- **WHEN** user submits
- **THEN** API call is made to POST `/cycles/:id/logs`
- **THEN** form closes and success message is displayed
- **THEN** today appears in calendar view

#### Scenario: View calendar with marked cycle phases
- **WHEN** user views calendar page with active cycle (15 days of logs)
- **THEN** calendar displays 3 months
- **THEN** menstruation days (1-5) are marked with 🔴 symbol
- **THEN** fertile window days (13-17) are marked with ◈ symbol
- **THEN** today is highlighted with different background color

#### Scenario: View fertility prediction
- **WHEN** user navigates to prediction page with cycle having 20+ days of data
- **THEN** fertile window dates are displayed
- **THEN** probability table shows 28 days with daily pregnancy probability
- **THEN** confidence level (LOW/MEDIUM/HIGH) is displayed based on data completeness

#### Scenario: View phase guide
- **WHEN** user navigates to phase guide page on FOLLICULAR phase
- **THEN** phase name is displayed prominently
- **THEN** content is organized in 5 categories: GENERAL, EXERCISE, NUTRITION, TIPS, DANGERS
- **WHEN** user clicks on a category
- **THEN** content items are displayed for that category

#### Scenario: Update cycle information
- **WHEN** user opens active cycle details
- **THEN** cycle dates and status are displayed
- **WHEN** user clicks "Edit"
- **THEN** edit form is displayed
- **WHEN** user changes end date and submits
- **THEN** API call is made to PATCH `/cycles/:id`
- **THEN** cycle status changes to COMPLETED
- **THEN** dashboard no longer shows it as active

### Requirement: E2E framework configuration
The sinto-app e2e tests SHALL use Playwright (or equivalent) with headless browser execution, proper waits, and screenshot capture on failures.

#### Scenario: Tests run headless in CI/CD
- **WHEN** e2e tests are executed with `npm run test:e2e`
- **THEN** browser runs in headless mode (no visible window)
- **THEN** all tests complete within timeout (30s per test)

#### Scenario: Screenshots captured on failure
- **WHEN** e2e test fails (assertion error)
- **THEN** screenshot of failure state is saved to `test-results/`
- **THEN** screenshot filename includes test name and timestamp

#### Scenario: Network requests are validated
- **WHEN** e2e test runs
- **THEN** test framework can assert on API request payloads (method, URL, headers, body)
- **THEN** test can mock API responses or intercept real requests

### Requirement: E2E tests for responsive design
E2E tests SHALL verify that critical flows work on mobile (375px width) and desktop (1920px width) viewports.

#### Scenario: Registration form is usable on mobile
- **WHEN** e2e test runs on mobile viewport (375px)
- **WHEN** user completes registration flow
- **THEN** form fields are visible and clickable
- **THEN** virtual keyboard does not obscure submit button
- **THEN** all text is readable (no overflow)

#### Scenario: Calendar view is responsive
- **WHEN** user views calendar on mobile viewport
- **THEN** calendar displays 1 month at a time (not 3)
- **WHEN** user swipes left/right
- **THEN** calendar navigates to previous/next month

#### Scenario: Dashboard layout adapts to viewport
- **WHEN** dashboard is viewed on desktop (1920px)
- **THEN** phase badge, probability bar, and cycle info are in row layout
- **WHEN** same dashboard is viewed on mobile (375px)
- **THEN** components stack vertically

### Requirement: E2E tests for error states
E2E tests SHALL verify that errors from the API are displayed clearly to the user.

#### Scenario: Network error shows user-friendly message
- **WHEN** API is down (no response)
- **WHEN** user tries to log in
- **THEN** "Connection error. Please try again later." is displayed
- **THEN** user can retry without re-entering form

#### Scenario: Invalid token shows logout prompt
- **WHEN** stored auth token is invalid/expired
- **WHEN** user navigates to dashboard
- **THEN** user is redirected to login
- **THEN** message "Your session expired. Please log in again." is displayed

#### Scenario: Server validation error displays field-level feedback
- **WHEN** user submits log with invalid BBT (e.g., BBT=999)
- **THEN** error message appears near BBT field: "Temperature must be between 35 and 38 °C"
- **THEN** form is not cleared (user can correct)

### Requirement: E2E test data setup and teardown
E2E tests SHALL use API fixtures to set up known test states and clean up after each test.

#### Scenario: Test setup creates user and cycle via API
- **WHEN** e2e test starts
- **THEN** setup phase calls `/auth/register` to create test user
- **THEN** setup phase calls POST `/cycles` to create test cycle
- **WHEN** test runs
- **THEN** test starts with known initial state (active cycle, no logs)

#### Scenario: Test teardown deletes test data
- **WHEN** e2e test completes
- **THEN** teardown phase calls DELETE `/cycles/:id` to remove test cycle
- **WHEN** next test runs
- **THEN** database is clean (test user's old data is gone)

### Requirement: E2E tests for accessibility
E2E tests SHALL verify basic accessibility requirements (WCAG 2.1 Level AA).

#### Scenario: Navigation is keyboard-accessible
- **WHEN** user navigates app using only keyboard (Tab, Enter, Arrow keys)
- **THEN** all interactive elements are reachable
- **THEN** focus is visible at all times

#### Scenario: Forms have accessible labels
- **WHEN** e2e test inspects form fields
- **THEN** each input has associated `<label>` element or `aria-label`
- **THEN** form validation errors are announced to screen readers
