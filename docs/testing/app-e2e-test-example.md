App end-to-end (E2E) test example

E2E tests for the sinto-app should exercise user flows in an environment close to production.

- Use Playwright or Cypress depending on project conventions.
- Start the app in a test mode (test database, mock external APIs) before running tests.
- Keep each E2E test focused on a single user story and idempotent.

Checklist:
- Seed DB with known data
- Run server on ephemeral port
- Run browser automation to perform user actions and assertions
- Tear down server and DB after tests complete