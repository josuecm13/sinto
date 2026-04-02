# Sinto App Architecture Diagrams

## 1. Database Schema (ER Diagram)

```mermaid
erDiagram
    USER ||--o{ CYCLE : owns
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ DEVICE : has
    CYCLE ||--o{ DAILY_LOG : contains
    DAILY_LOG ||--o| MENSTRUAL_LOG : has
    DAILY_LOG ||--o| SYMPTOM_LOG : has
    SYMPTOM_LOG ||--o{ SYMPTOM : lists

    USER {
        string id PK
        string email UK
        string name
        string username UK
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
        enum phase
        boolean isMenstruating
        datetime createdAt
        datetime updatedAt
    }

    MENSTRUAL_LOG {
        string id PK
        string dailyLogId FK "UK"
        enum flowLevel
        enum color
        enum consistency
    }

    SYMPTOM_LOG {
        string id PK
        string dailyLogId FK "UK"
        enum mood
        enum mucusType
        enum mucusQuality
    }

    SYMPTOM {
        enum value
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
        string token UK
        string platform
        datetime createdAt
    }

    PHASE_CONTENT {
        string id PK
        enum phase
        enum category
        string title
        string body
        string locale
    }
```

---

## 2. Module Architecture Diagram

```mermaid
graph TB
    API["<b>Fastify API Server</b><br/>Port 3000"]
    
    subgraph Middleware["Middleware Layer"]
        JWT["@fastify/jwt<br/>Token Validation"]
        CORS["@fastify/cors<br/>Cross-Origin"]
        HELMET["@fastify/helmet<br/>Security Headers"]
        RATE["@fastify/rate-limit<br/>Rate Limiting"]
        SWAGGER["@fastify/swagger<br/>API Docs"]
    end
    
    subgraph Modules["Core Modules"]
        AUTH["<b>Auth Module</b><br/>auth.service.ts<br/>auth.routes.ts<br/>auth.schema.ts"]
        USERS["<b>Users Module</b><br/>users.service.ts<br/>users.routes.ts<br/>users.schema.ts"]
        CYCLES["<b>Cycles Module</b><br/>cycles.service.ts<br/>cycles.routes.ts<br/>cycles.schema.ts"]
        LOGS["<b>Logs Module</b><br/>logs.service.ts<br/>logs.routes.ts<br/>logs.schema.ts"]
        PHASES["<b>Phases Module</b><br/>phases.service.ts<br/>phases.routes.ts"]
        ALGORITHM["<b>Algorithm Module</b><br/>algorithm.service.ts<br/>fertile-window.ts<br/>pregnancy-probability.ts<br/>algorithm.routes.ts"]
        NOTIF["<b>Notifications Module</b><br/>notifications.service.ts<br/>notifications.routes.ts<br/>notifications.schema.ts"]
    end
    
    subgraph Data["Data Access Layer"]
        PRISMA["<b>Prisma ORM</b><br/>- Query Builder<br/>- Type Safety<br/>- Migrations"]
        PG["PostgreSQL<br/>Port 5432"]
        REDIS["Redis<br/>Token Blacklist<br/>Port 6379"]
    end
    
    CLI["<b>CLI Client</b><br/>sinto-cli<br/>Commander.js"]
    
    API --> Middleware
    Middleware --> Modules
    
    AUTH --> JWT
    USERS --> AUTH
    CYCLES --> USERS
    LOGS --> CYCLES
    LOGS --> ALGORITHM
    PHASES --> LOGS
    ALGORITHM --> LOGS
    NOTIF --> USERS
    
    Modules --> PRISMA
    Modules --> REDIS
    PRISMA --> PG
    
    CLI -->|HTTP REST| API
    
    style API fill:#e1f5ff
    style Middleware fill:#fff3e0
    style Modules fill:#f3e5f5
    style Data fill:#e8f5e9
    style CLI fill:#fce4ec
```

---

## 3. OOP Module Class Diagram

