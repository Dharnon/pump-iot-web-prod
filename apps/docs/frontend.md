# Frontend Documentation

## Overview

The PumpIoT frontend consists of two main applications in a monorepo using Turborepo:

- **Operator App**: React + Vite application for operators on the factory floor
- **Supervisor App**: Next.js application for supervisors and administrators

Both apps share the `core` and `ui` packages for common functionality.

## Technology Stack

### Operator App
- **Framework**: React 18 with Vite
- **State Management**: React Context API
- **Styling**: Tailwind CSS + shadcn/ui components
- **Real-time**: SignalR client
- **3D Visualization**: Three.js / React Three Fiber

### Supervisor App
- **Framework**: Next.js 14 (App Router)
- **State Management**: React Context + React Query patterns
- **Styling**: Tailwind CSS + shadcn/ui components
- **Real-time**: SignalR client
- **Data Tables**: TanStack Table (React Table)

### Shared Packages
- **@pumpiot/core**: API clients, authentication, types
- **@pumpiot/ui**: Reusable UI components (in development)

## Project Structure

```
pump-iot-web-prod/
├── apps/
│   ├── operator/                 # React + Vite app
│   │   ├── src/
│   │   │   ├── components/       # UI components
│   │   │   ├── contexts/         # React Context providers
│   │   │   ├── features/        # Feature modules
│   │   │   ├── hooks/           # Custom hooks
│   │   │   ├── views/           # Page-level components
│   │   │   └── App.tsx         # Main app component
│   │
│   ├── supervisor/               # Next.js app
│   │   ├── src/
│   │   │   ├── app/             # Next.js App Router pages
│   │   │   ├── components/      # Shared components
│   │   │   ├── features/       # Feature modules
│   │   │   └── lib/            # Utilities
│   │
│   └── docs/                    # VitePress documentation
│
└── packages/
    ├── core/                     # Shared API & types
    └── ui/                      # Shared UI components
```

## Component Architecture

### Operator App Component Hierarchy

```mermaid
graph TD
    A[App.tsx] --> B[NavigationProvider]
    A --> C[UserProvider]
    A --> D[JobProvider]
    A --> E[TelemetryProvider]
    A --> F[TestingContext]
    
    B --> G[Views]
    G --> H[Dashboard]
    G --> I[Programacion]
    G --> J[Cockpit]
    G --> K[Analytics]
    G --> L[SetupPage]
    
    D --> M[SignalR Connection]
    E --> M
    
    style A fill:#f9f,stroke:#333
    style G fill:#bbf,stroke:#333
    style M fill:#bfb,stroke:#333
```

### Supervisor App Component Structure

```mermaid
graph LR
    A[App Router] --> B[/supervisor]
    A --> C[/supervisor/programacion]
    A --> D[/supervisor/test/[id]]
    A --> E[/supervisor/user-management]
    
    B --> F[DataTable]
    B --> G[Columns]
    
    C --> H[Kanban Board]
    
    D --> I[TestDetailFeature]
    I --> I1[GeneralInfoSection]
    I --> I2[BombaDataSection]
    I --> I3[MotorDataSection]
    I --> I4[FluidSection]
    I --> I5[DetailsSection]
```

## Data Flow

### Operator App Data Flow

```mermaid
flowchart LR
    A[API Server] -->|REST| B[testService]
    B --> C[JobProvider]
    C --> D[Views]
    
    E[SignalR Hub] -->|Real-time| F[useSignalR]
    F --> G[TelemetryProvider]
    G --> H[Cockpit View]
    
    I[User Login] --> J[UserProvider]
    J --> K[Assigned Bench]
    K --> C
    
    style A fill:#f9f,stroke:#333
    style E fill:#bbf,stroke:#333
    style G fill:#bfb,stroke:#333
```

## Context Providers

### Operator Contexts

| Context | Purpose | Key State |
|---------|---------|------------|
| `UserProvider` | User auth & bench assignment | `user`, `assignedBank` |
| `JobProvider` | Test jobs management | `jobs`, `loading`, `error` |
| `NavigationProvider` | View-based navigation | `currentView`, `params` |
| `TestingContext` | Active test state | `currentTest`, `status` |
| `TelemetryProvider` | Real-time telemetry | `telemetryData`, `connected` |

