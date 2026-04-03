## ADDED Requirements

### Requirement: Integration tests for authentication endpoints
The sinto-api authentication endpoints (register, login, refresh, logout) SHALL be tested end-to-end with a real in-memory database.

#### Scenario: Register endpoint creates user
- **WHEN** test sends POST to `/auth/register` with valid email, name, password
- **THEN** response status is 201
- **THEN** response includes `accessToken` and `refreshToken`
- **THEN** user is created in database with hashed password

#### Scenario: Login endpoint returns tokens
- **WHEN** test sends POST to `/auth/login` with registered email and correct password
- **THEN** response status is 200
- **THEN** response includes `accessToken` and `refreshToken`

#### Scenario: Login rejects invalid password
- **WHEN** test sends POST to `/auth/login` with registered email and wrong password
- **THEN** response status is 401
- **THEN** response includes error message

#### Scenario: Refresh endpoint validates refresh token
- **WHEN** test sends POST to `/auth/refresh` with valid refresh token
- **THEN** response status is 200
- **THEN** response includes new `accessToken`

#### Scenario: Logout invalidates refresh token
- **WHEN** test sends POST to `/auth/logout` with valid refresh token
- **THEN** response status is 200
- **WHEN** test attempts to refresh with same token
- **THEN** response status is 401

### Requirement: Integration tests for cycle endpoints
The sinto-api cycle endpoints (create, list, get, update, delete) SHALL be tested with authenticated requests against a real database.

#### Scenario: Create cycle with valid token
- **WHEN** test sends POST to `/cycles` with auth bearer token and startDate
- **THEN** response status is 201
- **THEN** response includes cycle with id, startDate, status=ACTIVE

#### Scenario: List cycles requires authentication
- **WHEN** test sends GET to `/cycles` without auth token
- **THEN** response status is 401

#### Scenario: List cycles returns user's cycles
- **WHEN** test sends GET to `/cycles` with valid auth token (user with 3 cycles)
- **THEN** response status is 200
- **THEN** response includes array of exactly 3 cycles

#### Scenario: Get single cycle with logs
- **WHEN** test sends GET to `/cycles/:id` with valid auth token
- **THEN** response includes cycle with nested logs array
- **THEN** logs are sorted by date ascending

#### Scenario: Update cycle end date
- **WHEN** test sends PATCH to `/cycles/:id` with endDate
- **THEN** response status is 200
- **THEN** response cycle has updated endDate and status=COMPLETED

#### Scenario: Delete cycle removes logs
- **WHEN** test sends DELETE to `/cycles/:id` with valid auth token
- **THEN** response status is 204
- **WHEN** test sends GET to `/cycles/:id`
- **THEN** response status is 404

### Requirement: Integration tests for daily log endpoints
The sinto-api daily log endpoints (create, list, get, update) SHALL be tested with cycle context and various log types.

#### Scenario: Create menstrual log during menstruation phase
- **WHEN** test sends POST to `/cycles/:id/logs` during menstruation with flow level and color
- **THEN** response status is 201
- **THEN** response includes log with menstrualLog sub-object

#### Scenario: Create fertility log with BBT, mucus, mood
- **WHEN** test sends POST to `/cycles/:id/logs` on cycle day 10 with BBT=36.5, mucus=STRETCHY, mood=HAPPY
- **THEN** response status is 201
- **THEN** response includes log with all fields populated

#### Scenario: Create log with symptom array
- **WHEN** test sends POST to `/cycles/:id/logs` with symptoms=[CRAMPS, BREAST_TENDERNESS]
- **THEN** response status is 201
- **THEN** log stored with symptom array

#### Scenario: List logs for cycle
- **WHEN** test sends GET to `/cycles/:id/logs`
- **THEN** response returns all logs for that cycle sorted by date

### Requirement: Integration tests for prediction endpoint
The sinto-api prediction endpoint SHALL return correct fertile window and probability calculations based on logged data.

#### Scenario: Prediction endpoint with 28-day cycle data
- **WHEN** test seeds complete 28-day cycle with BBT rise on day 15, peak mucus day 13
- **WHEN** test sends GET to `/cycles/:id/prediction`
- **THEN** response includes fertile window dates
- **THEN** response includes daily probability table with 0-1 values

#### Scenario: Prediction endpoint with incomplete data
- **WHEN** test seeds cycle with only 5 days of logs (no BBT rise detected yet)
- **WHEN** test sends GET to `/cycles/:id/prediction`
- **THEN** response includes prediction with confidence=LOW
- **THEN** fertile window is estimated based on average cycle length

### Requirement: Integration tests for phase endpoint
The sinto-api phase endpoint SHALL correctly identify current cycle phase and return localized content.

#### Scenario: Current phase endpoint returns MENSTRUAL
- **WHEN** test seeds cycle with logs day 1-5 showing menstruation
- **WHEN** test sends GET to `/phases/current?cycleId=:id`
- **THEN** response includes phase=MENSTRUAL, cycleDay=3

#### Scenario: Phase content endpoint returns categories
- **WHEN** test sends GET to `/phases/FOLLICULAR`
- **THEN** response is object with keys: GENERAL, EXERCISE, NUTRITION, TIPS, DANGERS
- **THEN** each category contains array of ContentItem objects

### Requirement: Integration tests use containerized database
Integration tests SHALL use Docker containers for PostgreSQL and Redis to ensure test isolation and reproducibility.

#### Scenario: Test suite starts fresh database
- **WHEN** test suite runs with `docker-compose -f docker-compose.test.yml up`
- **THEN** fresh PostgreSQL container starts on port 5434 (test port)
- **THEN** all tests run against clean database
- **WHEN** test suite completes
- **THEN** containers are cleaned up automatically

### Requirement: Integration tests verify error handling
Integration tests SHALL verify that API returns correct error codes and messages for invalid inputs.

#### Scenario: Invalid email format returns 400
- **WHEN** test sends POST to `/auth/register` with email="invalid"
- **THEN** response status is 400
- **THEN** response body includes error message about invalid email

#### Scenario: Duplicate email returns 409
- **WHEN** test registers user with email="test@example.com"
- **WHEN** test attempts to register again with same email
- **THEN** response status is 409
- **THEN** response error code is `USER_EXISTS`