```mermaid
classDiagram
    class AuthService {
        -prisma: PrismaClient
        +register(email: string, password: string, name: string): Promise~User~
        +login(email: string, password: string): Promise~TokenPair~
        +validateToken(token: string): Promise~JWTPayload~
        +refreshToken(refreshToken: string): Promise~TokenPair~
        +logout(userId: string): Promise~void~
        -hashPassword(password: string): Promise~string~
        -verifyPassword(password: string, hash: string): Promise~boolean~
        -generateTokenPair(userId: string): TokenPair
    }

    class UsersService {
        -prisma: PrismaClient
        +getProfile(userId: string): Promise~User~
        +updateProfile(userId: string, data: UpdateUserDto): Promise~User~
        +setReminder(userId: string, time: string): Promise~User~
        +makePublic(userId: string): Promise~User~
        +deleteAccount(userId: string): Promise~void~
    }

    class CyclesService {
        -prisma: PrismaClient
        -algorithmService: AlgorithmService
        +listCycles(userId: string): Promise~Cycle[]~
        +createCycle(userId: string, startDate: Date): Promise~Cycle~
        +getCycle(cycleId: string): Promise~CycleWithLogs~
        +closeCycle(cycleId: string, endDate: Date): Promise~Cycle~
        +deleteCycle(cycleId: string): Promise~void~
        -calculateCycleLength(): number
        -calculateLutealLength(): number
    }

    class LogsService {
        -prisma: PrismaClient
        +addLog(cycleId: string, logData: DailyLogDto): Promise~DailyLog~
        +listLogs(cycleId: string): Promise~DailyLog[]~
        +deleteLog(logId: string): Promise~void~
        +updateLog(logId: string, data: Partial~DailyLogDto~): Promise~DailyLog~
        -validateLogData(data: DailyLogDto): boolean
    }

    class AlgorithmService {
        -prisma: PrismaClient
        +predictFertility(cycle: Cycle): Promise~FertilityPrediction~
        +calculateFertileWindow(logs: DailyLog[]): FertileWindow
        +estimateOvulation(logs: DailyLog[]): Date
        +calculatePregnancyProbability(cycle: Cycle): Promise~PregnancyProbability~
        -detectThermalShift(temperatures: number[]): Date
        -analyzeMucusPattern(logs: DailyLog[]): MucusPhase
        -symmetrothermalMethod(logs: DailyLog[]): SymmetrythermalResult
    }

    class PhasesService {
        -prisma: PrismaClient
        +getPhaseContent(phase: Phase, locale: string): Promise~PhaseContent[]~
        +getCurrentPhase(logs: DailyLog[]): Phase
        +getPhaseDescription(phase: Phase): string
    }

    class NotificationsService {
        -prisma: PrismaClient
        -redis: RedisClient
        +scheduleReminder(userId: string, scheduledAt: Date): Promise~Notification~
        +sendReminder(userId: string): Promise~void~
        +listNotifications(userId: string): Promise~Notification[]~
        +deleteNotification(notificationId: string): Promise~void~
    }

    class PrismaClient {
        +user
        +cycle
        +dailyLog
        +menstrualLog
        +symptomLog
        +phaseContent
        +notification
        +device
    }

    AuthService --> PrismaClient
    UsersService --> PrismaClient
    CyclesService --> PrismaClient
    CyclesService --> AlgorithmService
    LogsService --> PrismaClient
    LogsService --> AlgorithmService
    AlgorithmService --> PrismaClient
    PhasesService --> PrismaClient
    NotificationsService --> PrismaClient
```

---

## 4. Data Flow: Cycle Prediction Pipeline

```mermaid
sequenceDiagram
    participant CLI as sinto-cli
    participant API as Fastify API
    participant CyclesSvc as CyclesService
    participant LogsSvc as LogsService
    participant AlgoSvc as AlgorithmService
    participant DB as PostgreSQL

    CLI->>API: GET /cycles/:id/prediction
    API->>CyclesSvc: getCycle(cycleId)
    CyclesSvc->>DB: SELECT cycle + logs
    DB-->>CyclesSvc: Cycle + DailyLog[]
    CyclesSvc-->>API: cycleData

    API->>AlgoSvc: predictFertility(cycle)
    AlgoSvc->>LogsSvc: analyzeLogs(dailyLogs)
    LogsSvc-->>AlgoSvc: analyzed data
    
    AlgoSvc->>AlgoSvc: detectThermalShift()
    AlgoSvc->>AlgoSvc: analyzeMucusPattern()
    AlgoSvc->>AlgoSvc: estimateOvulation()
    AlgoSvc->>AlgoSvc: calculatePregnancyProbability()
    
    AlgoSvc-->>API: FertilityPrediction
    API-->>CLI: { fertileWindow, dailyProbability, summary }
    CLI->>CLI: renderBBTChart()
    CLI->>CLI: renderPredictionSummary()
```

