# Sinto App: Cycle Prediction & Temperature Tracking Verification Plan

## Objective
Verify backend (sinto-api) readiness to support symptothermal cycle prediction, including:
- Automatic cycle detection and statistical variation handling
- Fertility window calculation from symptom + temperature data
- Expected phase transition dates
- Self-correction when new cycle begins

---

## 1. Data Model Requirements

### 1.1 Logs Table
**Currently stored:** `date`, `temperature`, `isMenstruating`, menstrual data (flowLevel, color, consistency), mood, mucusType, mucusQuality, symptoms[]

**Questions:**
- [ ] Does a `logs` table exist in sinto-api? If yes, schema?
- [ ] How are `symptoms` arrays stored? JSON column? Separate junction table?
- [ ] Is there any indexing on `(cycleId, date)` for range queries?

### 1.2 Cycles Table
**Required fields:**
- `id` (PK)
- `userId` (FK)
- `startDate` (date of first menstruation log)
- `endDate` (nullable until new cycle starts)
- `isActive` (boolean)
- `estimatedDuration` (nullable, calculated after completion)
- `actualDuration` (nullable, days between startDate and endDate)
- `createdAt`, `updatedAt`

**Questions:**
- [ ] Does a `cycles` table exist? If yes, current schema?
- [ ] How does the backend currently detect cycle boundaries?
- [ ] Can cycles be auto-closed when a new menstruation log is detected on a future date?

### 1.3 Cycle Statistics (New?)
**Purpose:** Store rolling statistics to power predictions

**Proposed fields:**
- `cycleId` or `userId` (depends on design)
- `avgDurationDays` (average of past N completed cycles)
- `minDurationDays` / `maxDurationDays` (variation bounds)
- `stdDev` (standard deviation of cycle lengths)
- `lastUpdated` (when statistics were recalculated)
- `cycleCount` (number of historical cycles analyzed)

**Questions:**
- [ ] Should this be per-user or per-cycle? (Recommendation: per-user for rolling predictions)
- [ ] Should we store all historical cycles or just last 3-6?

---

## 2. Prediction Logic & Endpoints

### 2.1 Required Endpoint: `GET /cycles/{cycleId}/prediction`

**Purpose:** Calculate and return prediction data for a given cycle

**Request:**
```json
GET /cycles/{cycleId}/prediction
Authorization: Bearer <token>
```

**Response:**
```json
{
  "cycleId": "uuid",
  "cycleDay": 15,
  "estimatedCycleDuration": 28,
  "durationVariance": {
    "min": 25,
    "max": 31,
    "stdDev": 2.1
  },
  "currentPhase": {
    "name": "follicular",
    "estimatedStartDay": 1,
    "estimatedEndDay": 14,
    "dayInPhase": 15
  },
  "expectedOvulation": {
    "estimatedDate": "2026-04-14",
    "daysUntil": 5
  },
  "fertilityWindow": {
    "estimatedStartDate": "2026-04-09",
    "estimatedEndDate": "2026-04-14",
    "daysRemaining": 5,
    "isCurrentlyFertile": true
  },
  "temperatureTrend": {
    "hasData": true,
    "lastTemperature": 36.5,
    "trend": "rising",
    "daysUntilThermalShift": 3
  },
  "nextExpectedMenstruation": "2026-04-28",
  "confidenceLevel": "medium"
}
```

**Algorithm (backend must implement):**
1. Fetch all completed cycles for the user (or last 3-6)
2. Calculate `estimatedCycleDuration` as weighted average or median of cycle lengths
3. Calculate variance (min, max, stdDev)
4. For current cycle:
   - Determine `cycleDay` from cycle start date
   - Estimate ovulation as `cycleDay ~= estimatedDuration - 14` (standard 14-day luteal phase)
   - Fertility window: 5 days before estimated ovulation + ovulation day
   - Extrapolate expected menstruation: startDate + estimatedDuration
5. Analyze temperature trend if available:
   - If temp rising consistently → approaching ovulation
   - If temp has sustained 0.3-0.5°C rise → post-ovulation shift detected
   - Estimate `daysUntilThermalShift` based on current day + trend

**Questions:**
- [ ] Does an endpoint like this exist?
- [ ] If yes, what does it currently return?
- [ ] How is ovulation day estimated (fixed 14-day luteal, or user data)?
- [ ] Is temperature trend analysis implemented?

### 2.2 Automatic Cycle Detection

**Requirement:** When a new log is created with `isMenstruating: true`, the backend should:
1. Check if there's an active cycle
2. If yes and log date > cycle start date: auto-close the active cycle
3. Create a new cycle with `startDate = log.date`

**Questions:**
- [ ] Is automatic cycle closure implemented?
- [ ] Does it handle edge cases (e.g., spotting before full start)?
- [ ] Is there a way to manually correct cycle boundaries?

### 2.3 Cycle Statistics Recalculation

