---
name: sinto-expert
description: >
  Expert agent for the Sinto App — a menstrual cycle tracker using the Symptothermal Method.
  Use this skill when the user asks about the CLI (sinto-cli), the API (sinto-api), the database
  schema, algorithm logic, or wants to test/debug the application interactively.
---

# Sinto Expert

You are an expert on the Sinto App codebase. When this skill is invoked, assist the user with
tasks related to the CLI, API, database, algorithm, or TUI. $ARGUMENTS

---

## System Overview

Sinto App is a **menstrual cycle tracker** implementing the Symptothermal Method. It consists of:

| Component | Tech | Location |
|---|---|---|
| `sinto-api` | Fastify 5, Prisma 7, PostgreSQL, Redis, TypeScript | `sinto-api/` |
| `sinto-cli` | Commander.js, @clack/prompts, picocolors, TypeScript | `sinto-cli/` |

---

## Running the System

```bash
# Start the API (requires Docker for Postgres + Redis)
cd sinto-api && make dev          # runs on :3000

# Run the TUI (no args = interactive mode)
cd sinto-cli && npm run dev

# Run CLI commands
cd sinto-cli && npm run dev -- <command>
```

**Prerequisites:** Docker containers for `sinto_postgres` (port 5433) and `sinto_redis` (port 6379).
Check with `docker ps`. Start with `cd sinto-api && make up`.

---

## API Endpoints

### Auth (no auth required)
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create account → returns accessToken + refreshToken |
| POST | `/auth/login` | Login → returns accessToken + refreshToken |
| POST | `/auth/refresh` | Refresh tokens |
| POST | `/auth/logout` | Blacklist refresh token |

### Cycles (auth required)
| Method | Path | Description |
|---|---|---|
| GET | `/cycles` | List all cycles |
| POST | `/cycles` | Start a new cycle |
| GET | `/cycles/:id` | Get cycle with logs |
| PATCH | `/cycles/:id` | Update cycle (endDate, cycleLength) |
| DELETE | `/cycles/:id` | Delete cycle |

### Daily Logs (auth required)
| Method | Path | Description |
|---|---|---|
| GET | `/cycles/:id/logs` | List logs for a cycle |
| POST | `/cycles/:id/logs` | Create daily log (BBT, mucus, mood, symptoms) |
| GET | `/cycles/:id/logs/:logId` | Get single log |
| PATCH | `/cycles/:id/logs/:logId` | Update log |

### Algorithm (auth required)
| Method | Path | Description |
|---|---|---|
| GET | `/cycles/:id/prediction` | Fertile window + daily probability table |
| GET | `/phases/current?cycleId=:id` | Current phase name + cycle day + content |

### Users (auth required)
| Method | Path | Description |
|---|---|---|
| GET | `/users/me` | Get own profile |
| PATCH | `/users/me` | Update profile |
| GET | `/users/:username` | Get public profile |

### Phases (auth required)
| Method | Path | Description |
|---|---|---|
| GET | `/phases` | List phases with content counts |
| GET | `/phases/:name` | Get phase content by category |

### Notifications (auth required)
| Method | Path | Description |
|---|---|---|
| GET | `/notifications` | List notifications |
| POST | `/notifications` | Create notification |
| DELETE | `/notifications/:id` | Delete notification |

---

## CLI Commands

Invoke with `npm run dev -- <command>` from `sinto-cli/`, or just `npm run dev` for the TUI.

```
sinto register          # Create account (prompts name, email, password)
sinto login             # Login (prompts email, password)
sinto me                # Show profile
sinto cycle list        # List cycles
sinto cycle start       # Start a new cycle
sinto cycle show        # Show current cycle details
sinto cycle use <id>    # Set active cycle
sinto cycle close       # Close current cycle
sinto cycle delete      # Delete a cycle
sinto log add           # Log today (BBT, mucus, mood, symptoms)
sinto log list          # List logs for active cycle
sinto phase             # Show current phase + guide
sinto predict           # Show fertile window and probability table
```

Credentials are stored at `~/.sinto/credentials.json` (accessToken, refreshToken, email, activeCycleId).

---

## TUI Flows

Launching `npm run dev` (no args) opens the interactive TUI:
- **Dashboard** — phase badge, probability bar, fertility status, account info
- **Log today** → `log-flow.ts` — prompts BBT; if menstruating: flow level/color/consistency; else: mood, mucus type/quality, multi-select symptoms
- **Calendar** → `calendar-flow.ts` — renders up to 3 months; 🔴 menstruating, ◈ fertile, today highlighted
- **Phase guide** → `phase-flow.ts` — content by category: GENERAL, EXERCISE, NUTRITION, TIPS, DANGERS
- **Fertility prediction** → `predict-flow.ts` — fertile window dates + daily probability table
- **Manage cycles** → `cycle-flow.ts` — list, start, show, close, use, delete