---

## 5. Entity Relationships: Cycle Tracking

```mermaid
graph LR
    U["User<br/>(email, name, avatar)"]
    C["Cycle<br/>(startDate, endDate)"]
    DL["DailyLog<br/>(date, temperature, phase)"]
    ML["MenstrualLog<br/>(flowLevel, color)"]
    SL["SymptomLog<br/>(mood, mucus, symptoms)"]
    
    U -->|"1..N"| C
    C -->|"1..N"| DL
    DL -->|"0..1"| ML
    DL -->|"0..1"| SL
    
    DL -->|"provides data for"| PRED["Prediction Pipeline<br/>BBT Analysis"]
    PRED -->|"generates"| FW["Fertile Window"]
    PRED -->|"generates"| OP["Ovulation Estimate"]
    PRED -->|"generates"| PP["Pregnancy Probability"]
    
    style U fill:#e3f2fd
    style C fill:#f3e5f5
    style DL fill:#fff3e0
    style ML fill:#fce4ec
    style SL fill:#e0f2f1
    style PRED fill:#f1f8e9
    style FW fill:#c8e6c9
    style OP fill:#c8e6c9
    style PP fill:#c8e6c9
```

---

## 6. CLI Architecture: Command Flow

```mermaid
graph TD
    INDEX["index.ts<br/>CLI Entry Point"]
    
    subgraph Commands["Command Modules"]
        AUTH_CMD["register<br/>login<br/>logout"]
        USER_CMD["profile<br/>settings"]
        CYCLE_CMD["cycle list<br/>cycle start<br/>cycle close<br/>cycle delete"]
        LOG_CMD["log add<br/>log list"]
        PREDICT_CMD["predict"]
        CHART_CMD["chart"]
    end
    
    subgraph TUI["Interactive TUI"]
        APP["app.ts<br/>Main Menu"]
        CAL_FLOW["calendar-flow.ts<br/>Calendar View"]
        CHART_FLOW["chart-flow.ts<br/>BBT Chart"]
        DASH_FLOW["dashboard-flow.ts<br/>Home Screen"]
        PHASE_FLOW["phase-flow.ts<br/>Phase Guide"]
    end
    
    subgraph Libraries["Support Libraries"]
        API["lib/api.ts<br/>HTTP Client"]
        CREDS["lib/credentials.ts<br/>Token Manager"]
        FMT["lib/fmt.ts<br/>Formatting"]
        CALENDAR["tui/calendar.ts<br/>Calendar Render"]
        CHART["tui/chart.ts<br/>BBT Chart Render"]
    end
    
    INDEX --> Commands
    INDEX --> TUI
    
    Commands --> API
    Commands --> CREDS
    Commands --> FMT
    
    TUI --> API
    TUI --> CREDS
    TUI --> FMT
    
    CAL_FLOW --> CALENDAR
    CHART_FLOW --> CHART
    
    APP -->|"dispatch menu"| CAL_FLOW
    APP -->|"dispatch menu"| CHART_FLOW
    APP -->|"dispatch menu"| DASH_FLOW
    APP -->|"dispatch menu"| PHASE_FLOW
    
    style INDEX fill:#e1f5ff
    style Commands fill:#f3e5f5
    style TUI fill:#fff3e0
    style Libraries fill:#e8f5e9
```

---

## 7. Authentication & Token Flow

