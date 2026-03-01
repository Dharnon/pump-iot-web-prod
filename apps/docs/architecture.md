# Architecture Overview

## System Architecture

The PumpIoT system is a full-stack application for managing pump testing operations.

### Technology Stack

- **Frontend**: React + Vite (Operator App), Next.js (Supervisor App)
- **Backend**: ASP.NET Core 9.0 Web API
- **Database**: PostgreSQL
- **Real-time**: SignalR
- **Package Manager**: pnpm with Turborepo

### Application Structure

```
pump-iot-web-prod/
├── apps/
│   ├── operator/       # Operator application (React + Vite)
│   ├── supervisor/    # Supervisor application (Next.js)
│   └── docs/          # Documentation (VitePress)
├── packages/
│   ├── core/          # Shared API utilities
│   └── ui/            # Shared UI components
└── turbo.json         # Turborepo configuration
```

### System Flow Diagram

```mermaid
flowchart TD
    A[User] -->|Login| B[Auth Service]
    B -->|JWT Token| A
    
    A --> C[Operator App]
    A --> D[Supervisor App]
    
    C -->|REST API| E[Web API]
    D -->|REST API| E
    
    C -->|SignalR| F[Protocol Hub]
    D -->|SignalR| F
    
    E --> G[PostgreSQL]
    F --> G
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style G fill:#bfb,stroke:#333,stroke-width:2px
```

### Backend Structure

```
pump-iot-dotnet-main/
├── src/
│   ├── PumpIot.Domain/        # Domain entities
│   ├── PumpIot.Application/   # Application services
│   ├── PumpIot.Infrastructure/# Data access & EF Core
│   └── PumpIot.WebAPI/        # REST API + SignalR Hub
└── migrations/                # EF Core migrations
```

### Key Entities

| Entity | Description |
|--------|-------------|
| **Prueba** (Test) | Represents a pump test |
| **Banco** (Bench) | Testing bench (A, B, C, D, E) |
| **Bomba** (Pump) | Pump being tested |
| **Motor** | Motor linked to the pump |
| **Cliente** (Client) | Customer information |
| **Fluido** (Fluid) | Test fluid configuration |

### Entity Relationship Diagram

```mermaid
erDiagram
    Cliente ||--o{ Prueba : "orders"
    Prueba ||--|| Bomba : "has"
    Prueba ||--|| Motor : "has"
    Prueba ||--|| Fluido : "uses"
    Prueba ||--o| Banco : "tested_on"
    Prueba ||--o{ PruebaARealizar : "includes"
    PruebaARealizar ||--o{ Parametro : "measures"
    
    Cliente {
        int id PK
        string nombre
        string cif
    }
    
    Prueba {
        int id PK
        int cliente_id FK
        int banco_id FK
        string estado
        date fecha
    }
    
    Banco {
        int id PK
        string nombre
        bool activo
    }
```

### Test Status Flow

```mermaid
stateDiagram-v2
    [*] --> GENERADA
    GENERADA --> EN_BANCO : assign_to_bench
    EN_BANCO --> IN_PROCESO : start_test
    IN_PROCESO --> PROCESADO : complete_test
    PROCESADO --> COMPLETED : approve
    COMPLETED --> [*]
    
    GENERADA --> CANCELADA : cancel
    EN_BANCO --> CANCELADA : cancel
    IN_PROCESO --> CANCELADA : cancel
    CANCELADA --> [*]
```

### Key APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tests` | GET | List all tests |
| `/api/tests` | POST | Create new test |
| `/api/tests/{id}` | GET | Get test details |
| `/api/tests/{id}` | PUT | Update test |
| `/api/bancos` | GET | List benches |
| `/hubs/protocol` | WS | SignalR hub for real-time |
