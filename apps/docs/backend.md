# Backend API Documentation

The PumpIoT Backend is built with .NET 9 and provides RESTful APIs along with real-time SignalR communication.

## Project Structure

```
pump-iot-dotnet/
├── src/
│   ├── PumpIot.WebAPI/          # Main Web API project
│   │   ├── Controllers/         # API Controllers
│   │   ├── Hubs/               # SignalR Hubs
│   │   └── Program.cs          # Application entry point
│   ├── PumpIot.Application/    # Application services
│   ├── PumpIot.Domain/         # Domain entities
│   └── PumpIot.Infrastructure/ # Data access & EF Core
└── migrations/                  # Database migrations
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |

### Tests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tests` | List all tests |
| GET | `/api/tests/{id}` | Get test details |
| POST | `/api/tests` | Create new test |
| PUT | `/api/tests/{id}` | Update test |
| DELETE | `/api/tests/{id}` | Delete test |
| POST | `/api/tests/{id}/start` | Start test |
| POST | `/api/tests/{id}/stop` | Stop test |
| POST | `/api/tests/{id}/complete` | Complete test |

### Motors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/motores` | List all motors |
| GET | `/api/motores/{id}` | Get motor details |
| POST | `/api/motores` | Create motor |
| PUT | `/api/motores/{id}` | Update motor |

### Banks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bancos` | List all banks |
| POST | `/api/bancos` | Create bank |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/test/{id}` | Generate test report |
| GET | `/api/reports/pdf/{id}` | Generate PDF report |

### Import

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/import/clients` | Import clients from CSV |
| POST | `/api/import/banks` | Import banks from CSV |

## SignalR Hub

The `ProtocolHub` provides real-time communication for test updates.

### Connection

```typescript
const connection = new HubConnectionBuilder()
    .withUrl('/hubs/protocol')
    .withAutomaticReconnect()
    .build();
```

### Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `TestStarted` | Server → Client | Test has started |
| `TestStopped` | Server → Client | Test has stopped |
| `TestCompleted` | Server → Client | Test completed |
| `TestUpdated` | Server → Client | Test data updated |
| `ProtocolUpdated` | Server → Client | Protocol data changed |

### Client Methods

```typescript
// Join a test room
await connection.invoke('JoinTestRoom', testId);

// Leave a test room  
await connection.invoke('LeaveTestRoom', testId);

// Send protocol update
await connection.invoke('SendProtocolUpdate', testId, data);
```

## Database Entities

### Core Entities

- **Prueba** (Test) - Represents a pump test
- **Motor** - Electric motor information
- **Bomba** (Pump) - Pump information
- **Banco** (Bank) - Test bank configuration
- **Cliente** (Client) - Customer information
- **Fluido** (Fluid) - Test fluid properties
- **Parametro** (Parameter) - Test parameters
- **Detalles** (Details) - Test detail measurements
- **ListadoProduccion** (Production List) - Scheduled tests

## Configuration

The API uses `appsettings.json` for configuration:

```json
{
    "ConnectionStrings": {
        "DefaultConnection": "Host=localhost;Database=pumpiot;Username=postgres;Password=..."
    },
    "Logging": {
        "LogLevel": {
            "Default": "Information"
        }
    }
}
```

## Running the Backend

```bash
cd pump-iot-dotnet/src/PumpIot.WebAPI
dotnet run
```

The API will be available at `https://localhost:7000` (or configured port).