---

## Database Schema (key relations)

```
User ──< Cycle ──< DailyLog ──< MenstrualLog
                            └─< SymptomLog
User ──< Notification
User ──< Device
User ──o CycleStatistics
PhaseContent (standalone, seeded in Spanish)
```

Key enums: `Phase` (MENSTRUAL, FOLLICULAR, OVULATORY, LUTEAL), `MucusQuality` (NONE→PEAK),
`Symptom` (9 values), `ContentCategory` (5 values).

---

## Algorithm Logic

Located in `sinto-api/src/modules/algorithm/`:

- **`fertile-window.ts`** — pure functions:
  - `detectBBTRise(days)` — finds 0.2°C rise sustained over 3 days above 6-temp baseline
  - `detectPeakMucus(days)` — finds last day of PEAK mucus quality
  - `calculateFertileWindow(days)` — combines BBT + mucus to compute fertile window
  - `analyzeTempTrend(days, bbtRiseDay)` — returns `TempTrend` (rising/stable/falling/post-shift)

- **`algorithm.service.ts`** — `getCyclePrediction(userId, cycleId)` — aggregates prediction:
  - Current phase + day in phase
  - Expected ovulation date + days until
  - Fertile window dates + isCurrentlyFertile
  - Next menstruation estimate
  - Confidence level (low/medium/high based on data completeness)

- **`pregnancy-probability.ts`** — `calculateDailyProbabilities(days)` — probability curve:
  - 0.30 day before ovulation, 0.25 on ovulation day, tapering before/after

---

## Key Files

| File | Purpose |
|---|---|
| `sinto-api/src/app.ts` | Fastify app builder, plugin registration |
| `sinto-api/src/shared/utils/prisma.ts` | Singleton PrismaClient with PrismaPg adapter |
| `sinto-api/src/shared/utils/redis.ts` | Singleton ioredis client |
| `sinto-api/src/shared/middleware/authGuard.ts` | JWT preHandler hook |
| `sinto-api/src/shared/errors/AppError.ts` | Domain error class |
| `sinto-api/prisma/schema.prisma` | Full DB schema |
| `sinto-cli/src/index.ts` | CLI entry point + TUI launcher |
| `sinto-cli/src/lib/credentials.ts` | ~/.sinto/credentials.json R/W |
| `sinto-cli/src/lib/api.ts` | Typed fetch wrapper (apiGet/apiPost/apiPatch/apiDelete) |
| `sinto-cli/src/tui/app.ts` | TUI main loop |

---

## Common Issues & Fixes

| Symptom | Fix |
|---|---|
| `DATABASE_URL` undefined at startup | `import 'dotenv/config'` must be first line in `server.ts` |
| `PrismaClient needs non-empty options` | Use `PrismaPg` adapter — see `src/shared/utils/prisma.ts` |
| Port 5432 conflict | sinto uses port 5433 for Postgres (mapped in docker-compose) |
| `symptoms: true` in Prisma include | Symptom is scalar enum array, not a relation — cannot include |
| CLI shows Commander default help | Launch with no args for TUI; `--help` shows custom banner |
| `cycleDay` vs `day` in phase response | API returns `cycleDay`, not `day` |
| `content` is object not array | `/phases/:name` returns `Record<string, ContentItem[]>`, iterate with `categoryOrder.forEach` |
| `/cycles/:id/predict` 404 | Correct path is `/cycles/:id/prediction` |
| `/cycles/:id/current-phase` 404 | Correct path is `/phases/current?cycleId=:id` |

---

## E2E Test Recipe

```bash
# 1. Start infrastructure
cd sinto-api && make up          # starts postgres:5433 + redis:6379

# 2. Start API
npm run dev > /tmp/sinto-api.log 2>&1 &
curl -s http://localhost:3000/health   # expect {"status":"ok"}

# 3. Register + login
TOKEN=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Pass123!"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# 4. Start cycle
CYCLE_ID=$(curl -s -X POST http://localhost:3000/cycles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2026-03-05"}' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# 5. Add logs (see docs for full 28-day seed script)

# 6. Verify algorithm
curl -s "http://localhost:3000/cycles/$CYCLE_ID/prediction" \
  -H "Authorization: Bearer $TOKEN"

# 7. Verify phase
curl -s "http://localhost:3000/phases/current?cycleId=$CYCLE_ID" \
  -H "Authorization: Bearer $TOKEN"

# 8. Logout + verify blacklist
REFRESH=<refresh_token>
curl -s -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" -d "{\"refreshToken\":\"$REFRESH\"}"
curl -s -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" -d "{\"refreshToken\":\"$REFRESH\"}"
# ^ should return 401
```
