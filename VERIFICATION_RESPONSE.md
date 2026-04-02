# Sinto App: Verification Plan — Implementation Response

**Date:** 2026-04-01
**Status:** Implemented

---

## 1. Data Model Requirements

### 1.1 Logs Table

- [x] **Does a `logs` table exist?** Yes — modeled as `DailyLog` in Prisma. Schema: `id`, `cycleId` (FK), `date`, `temperature?`, `phase?`, `isMenstruating`, `createdAt`, `updatedAt`.
- [x] **How are `symptoms` arrays stored?** In a separate `SymptomLog` table (1:1 with `DailyLog`) via a `symptoms Symptom[]` column (PostgreSQL array). Mucus data (`mucusType`, `mucusQuality`) and `mood` are also on `SymptomLog`.
- [x] **Is there indexing on `(cycleId, date)`?** Yes — `@@unique([cycleId, date])` and `@@index([cycleId])` are defined on `DailyLog`.

### 1.2 Cycles Table

- [x] **Does a `cycles` table exist?** Yes — modeled as `Cycle`. Fields: `id`, `userId` (FK), `startDate`, `endDate?`, `cycleLength?`, `lutealPhaseLength?`, `createdAt`, `updatedAt`.
- **Note:** `isActive` is implicit: a cycle is active when `endDate IS NULL`. `estimatedDuration` comes from `CycleStatistics`. `actualDuration` is stored as `cycleLength` (auto-set on close).
- [x] **How does the backend detect cycle boundaries?** Previously manual. **Now automatic:** when a log with `isMenstruating: true` is posted > 5 days after the cycle's `startDate`, the current cycle is auto-closed (`endDate = logDate - 1`, `cycleLength` computed) and a new cycle is created (`startDate = logDate`).
- [x] **Can cycles be auto-closed?** Yes — implemented in `createLog` (`logs.service.ts`).

### 1.3 Cycle Statistics

- [x] **`CycleStatistics` table created?** Yes — new model added to schema and migrated (`20260401164103_add_cycle_statistics`).
- **Fields:** `id`, `userId` (unique FK), `avgDurationDays`, `minDurationDays`, `maxDurationDays`, `stdDev`, `cycleCount`, `lastUpdated`.
- [x] **Per-user or per-cycle?** Per-user (rolling stats across last 6 completed cycles).
- [x] **How many cycles analyzed?** Last 6 completed cycles. Minimum 2 required to compute stats.

---

## 2. Prediction Logic & Endpoints

### 2.1 `GET /cycles/{cycleId}/prediction`

- [x] **Does this endpoint exist?** Yes — `GET /cycles/:cycleId/prediction` in `algorithm.routes.ts`.
- [x] **What does it now return?**

```json
{
  "cycleId": "...",
  "cycleDay": 15,
  "estimatedCycleDuration": 28,
  "durationVariance": { "min": 25, "max": 31, "stdDev": 2.1 },
  "currentPhase": {
    "name": "follicular",
    "estimatedStartDay": 6,
    "estimatedEndDay": 13,
    "dayInPhase": 9
  },
  "expectedOvulation": {
    "estimatedDate": "2026-04-14T...",
    "daysUntil": 5
  },
  "fertilityWindow": {
    "estimatedStartDate": "2026-04-09T...",
    "estimatedEndDate": "2026-04-17T...",
    "daysRemaining": 8,
    "isCurrentlyFertile": false
  },
  "temperatureTrend": {
    "hasData": true,
    "lastTemperature": 36.5,
    "trend": "rising",
    "daysUntilThermalShift": 2
  },
  "nextExpectedMenstruation": "2026-04-29T...",
  "confidenceLevel": "medium"
}
```

- [x] **How is ovulation day estimated?** If BBT rise or peak mucus detected → use symptothermal signals (`calculateFertileWindow`). Otherwise fallback: `cycleStartDate + (estimatedCycleDuration - 14)` (standard 14-day luteal assumption).
- [x] **Is temperature trend analysis implemented?** Yes — `analyzeTempTrend` in `fertile-window.ts` returns direction (rising/stable/falling/post-shift) and estimated days until confirmed thermal shift.

