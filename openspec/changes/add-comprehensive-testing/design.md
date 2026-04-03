## Context

The Sinto App consists of three interconnected projects with no test coverage. Sinto-api is a Fastify 5 service with Prisma 7 ORM and complex algorithm logic. Sinto-cli is a Commander.js CLI with TUI flows built on @clack/prompts. Sinto-app is a frontend (likely React/Vue) consuming the API. Each has different testing needs: api requires unit + integration (algorithm correctness), cli requires integration with mocked API, app requires e2e for user flows. Current constraint: no existing test infrastructure, no CI/CD pipelines defined.

## Goals / Non-Goals

**Goals:**
- Establish Jest + Vitest as unified test runners across all projects
- Create reusable test fixtures and mocking utilities (API responses, database states, crypto seeds)
- Implement >80% code coverage target for sinto-api core logic (auth, cycles, algorithm)
- Enable safe refactoring through comprehensive algorithmic tests (fertile window, phase calculation)
- Set up CI/CD pipelines (GitHub Actions) to run tests on PR and main branch
- Provide clear testing guidelines and patterns for future development
- Orchestrator-driven workflow using Planner (strategy) and Coder (implementation)

**Non-Goals:**
- Visual regression testing or screenshot diffing (sinto-app)
- Load testing or stress testing
- Manual QA documentation
- Real database migrations in CI (use test containers instead)
- 100% coverage (diminishing returns; focus on critical paths)

## Decisions

### 1. Test Runner Strategy
**Decision:** Jest for sinto-api (standard for Node + Fastify ecosystem), Vitest for sinto-cli (faster, lighter, works with Commander.js). Frontend testing deferred to sinto-app specs.
**Rationale:** Jest is battle-tested with Fastify; Vitest is faster for CLI unit tests. Reduces maintenance burden vs. one-size-fits-all.
**Alternatives:** Mocha (more verbose), AVA (overkill for this scale).

### 2. Test Fixtures & Data
**Decision:** Create shared `test-fixtures/` directory with:
- `database/`: Prisma seeding scripts for test states (empty user, user with cycles, complete 28-day cycle)
- `api-responses/`: Mock API response templates for CLI testing
- `crypto/`: Deterministic seeding for auth token generation
**Rationale:** Avoids test duplication, ensures consistent test data across projects.
**Alternatives:** Factories (more complex), inline mocking (brittle).

### 3. Algorithm Test Coverage
**Decision:** Unit tests for all functions in `sinto-api/src/modules/algorithm/` with historical cycle data (28-day, 35-day, short cycle). Include edge cases: no BBT data, missing mucus peak.
**Rationale:** Algorithm correctness is mission-critical (affects fertility prediction). Historical data makes tests reproducible.
**Alternatives:** Skip algorithm tests (risky), use only happy-path cases (misses edge cases).

### 4. CLI Integration Testing
**Decision:** Mock the sinto-api via stub HTTP server (Nock library) in test suite. Test each command independently + full TUI flow (dashboard → log → predict).
**Rationale:** Avoids spinning up real API during tests; keeps tests fast. TUI is complex, needs end-to-end validation.
**Alternatives:** Use real API (slow, flaky), skip TUI tests (black box risk).

### 5. CI/CD Integration
**Decision:** GitHub Actions workflows: `.github/workflows/test-api.yml`, `.github/workflows/test-cli.yml`, `.github/workflows/test-app.yml`. Run on PR and merge to main. Publish coverage reports via Codecov.
**Rationale:** Prevents regressions from merging. Coverage reports track progress toward goals.
**Alternatives:** GitLab CI (repo is on GitHub), Jenkins (overkill).

### 6. Orchestration Model
**Decision:** Planner defines strategy (which projects, which test levels, coverage targets). Coder implements tests sequentially: api → cli → app. Each project is independent until integration tests.
**Rationale:** Allows Planner to scope work (e.g., "api is critical, cli is nice-to-have") without blocking coder. Each project can be reviewed separately.
**Alternatives:** Big-bang (all projects at once, harder to debug), waterfall (less parallelizable).

## Risks / Trade-offs

- **Risk:** Test suite grows slowly and falls behind code changes → Mitigation: Enforce test-first on new features; add pre-commit hook to fail if tests are missing.
- **Risk:** Mocking sinto-api for CLI tests diverges from real behavior → Mitigation: Keep mock responses in sync with API schema; run occasional "real" integration tests on staging.
- **Risk:** Algorithm tests with historical data become brittle → Mitigation: Document why each test case exists; allow updates when behavior intentionally changes.
- **Risk:** CI/CD pipelines slow down PRs → Mitigation: Run test subsets on PR (fail-fast), full suite only on merge.
- **Trade-off:** Vitest vs Jest means two test runners → Benefit: Optimizes for each project's needs; cost is marginal (both are npm install).

## Migration Plan

1. **Phase 1 (Week 1):** Set up Jest + Vitest, create test-fixtures directory, implement API unit tests (auth, cycles).
2. **Phase 2 (Week 2):** Implement API integration tests + algorithm tests; set up sinto-api CI/CD.
3. **Phase 3 (Week 3):** Implement CLI integration tests with mocked API + CI/CD.
4. **Phase 4 (Week 4):** Implement sinto-app e2e tests + full CI/CD.
5. **Rollout:** Document testing guidelines in CONTRIBUTING.md; enforce tests on all future PRs.

**Rollback:** Disable test jobs in CI/CD if blocking. All test code can be removed without affecting production (tests live in `/test` or `*.test.ts` files, not in prod bundle).

## Open Questions

- What e2e testing framework for sinto-app? (Playwright, Cypress, Selenium?)
- Should algorithm tests include statistical validation (e.g., fertility probability distribution)?
- Coverage thresholds: per-file or project-wide?
- Who reviews test code? Same standards as production code?
