API unit test example

This file documents a minimal unit test pattern for the sinto-api project.

- Use the project's test runner (jest/mocha) as configured in package.json.
- Mock only external services (HTTP, DB) with recorded fixtures where appropriate.

Example structure:

1. Arrange: create input, mock dependencies.
2. Act: call the exported function/handler.
3. Assert: verify return value, side effects, and that mocks were called as expected.

See the package's tests/ directory for concrete examples.