```mermaid
sequenceDiagram
    participant User as User
    participant CLI as CLI
    participant API as Fastify API
    participant Auth as AuthService
    participant Redis as Redis
    participant DB as PostgreSQL

    User->>CLI: sinto login --email foo --password bar
    CLI->>API: POST /auth/login { email, password }
    
    API->>Auth: login(email, password)
    Auth->>DB: SELECT user WHERE email
    DB-->>Auth: user
    
    Auth->>Auth: verifyPassword(password, hash)
    Auth->>Auth: generateTokenPair(userId)
    Auth-->>API: { accessToken, refreshToken }
    
    API-->>CLI: tokens
    CLI->>CLI: saveCredentials(~/.sinto/credentials.json)
    
    User->>CLI: sinto cycle list
    CLI->>CLI: loadCredentials()
    CLI->>API: GET /cycles with Bearer token
    
    API->>Auth: validateToken(accessToken)
    Auth-->>API: valid
    
    API->>API: return cycles
    API-->>CLI: cycles[]
    
    Note over CLI: If token expires
    CLI->>API: POST /auth/refresh { refreshToken }
    API->>Auth: refreshToken(token)
    Auth->>DB: SELECT user
    Auth->>Redis: checkBlacklist()
    Redis-->>Auth: notBlacklisted
    Auth->>Auth: generateNewAccessToken()
    Auth-->>API: newToken
    API-->>CLI: newAccessToken
    CLI->>CLI: updateCredentials()
    
    style User fill:#e1f5ff
    style CLI fill:#fce4ec
    style API fill:#f3e5f5
    style Auth fill:#fff3e0
```

---

## 8. Key Enums Reference

```mermaid
graph TD
    subgraph Cycle["Cycle Tracking"]
        PHASE["Phase<br/>├─ MENSTRUAL<br/>├─ FOLLICULAR<br/>├─ OVULATORY<br/>└─ LUTEAL"]
    end
    
    subgraph Menstrual["Menstruation Details"]
        FLOW["FlowLevel<br/>├─ SPOTTING<br/>├─ LIGHT<br/>├─ MEDIUM<br/>└─ HEAVY"]
        COLOR["FlowColor<br/>├─ BRIGHT_RED<br/>├─ DARK_RED<br/>├─ PINK<br/>├─ BROWN<br/>└─ BLACK"]
        CONSIST["FlowConsistency<br/>├─ WATERY<br/>├─ NORMAL<br/>└─ CLOTTY"]
    end
    
    subgraph Symptoms["Symptom Tracking"]
        MOOD["Mood<br/>├─ HAPPY<br/>├─ CALM<br/>├─ ANXIOUS<br/>├─ IRRITABLE<br/>├─ SAD<br/>├─ ENERGETIC<br/>└─ TIRED"]
        MUCUS_T["MucusType<br/>├─ DRY<br/>├─ STICKY<br/>├─ CREAMY<br/>├─ EGG_WHITE<br/>└─ WATERY"]
        MUCUS_Q["MucusQuality<br/>├─ NONE<br/>├─ LOW<br/>├─ MEDIUM<br/>├─ HIGH<br/>└─ PEAK"]
        SYMPTOM["Symptoms<br/>├─ NAUSEA<br/>├─ BREAST_PAIN<br/>├─ HEADACHE<br/>├─ CRAMPS<br/>├─ BLOATING<br/>├─ BACKACHE<br/>├─ FATIGUE<br/>├─ ACNE<br/>└─ INSOMNIA"]
    end
    
    subgraph Content["Educational Content"]
        CATEGORY["ContentCategory<br/>├─ EXERCISE<br/>├─ NUTRITION<br/>├─ TIPS<br/>├─ DANGERS<br/>└─ GENERAL"]
    end
    
    style Cycle fill:#f3e5f5
    style Menstrual fill:#fce4ec
    style Symptoms fill:#fff3e0
    style Content fill:#e0f2f1
```

---

## Diagram Viewing Tips

These diagrams are in Mermaid format and can be viewed in:
- **GitHub**: Markdown files render automatically
- **VS Code**: Install "Markdown Preview Mermaid Support" extension
- **Online**: https://mermaid.live (paste the code blocks)
- **Claude**: Mermaid diagrams render inline in conversations

To view locally with better rendering, you can use a Mermaid CLI tool:
```bash
npm install -g @mermaid-js/cli
mmdc -i DIAGRAMS.md -o DIAGRAMS.html
```