### Context Flow Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Loading : app_init
    Loading --> Authenticated : user_login
    Loading --> Unauthenticated : no_user
    
    Authenticated --> ViewingDashboard : view=dashboard
    Authenticated --> ViewingProgramacion : view=programacion
    Authenticated --> RunningTest : start_test
    Authenticated --> ConfiguringTest : view=setup
    
    RunningTest --> ViewingDashboard : test_complete
    ConfiguringTest --> RunningTest : submit_setup
    
    ViewingDashboard --> [*] : logout
    ViewingProgramacion --> [*] : logout
    RunningTest --> [*] : logout
    ConfiguringTest --> [*] : logout
```

## Views & Pages

### Operator Views

| View | File | Description |
|------|------|-------------|
| Dashboard | `views/Dashboard.tsx` | Main dashboard with job list |
| Programacion | `views/Programacion.tsx` | Kanban board by bench |
| Cockpit | `views/Cockpit.tsx` | Real-time test monitoring with 3D |
| Analytics | `views/Analytics.tsx` | Test analytics and charts |
| SetupPage | `views/SetupPage.tsx` | Test configuration form |

### Supervisor Pages

| Path | Page | Description |
|------|------|-------------|
| `/login` | Login | User authentication |
| `/supervisor` | Dashboard | Main test management table |
| `/supervisor/programacion` | Schedule | Kanban board for scheduling |
| `/supervisor/test/[id]` | Test Detail | Full test configuration |
| `/supervisor/user-management` | Users | User administration |

## API Integration

### Core Package Services

```mermaid
classDiagram
    class testService {
        +getTests() Test[]
        +getTest(id) Test
        +createTest(data) Test
        +updateTest(id, data) Test
        +deleteTest(id) void
    }
    
    class authService {
        +login(credentials) Token
        +logout() void
        +getCurrentUser() User
    }
    
    class pdfService {
        +generatePdf(testId) Blob
        +uploadPdf(file) string
    }
    
    testService --> authService
```

### SignalR Integration

```mermaid
sequenceDiagram
    participant Client
    participant Hub as SignalR Hub
    participant API as Web API
    participant DB as Database
    
    Client->>Hub: Connect
    Hub->>Client: Connection Established
    
    API->>DB: Update Test Status
    DB->>API: Status Updated
    API->>Hub: Broadcast Change
    Hub->>Client: TestUpdated Event
    Client->>Client: Update UI
```

## Development Workflow

### Running the Apps

```bash
# Install dependencies
cd pump-iot-web-prod
pnpm install

# Run all apps
pnpm dev

# Run specific app
cd apps/operator && pnpm dev
cd apps/supervisor && pnpm dev

# Run documentation
pnpm docs:dev
```

### Environment Variables

```env
# Operator App (.env)
VITE_API_URL=http://localhost:5000

# Supervisor App (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Testing Workflow

### Operator Test Flow

```mermaid
flowchart TD
    A[Job in Dashboard] --> B[Click Start]
    B --> C[Setup Form]
    C --> D[Fill Parameters]
    D --> E[Submit]
    E --> F[Go to Cockpit]
    F --> G[Real-time Monitoring]
    G --> H[Test Complete]
    H --> I[View Results]
    
    style A fill:#f9f
    style F fill:#bbf
    style I fill:#bfb
```

### Supervisor Workflow

```mermaid
flowchart LR
    A[Create Test] --> B[Configure]
    B --> C[Assign to Bench]
    C --> D[Monitor Progress]
    D --> E[Review Results]
    E --> F[Approve/Reject]
    
    style A fill:#f9f
    style D fill:#bbf
    style F fill:#bfb
```

## Common Issues & Solutions

### SignalR Connection Issues
- **Symptom**: Real-time updates not working
- **Solutions**:
  1. Ensure backend SignalR hub is running
  2. Check CORS configuration in backend
  3. Verify authentication token is passed
  4. Check browser console for connection errors

### Context State Not Updating
- **Symptom**: UI doesn't reflect data changes
- **Solutions**:
  1. Check proper Context provider nesting in App.tsx
  2. Verify state immutability in reducers
  3. Use React DevTools to debug context values
  4. Ensure proper use of useContext hooks

### Build Errors
- **Symptom**: Production build fails
- **Solutions**:
  1. Clear `.vite` or `.next` folders
  2. Delete `node_modules` and reinstall
  3. Check TypeScript errors in editor
  4. Verify environment variables are set
