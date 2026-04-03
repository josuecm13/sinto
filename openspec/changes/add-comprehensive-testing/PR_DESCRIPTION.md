PR: Add comprehensive testing infra (vitest, Playwright, CI workflows, coverage)

Summary

This PR bundles the testing infrastructure implemented under the OpenSpec change `add-comprehensive-testing`:
- Vitest-based unit/integration tests for sinto-api and sinto-cli
- Playwright e2e smoke tests for sinto-app plus Playwright install/config
- GitHub Actions workflows for api/cli/app-e2e
- Codecov config and docs/testing/* guidance
- Husky pre-commit hook to run affected tests

What remains (requires repo admin / remote access)

1. Push this branch to the remote and open a PR so GitHub Actions can run.
2. Add CODECOV_TOKEN to repository secrets (Settings → Secrets → Actions) to enable coverage upload.
3. Optionally add a CODECOV_REPO_TOKEN or set up Codecov app integration if preferred.
4. Configure branch protection rules to require the test workflows:
   - Require status checks to pass before merge: .github/workflows/test-api.yml, test-cli.yml, test-app-e2e.yml
   - Require PR reviews as per team policy
5. If Playwright should run against a staging environment, add E2E_BASE_URL and any staging credentials as secrets.
6. If self-hosted runners are needed, configure and register them for longer-running Playwright jobs.

How to validate (for reviewer / admin)

- Push branch and open PR. Confirm Actions start and jobs for api/cli/app-e2e run.
- Check Codecov upload step — if it fails, verify CODECOV_TOKEN secret presence.
- Review test results and confirm coverage thresholds (docs/testing/coverage-guidelines.md).

Suggested reviewers and labels

- Reviewers: @backend-team, @cli-team, @frontend-team
- Labels: testing, infra, ci

Notes

- All tests were executed locally in this environment: api Vitest (49 passed), cli Vitest (8 passed), app Playwright (2 passed).
- This branch is safe to push; no production code changes were made beyond test infra and docs.
