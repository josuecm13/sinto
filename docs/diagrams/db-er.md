# Database ER Diagram

This diagram shows the relationships between all Prisma models in the Sinto application, including users, cycles, daily logs, notifications, devices, and cycle statistics.

```mermaid
erDiagram
    USER ||--o{ CYCLE : "owns"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ DEVICE : "has"
    USER ||--o| CYCLE_STATISTICS : "has"
    CYCLE ||--o{ DAILY_LOG : "contains"
    DAILY_LOG ||--o| MENSTRUAL_LOG : "has"
    DAILY_LOG ||--o| SYMPTOM_LOG : "has"

    USER {
        string id PK
        string email
        string name
        string username
        string avatarUrl
        string passwordHash
        boolean isPublic
        boolean remindersEnabled
        string reminderTime
        datetime createdAt
        datetime updatedAt
    }

    CYCLE {
        string id PK
        string userId FK
        date startDate
        date endDate
        int cycleLength
        int lutealPhaseLength
        datetime createdAt
        datetime updatedAt
    }

    DAILY_LOG {
        string id PK
        string cycleId FK
        date date
        float temperature
        string phase
        boolean isMenstruating
        datetime createdAt
        datetime updatedAt
    }

    MENSTRUAL_LOG {
        string id PK
        string dailyLogId FK
        string flowLevel
        string color
        string consistency
    }

    SYMPTOM_LOG {
        string id PK
        string dailyLogId FK
        string mood
        string mucusType
        string mucusQuality
        string[] symptoms
    }

    PHASE_CONTENT {
        string id PK
        string phase
        string category
        string title
        string body
        string locale
    }

    NOTIFICATION {
        string id PK
        string userId FK
        string type
        datetime scheduledAt
        datetime sentAt
        datetime createdAt
    }

    DEVICE {
        string id PK
        string userId FK
        string token
        string platform
        datetime createdAt
    }

    CYCLE_STATISTICS {
        string id PK
        string userId FK
        float avgDurationDays
        int minDurationDays
        int maxDurationDays
        float stdDev
        int cycleCount
        datetime lastUpdated
    }
```

## Enums

```
Phase: MENSTRUAL, FOLLICULAR, OVULATORY, LUTEAL
FlowLevel: SPOTTING, LIGHT, MEDIUM, HEAVY
FlowColor: BRIGHT_RED, DARK_RED, PINK, BROWN, BLACK
FlowConsistency: WATERY, NORMAL, CLOTTY
Mood: HAPPY, CALM, ANXIOUS, IRRITABLE, SAD, ENERGETIC, TIRED
MucusType: DRY, STICKY, CREAMY, EGG_WHITE, WATERY
MucusQuality: NONE, LOW, MEDIUM, HIGH, PEAK
Symptom: NAUSEA, BREAST_PAIN, HEADACHE, CRAMPS, BLOATING, BACKACHE, FATIGUE, ACNE, INSOMNIA
ContentCategory: EXERCISE, NUTRITION, TIPS, DANGERS, GENERAL
```