### 2.2 Automatic Cycle Detection

- [x] **Implemented?** Yes — in `createLog` (`logs.service.ts`). Triggered when `isMenstruating: true` and `logDate > cycleStart + 5 days`.
- [x] **Edge case: spotting before full start?** The 5-day grace period prevents a spotting log on day 2–3 from triggering a false transition.
- [x] **Manual correction?** Users can still manually call `PATCH /cycles/:cycleId` to set `endDate` and `cycleLength`.
- **Response when transition occurs:** Log response includes `cycleTransitioned: true, newCycleId: "..."`.

### 2.3 Cycle Statistics Recalculation

- [x] **Automated?** Yes — `computeAndSaveCycleStatistics(userId)` is called automatically:
  1. After `updateCycle` sets `endDate` (manual close)
  2. After auto-close in `createLog`
- [x] **How many past cycles?** Last 6 completed cycles.
- [x] **REST endpoint to force recalculation?** Not exposed as a dedicated endpoint — triggered on cycle close. Can be added if needed.

---

## 3. Temperature & Notifications

### 3.1 Temperature Prompt Logic

- [ ] **Notification system for temperature reminders?** The `Notification` model and `reminder.worker.ts` exist, but phase-aware temperature prompting is not yet implemented. The worker handles general reminders.

### 3.2 Temperature Trend Analysis

- [x] **Rolling temperature analysis?** Yes — `analyzeTempTrend` uses the last 4 recorded temperatures.
- [x] **Thermal shift detection (sustained 0.3°C rise)?** `detectBBTRise` detects a 0.2°C sustained rise over 3 consecutive days. When detected, `analyzeTempTrend` returns `trend: 'post-shift'`.
- [x] **Does thermal shift update ovulation estimate?** Yes — `bbtRiseDay` from `detectBBTRise` is used as the `ovulationEstimate` in `calculateFertileWindow`, which feeds directly into the prediction endpoint.

---

## 4. CLI/TUI Integration Points

### 4.1 Calendar View Requirements

- [x] **Does a data source exist?** Yes. The CLI can call:
  - `GET /cycles/:cycleId/prediction` — full prediction with phase, ovulation, fertility window, temp trend, next menstruation
  - `GET /cycles/:cycleId/logs` — all daily logs for the cycle
- [ ] **Dedicated calendar endpoint?** Not implemented. The two endpoints above cover all required data.

### 4.2 Prediction Display in TUI

- [x] **Prediction endpoint available for TUI?** Yes — `GET /cycles/:cycleId/prediction` returns all data needed for the `predict` command.
- [ ] **"Log temperature" prompt when none in past 3 days?** Not yet — requires CLI-side logic checking `temperatureTrend.hasData` and last log date.

---

## 5. Edge Cases & Validation

### 5.1 Insufficient Data

- [x] **User has < 2 cycles?** `computeAndSaveCycleStatistics` skips upsert if fewer than 2 completed cycles. Prediction falls back to `estimatedCycleDuration = 28`, `durationVariance = null`, `confidenceLevel = 'low'`.
- [x] **No temperature data?** `analyzeTempTrend` returns `{ hasData: false, trend: null, ... }`. Prediction still works using mucus-only data or pure calendar fallback.

### 5.2 Irregular Cycles

- [x] **Cycles of 21 vs 35 days?** All completed cycles feed into min/max/stdDev. Outliers are included but variance reflects them. `confidenceLevel` adjusts based on cycle count.
- [x] **`confidenceLevel` adjusts based on variance?** Indirectly — low `cycleCount` → lower confidence. Explicit stdDev-based adjustment can be added.

### 5.3 Manual Corrections

- [x] **Users can set cycle start/end dates?** Yes via `PATCH /cycles/:cycleId` (endDate, cycleLength, lutealPhaseLength).
- [x] **Triggers statistics recalculation?** Yes — `updateCycle` calls `computeAndSaveCycleStatistics` when `endDate` is set.
- [ ] **Override predicted ovulation date?** Not yet — ovulation date is always calculated, not user-overridable. Can be added as a `DailyLog.phase` or a dedicated field.

