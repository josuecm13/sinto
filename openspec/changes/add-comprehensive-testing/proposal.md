## Why

The Sinto App spans three interconnected projects (sinto-api, sinto-cli, sinto-app) with no comprehensive test coverage. This creates risk in release cycles, makes refactoring brittle, and limits confidence in the Symptothermal Method algorithm correctness. A rigorous, multi-level testing strategy (unit → integration → e2e) is needed to ensure reliability and enable safe evolution of the codebase.

## What Changes

- **sinto-api**: Add unit tests for all services, controllers, and algorithm logic; add integration tests for auth flows and cycle management endpoints
- **sinto-cli**: Add integration tests for all CLI commands and TUI flows with mocked API responses
- **sinto-app**: Add e2e tests for critical user journeys (registration, cycle logging, fertility prediction)
- **Test Infrastructure**: Create shared testing utilities, fixtures, CI/CD pipelines, and test data generators across all projects

## Capabilities

### New Capabilities

- `api-unit-tests`: Unit testing framework and test suites for sinto-api (services, controllers, utilities, algorithm logic)
- `api-integration-tests`: Integration tests for sinto-api endpoints (auth, cycles, logs, prediction, phases)
- `cli-integration-tests`: Integration testing for sinto-cli commands and TUI flows with mocked API
- `app-e2e-tests`: End-to-end testing for sinto-app critical user paths (onboarding, cycle management, prediction)
- `test-infrastructure`: Shared testing utilities, fixtures, Docker test containers, CI/CD pipeline integration, and test data generators

### Modified Capabilities

<!-- No existing capabilities have requirement changes; this is pure addition -->

## Impact

- **Affected Projects**: sinto-api, sinto-cli, sinto-app
- **Dependencies**: Jest (test runner), Supertest (API testing), Vitest (lightweight unit tests), Docker (test containers)
- **CI/CD**: GitHub Actions workflows for automated test runs on PRs and main branch
- **Development**: All engineers must write tests for new code; test coverage reporting will be tracked
