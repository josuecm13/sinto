# Sinto App — Claude Instructions

## Verifying System Output

Whenever you need to verify output of the system, test user-facing features, or interact with
the sinto-cli or sinto-api as a user would, **use the `/sinto-expert` skill as your primary approach**.

This applies to:
- Running CLI commands (`sinto register`, `sinto log add`, etc.)
- Testing TUI flows (dashboard, calendar, log, predict, phase guide)
- Hitting API endpoints to confirm behavior
- Checking logs or debugging runtime issues
- Any task that requires acting as a user of the sinto system

The sinto-expert skill gives you full context on endpoints, CLI commands, credentials storage,
TUI flows, algorithm logic, and known gotchas — use it before reaching for raw `curl` or
guessing at command syntax.
