# Coverage Guidelines

Goal

- Ensure critical code paths (API core modules) maintain at least 80% coverage.
- Fail CI when coverage drops below thresholds; fail locally when running coverage scripts so developers fix regressions early.

Running coverage locally

For each package run the existing coverage script from the package root. Examples:

- API: 
  - cd sinto-api
  - npm run test:coverage

- CLI:
  - cd sinto-cli
  - npm run test:coverage

- Web app:
  - cd sinto-app
  - npm run test:coverage

Notes

- The vitest configs are set to use the V8 coverage provider and to emit an lcov report (lcov.info) which CI uploads to Codecov.
- To enable Codecov uploads in CI for private repos, add CODECOV_TOKEN as a secret in your CI provider (e.g., GitHub Actions secrets) and configure the Codecov uploader step.
- Coverage thresholds are configured in each package's vitest.config.ts; running the coverage script locally will exit non-zero if coverage is below the stated thresholds.

Codecov and CI

- Add the Codecov upload step to CI and ensure CODECOV_TOKEN is set for private repositories. Without a token, uploads may fail or be incomplete. This is a known blocker for full integration in private repos.

If you need help adding a GitHub Actions workflow to upload coverage reports, I can add a suggested workflow in a follow-up change.