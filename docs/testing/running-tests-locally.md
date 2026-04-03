Running tests locally

General steps to run tests across the monorepo:

1. Install dependencies for each package:
   - cd sinto-api && npm ci
   - cd ../sinto-cli && npm ci
   - cd ../sinto-app && npm ci

2. Run tests in each package:
   - cd sinto-api && npm test
   - cd ../sinto-cli && npm test
   - cd ../sinto-app && npm test

If the repo uses a workspace manager (pnpm, yarn workspaces), prefer the workspace runner:
- npm run test --workspaces
- pnpm -w test

If you encounter environment-specific failures, consult the package README and the tests in the package to determine setup steps.