# Module Architecture Diagram

This diagram illustrates the request flow, module structure, shared utilities, and background services in the sinto-app Fastify API.

The architecture demonstrates:
- **Request pipeline**: Client → Rate Limiter → Router → Auth Guard → Route Handler → Service Layer → Database
- **Module organization**: Each module (Auth, Cycles, Logs, Users, Phases, Algorithm, Notifications) encapsulates related routes and service logic
- **Cross-module dependencies**: LogsService calls AlgorithmService; AlgorithmService uses pure function utilities
- **Shared infrastructure**: Centralized Prisma and Redis clients; AppError exception handling; Auth Guard middleware
- **Background work**: ReminderWorker independently polls the database to send push notifications via FCM

```mermaid
graph TD
  subgraph Client["Client Layer"]
    CLI["CLI"]
    Browser["Browser"]
  end

  subgraph API["Fastify API"]
    RL["RateLimiter"]
    Router["Router"]
    AG["AuthGuard<br/>JWT + Blacklist"]
    EH["ErrorHandler<br/>AppError"]
  end

  subgraph Modules["Modules"]
    Auth["AuthModule<br/>register/login/refresh/logout"]
    Cycles["CyclesModule<br/>CRUD /cycles"]
    Logs["LogsModule<br/>CRUD /cycles/:id/logs"]
    Users["UsersModule<br/>GET/PATCH /users"]
    Phases["PhasesModule<br/>GET /phases/:name"]
    Algorithm["AlgorithmModule<br/>GET /cycles/:id/predict"]
    Notifications["NotificationsModule<br/>GET/POST/DELETE /notifications"]
  end

  subgraph Services["Service Layer"]
    AuthSvc["AuthService"]
    CyclesSvc["CyclesService"]
    LogsSvc["LogsService"]
    UsersSvc["UsersService"]
    PhasesSvc["PhasesService"]
    AlgoSvc["AlgorithmService"]
    NotifSvc["NotificationsService"]
  end

  subgraph Utils["Utilities"]
    FertileWindow["FertileWindowUtils<br/>pure functions"]
  end

  subgraph Shared["Shared Infrastructure"]
    Prisma["PrismaClient<br/>PrismaPg adapter"]
    Redis["RedisClient<br/>ioredis"]
  end

  subgraph Background["Background Services"]
    ReminderWorker["ReminderWorker<br/>setInterval FCM push"]
  end

  subgraph Data["Data Layer"]
    DB[("PostgreSQL")]
    Cache[("Redis")]
  end

  Client -->|HTTP/CLI| RL
  RL -->|request| Router
  Router -->|protected routes| AG
  AG -->|verified JWT| EH
  EH -->|calls| Modules

  Auth -->|uses| AuthSvc
  Cycles -->|uses| CyclesSvc
  Logs -->|uses| LogsSvc
  Users -->|uses| UsersSvc
  Phases -->|uses| PhasesSvc
  Algorithm -->|uses| AlgoSvc
  Notifications -->|uses| NotifSvc

  AuthSvc -->|verify token| Cache
  CyclesSvc -->|read/write| Prisma
  LogsSvc -->|read/write| Prisma
  LogsSvc -->|calls| AlgoSvc
  UsersSvc -->|read/write| Prisma
  PhasesSvc -->|read/write| Prisma
  AlgoSvc -->|calls| FertileWindow
  AlgoSvc -->|read/write| Prisma
  NotifSvc -->|read/write| Prisma

  Prisma -->|query| DB
  Redis -->|cache| Cache
  AuthSvc -->|session blacklist| Redis

  ReminderWorker -->|read Devices| Prisma
  ReminderWorker -->|send FCM| Notifications

  style Client fill:#e1f5ff
  style API fill:#fff3e0
  style Modules fill:#f3e5f5
  style Services fill:#e8f5e9
  style Shared fill:#fce4ec
  style Background fill:#fff9c4
  style Data fill:#f1f8e9
```
