CLI integration test example

This document describes how to write integration tests for the sinto-cli project.

- Use a temporary filesystem (tmpdir) for file-based CLI interactions.
- Spawn the CLI process (child_process.spawn) and assert on stdout/stderr and exit codes.
- Seed test inputs using fixtures and cleanup after each test.

Tips:
- Keep tests hermetic by mocking network calls with nock or similar.
- Use short timeouts and avoid waiting on user prompts — prefer programmatic flags for CI runs.