Fixtures guide

Fixtures provide deterministic inputs for tests.

- Store JSON, HTTP recordings, and sample DB dumps under docs/testing/fixtures or under package-specific fixtures/ directories.
- Keep fixtures small and well-named; prefer realistic but minimal data.
- Do not store secrets in fixtures.
- When fixtures are updated, include a note in the test commit explaining why.