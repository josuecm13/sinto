Contribution guide

Pre-commit hooks
----------------
This repository includes a Husky pre-commit hook (located at ./sinto-app/.husky/pre-commit) that runs "affected" tests to keep commits fast and focused.

What the hook does:
- Runs any staged test files directly (e.g., *.test.tsx).
- If no test files are staged, it runs the test script for top-level packages that contain changed files (e.g., sinto-app/, sinto-api/, sinto-cli/).
- Warns when new source files are added without nearby tests. By default this is a warning; to make it fail the commit set STRICT_COVERAGE=1 in your environment (e.g., "export STRICT_COVERAGE=1").

Developer tips:
- Keep tests close to implementation files so the hook can run only the affected tests.
- If the hook is too strict locally you can bypass it by setting STRICT_COVERAGE=0 or by using "git commit --no-verify" (not recommended for CI-affecting changes).
