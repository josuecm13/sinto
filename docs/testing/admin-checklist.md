Admin checklist to finish testing infrastructure

This checklist contains the minimal steps an administrator should perform to finalize CI and coverage integration for the `add-comprehensive-testing` OpenSpec change.

1. Push branch and open PR
   - git push -u origin test/all-tests-infra
   - Open PR against main with title: "chore(test): add comprehensive testing infra"

2. Add repository secrets
   - CODECOV_TOKEN: required for codecov uploads
   - E2E_BASE_URL: (optional) staging URL for Playwright tests
   - STAGING_USERNAME / STAGING_PASSWORD or other staging secrets if needed

3. Configure GitHub Actions & protection
   - In Settings → Branches → Branch protection rules:
     - Require status checks to pass before merge: select test-api, test-cli, test-app-e2e jobs
     - Optionally require PR reviews and up-to-date branches

4. Enable Codecov (if using token)
   - Ensure CODECOV_TOKEN is set in secrets
   - Optionally install Codecov GitHub app to get PR comments and commit statuses

5. Optionally run workflows locally for debugging
   - Use act (https://github.com/nektos/act) to run CI jobs locally
   - Or use a self-hosted runner for Playwright heavy jobs

6. Merge and monitor
   - Once workflows pass, merge PR and watch Codecov for the first upload
   - If coverage thresholds fail, follow docs/testing/coverage-guidelines.md to triage

7. Communication
   - Announce on the team channel that testing infra is live and explain how to run tests locally
   - Share docs/testing/running-tests-locally.md and CONTRIBUTING.md changes

If any step is blocked (missing token, runner setup), contact the repo admin or SRE team.