**Requirement:** After cycle closure, recalculate user's rolling statistics

**Trigger:** When `endDate` is set on a cycle

**Actions:**
1. Fetch last N completed cycles
2. Recalculate avgDuration, min, max, stdDev
3. Update user's cycle statistics record

**Questions:**
- [ ] Is this automated or manual?
- [ ] How many past cycles should be included? (Recommend 3-6)
- [ ] Is there a REST endpoint to force recalculation?

---

## 3. Temperature & Notifications

### 3.1 Temperature Prompt Logic

**Requirement:** Backend should notify users to log temperature 1-2x per week

**Questions:**
- [ ] Does the notification system exist?
- [ ] Is it time-based (e.g., every 3-4 days) or phase-aware (more frequent near ovulation)?
- [ ] Can we adjust frequency based on phase?

### 3.2 Temperature Trend Analysis

**Questions:**
- [ ] Can the backend calculate rolling average of temps?
- [ ] Can it detect thermal shift (sustained 0.3°C+ rise)?
- [ ] Should thermal shift detection update `expectedOvulation` dynamically?

---

## 4. CLI/TUI Integration Points

### 4.1 Calendar View Requirements
**What needs to be displayed:**
- Current cycle day
- Estimated phase (menstrual / follicular / ovulation / luteal)
- Fertility window (highlighted)
- Expected ovulation date
- Expected next menstruation
- Temperature curve (if data available)
- Logged symptoms

**Questions:**
- [ ] Does calendar endpoint exist to fetch this data?
- [ ] Or should CLI call `/cycles/{cycleId}/prediction` + `/cycles/{cycleId}/logs`?

### 4.2 Prediction Display in TUI
**When user selects `predict` command:**
1. Fetch prediction endpoint
2. Display fertility window prominently
3. Show temp trend if available
4. Show expected ovulation + menstruation dates
5. Prompt to log temperature if none recorded in past 3 days

---

## 5. Edge Cases & Validation

### 5.1 Insufficient Data
- [ ] What if user has < 2 cycles? Should we fall back to standard 28-day?
- [ ] What if a cycle has no temperatures? Prediction based on symptoms only?

### 5.2 Irregular Cycles
- [ ] How to handle cycles that are 21 vs 35 days?
- [ ] Should we exclude outliers from average?
- [ ] Should `confidenceLevel` adjust based on variance?

### 5.3 Manual Corrections
- [ ] Can users manually set cycle start/end dates?
- [ ] Can they override predicted ovulation date?
- [ ] Does this trigger statistics recalculation?

---

## 6. Questions for Backend Owner

### Critical
- [ ] What tables currently exist? (cycles, logs, users, cycle_statistics?)
- [ ] Is automatic cycle detection implemented?
- [ ] Are there any prediction endpoints already?
- [ ] What ORM/DB is being used?

### Prediction Algorithm
- [ ] How should ovulation day be estimated? (Fixed 14-day luteal? Data-driven?)
- [ ] Should we use simple average or weighted average of cycle durations?
- [ ] How many past cycles should inform predictions?
- [ ] Should temperature data override/adjust ovulation estimates?

### Temperature
- [ ] Can backend store rolling temperature averages?
- [ ] Can it detect thermal shift (0.3°C sustained rise)?
- [ ] Should thermal shift auto-confirm ovulation date?

### Performance
- [ ] Will `/cycles/{cycleId}/prediction` be called frequently?
- [ ] Should results be cached?
- [ ] How to handle concurrent cycle updates?

---

## 7. Test Scenarios

### Scenario A: Standard 28-day cycle, 3 historical cycles
- User has logged 3 complete cycles: 27, 28, 29 days
- Expected: avgDuration=28, fertility window predicted correctly
- [ ] Backend calculates correctly?

### Scenario B: With temperature data
- User has logged temps on days 5, 10, 15, 20 of current cycle
- Temps: 36.4, 36.5, 36.4, 36.7 (thermal shift at day 20)
- Expected: thermal shift detected, ovulation confirmed ~day 19
- [ ] Backend detects shift?

### Scenario C: Cycle boundary
- User logs menstruation on day 30 (expected at 28)
- Expected: previous cycle auto-closed, new cycle auto-started
- [ ] Automatic detection works?

### Scenario D: Incomplete data
- User has 1 cycle + 2 logs in current cycle
- Expected: fallback to standard 28-day, show lower confidence
- [ ] Graceful degradation?

---

## 8. Deliverables Checklist

- [ ] Backend schema verified/designed
- [ ] `GET /cycles/{cycleId}/prediction` endpoint implemented
- [ ] Automatic cycle detection implemented
- [ ] Cycle statistics calculation automated
- [ ] Temperature trend analysis implemented
- [ ] All edge cases handled
- [ ] Integration tests written
- [ ] CLI/TUI updated to use prediction endpoint
- [ ] Calendar view shows predictions
