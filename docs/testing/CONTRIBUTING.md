Testing contribution guidelines

This document contains guidance for contributing tests to the repository.

- Follow existing test patterns in the target package (sinto-api, sinto-cli, sinto-app).
- Add unit tests for logic, integration tests for cross-module behavior, and e2e tests for user flows.
- Keep fixtures under docs/testing/fixtures or the package's __tests__/fixtures.
- Write clear, isolated tests with deterministic setup/teardown.
- Run tests locally before opening a PR: see running-tests-locally.md

When submitting a PR:
- Include test results and coverage summary in the PR description.
- Mark any flaky tests with [flaky] and provide steps to reproduce.
- If adding CI changes, explain why and how it affects workflows.