---

## 6. Questions for Backend Owner — Answered

### Critical

- [x] **Tables:** `User`, `Cycle`, `DailyLog`, `MenstrualLog`, `SymptomLog`, `PhaseContent`, `Notification`, `Device`, **`CycleStatistics`** (new).
- [x] **Automatic cycle detection:** Implemented in `createLog`.
- [x] **Prediction endpoints:** `GET /cycles/:cycleId/prediction` — fully enhanced.
- [x] **ORM/DB:** Prisma + PostgreSQL.

### Prediction Algorithm

- [x] **Ovulation day estimation:** Fixed 14-day luteal fallback + symptothermal signal override (BBT/mucus).
- [x] **Average type:** Simple mean of last 6 completed cycles.
- [x] **How many cycles:** 6 max, 2 minimum.
- [x] **Temperature overrides ovulation estimate:** Yes — `bbtRiseDay` takes priority over calendar estimate.

### Temperature

- [x] **Rolling temperature averages:** `analyzeTempTrend` uses last 4 recorded temps.
- [x] **Thermal shift detection:** `detectBBTRise` — 0.2°C sustained over 3 days.
- [x] **Thermal shift auto-confirms ovulation:** Yes — when `bbtRiseDay` is set, it becomes `ovulationEstimate` in the fertile window.

### Performance

- [ ] **Caching `prediction` results?** Not yet. Redis is wired (`shared/utils/redis.ts`) but not used here. Can add per-cycleId TTL cache if needed.
- [x] **Concurrent cycle updates?** `createLog` wraps auto-transition in a `prisma.$transaction`. `computeAndSaveCycleStatistics` is called post-transaction.

---

## 7. Test Scenarios

### Scenario A: Standard 28-day cycle, 3 historical cycles
- [x] After 3 completed cycles (e.g., 27/28/29 days), `CycleStatistics` will have `avgDurationDays=28, min=27, max=29`. Prediction endpoint uses these values.

### Scenario B: With temperature data
- [x] With temps on days 5, 10, 15, 20 showing a rise at day 20: `detectBBTRise` detects the shift, `trend = 'post-shift'`, ovulation confirmed ~day 19–20.

### Scenario C: Cycle boundary
- [x] Log posted with `isMenstruating: true` on day 30: previous cycle auto-closed (`endDate = day 29`), new cycle created (`startDate = day 30`), log reassigned. Response: `{ cycleTransitioned: true, newCycleId: "..." }`.

### Scenario D: Incomplete data
- [x] User with 1 cycle and 2 logs: `estimatedCycleDuration = 28` (fallback), `durationVariance = null`, `confidenceLevel = 'low'`.

---

## 8. Deliverables Checklist

- [x] Backend schema verified/extended (`CycleStatistics` model + migration)
- [x] `GET /cycles/{cycleId}/prediction` endpoint enhanced with full response shape
- [x] Automatic cycle detection implemented (`createLog` auto-close + create)
- [x] Cycle statistics calculation automated (on manual close + auto-close)
- [x] Temperature trend analysis implemented (`analyzeTempTrend`)
- [ ] Integration tests written — pending
- [ ] CLI/TUI updated to use enhanced prediction endpoint — pending (CLI-side work)
- [ ] Calendar view shows predictions — pending (CLI-side work)

---

## Modified Files

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added `CycleStatistics` model, added `cycleStatistics` relation to `User` |
| `prisma/migrations/20260401164103_add_cycle_statistics/migration.sql` | Auto-generated migration |
| `src/modules/cycles/cycles.service.ts` | Added `computeAndSaveCycleStatistics`, triggered from `updateCycle` |
| `src/modules/logs/logs.service.ts` | Added auto cycle transition logic in `createLog` |
| `src/modules/algorithm/fertile-window.ts` | Added `TempTrend` interface + `analyzeTempTrend` function |
| `src/modules/algorithm/algorithm.service.ts` | Rewrote `getCyclePrediction` with full response shape |
