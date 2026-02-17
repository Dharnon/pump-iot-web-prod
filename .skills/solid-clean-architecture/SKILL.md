---
name: solid-clean-architecture
description: Use when designing .NET Core APIs or backend services following SOLID principles and Clean Architecture. Includes DDD patterns, dependency injection, and best practices for maintainable code.
triggers:
  - .net
  - dotnet
  - c#
  - api
  - backend
  - solid
  - clean architecture
  - ddd
  - arquitectura
role: specialist
scope: implementation
output-format: code
---

# SOLID & Clean Architecture for .NET Core

Expert in designing and implementing .NET Core backend services following SOLID principles and Clean Architecture patterns.

## When to Use This Skill

- Creating new .NET Core APIs
- Implementing Clean Architecture layers
- Applying DDD patterns in .NET
- Setting up dependency injection
- Building maintainable backend services
- Reviewing .NET code for best practices

## Clean Architecture Layers

```
├── Domain/           # Entidades, Value Objects, Interfaces de repositorio
├── Application/      # Casos de uso, servicios de aplicación, DTOs
├── Infrastructure/   # Implementaciones de repositorio, servicios externos
└── API/              # Controladores, middlewares, configuración
```

### Estructura de Proyecto

```csharp
MyProject.sln
├── src/
│   ├── MyProject.Domain/
│   │   ├── Entities/
│   │   │   └── Pump.cs
│   │   ├── ValueObjects/
│   │   │   └── Pressure.cs
│   │   └── Interfaces/
│   │       └── IPumpRepository.cs
│   │
│   ├── MyProject.Application/
│   │   ├── Services/
│   │   │   └── PumpTestService.cs
│   │   ├── DTOs/
│   │   │   └── TestResultDto.cs
│   │   └── Interfaces/
│   │       └── IEmailService.cs
│   │
│   ├── MyProject.Infrastructure/
│   │   ├── Repositories/
│   │   │   └── PumpRepository.cs
│   │   └── Services/
│   │       └── EmailService.cs
│   │
│   └── MyProject.Api/
│       ├── Controllers/
│       │   └── PumpsController.cs
│       ├── Program.cs
│       └── appsettings.json
```

## SOLID Principles in .NET

### S - Single Responsibility

```csharp
// ❌ MAL: Controlador hace demasiado
[ApiController]
[Route("api/[controller]")]
public class PumpController : ControllerBase
{
    private readonly DbContext _context;
    private readonly IEmailService _email;
    private readonly ILogger _logger;
    
    [HttpPost]
    public async Task<IActionResult> CreatePump(PumpDto dto)
    {
        // Validar
        // Guardar en BD
        // Enviar email
        // Loggear
        // Devolver respuesta
    }
}

// ✅ BIEN: Responsabilidades separadas
// Controller solo maneja HTTP
[ApiController]
[Route("api/[controller]")]
public class PumpController : ControllerBase
{
    private readonly ICreatePumpService _service;
    
    [HttpPost]
    public async Task<IActionResult> CreatePump([FromBody] CreatePumpCommand command)
        => await _service.ExecuteAsync(command);

// Servicio de aplicación maneja la lógica
public class CreatePumpService : ICreatePumpService
{
    private readonly IPumpRepository _repository;
    private readonly INotificationService _notifications;
    
    public async Task<Result> ExecuteAsync(CreatePumpCommand command)
    {
        var pump = Pump.Create(command.Name, command.Model);
        await _repository.AddAsync(pump);
        await _notifications.PumpCreatedAsync(pump);
        return Result.Success(pump.Id);
    }
}
```

### O - Open/Closed

```csharp
// ❌ MAL: Modificar para cada nuevo tipo de filtro
public class PumpRepository
{
    public async Task<List<Pump>> GetAllAsync(string filterType, string value)
    {
        if (filterType == "model") return await _context.Pumps.Where(p => p.Model == value).ToListAsync();
        if (filterType == "status") return await _context.Pumps.Where(p => p.Status == value).ToListAsync();
        // Cada nuevo filtro requiere modificar este método
    }
}

// ✅ BIEN: Extender con Specification Pattern
public interface ISpecification<T>
{
    Expression<Func<T, bool>> ToExpression();
    bool IsSatisfiedBy(T entity);
}

public class ModelSpecification : ISpecification<Pump>
{
    private readonly string _model;
    public ModelSpecification(string model) => _model = model;
    public Expression<Func<Pump, bool>> ToExpression() => p => p.Model == _model;
    public bool IsSatisfiedBy(Pump pump) => pump.Model == _model;
}

public class PumpRepository
{
    public async Task<List<Pump>> GetAllAsync(ISpecification<Pump> spec)
        => await _context.Pumps.Where(spec.ToExpression()).ToListAsync();
}
```

### L - Liskov Substitution

```csharp
// ❌ MAL: Clase derivada tiene comportamiento diferente
public interface IPumpRepository
{
    Task<Pump> GetByIdAsync(int id);
    Task<List<Pump>> GetAllAsync();
}

public class PumpRepository : IPumpRepository
{
    public async Task<Pump> GetByIdAsync(int id) => throw new NotImplementedException("No implementado");
    public async Task<List<Pump>> GetAllAsync() => await _context.Pumps.ToListAsync();
}

// ✅ BIEN: Implementaciones son consistentes
public interface IPumpRepository
{
    Task<Pump?> GetByIdAsync(int id);  // Nullable porque puede no existir
    Task<List<Pump>> GetAllAsync();
}
```

### I - Interface Segregation

```csharp
// ❌ MAL: Interfaz grande
public interface IPumpService
{
    Task<Pump> GetByIdAsync(int id);
    Task<List<Pump>> GetAllAsync();
    Task<Pump> CreateAsync(PumpDto dto);
    Task UpdateAsync(PumpDto dto);
    Task DeleteAsync(int id);
    Task<byte[]> ExportToPdfAsync(int id);
    Task SendNotificationAsync(int id, string message);
}

// ✅ BIEN: Interfaces pequeñas y específicas
public interface IReadPumpService  { Task<Pump?> GetByIdAsync(int id); Task<List<Pump>> GetAllAsync(); }
public interface IWritePumpService { Task<Pump> CreateAsync(PumpDto dto); Task UpdateAsync(PumpDto dto); Task DeleteAsync(int id); }
public interface IPumpExportService { Task<byte[]> ExportToPdfAsync(int id); }
public interface INotificationService { Task SendNotificationAsync(int id, string message); }
```

### D - Dependency Inversion

```csharp
// ❌ MAL: Dependencia de implementación concreta
public class PumpService
{
    private readonly PumpRepository _repository = new();  // Dependencia concreta
    
    public async Task<List<Pump>> GetAllAsync()
        => await _repository.GetAllAsync();
}

// ✅ BIEN: Depender de abstracciones
public interface IPumpRepository
{
    Task<List<Pump>> GetAllAsync();
}

public class PumpService
{
    private readonly IPumpRepository _repository;
    
    public PumpService(IPumpRepository repository)  // Inyectado
    {
        _repository = repository;
    }
}

// En Program.cs
builder.Services.AddScoped<IPumpRepository, PumpRepository>();
```

## Patrones DDD

### Entity

```csharp
public class Pump : Entity<int>
{
    public string Model { get; private set; }
    public PumpStatus Status { get; private set; }
    
    private Pump() { } // EF Core
    
    public static Pump Create(string model)
    {
        if (string.IsNullOrWhiteSpace(model))
            throw new DomainException("Model is required");
            
        return new Pump { Model = model, Status = PumpStatus.Pending };
    }
    
    public void StartTest() => Status = PumpStatus.InTest;
    public void CompleteTest() => Status = PumpStatus.Completed;
}
```

### Value Object

```csharp
public record Pressure
{
    public double Value { get; }
    public string Unit { get; } = "bar";
    
    private Pressure(double value) => Value = value;
    
    public static Pressure Create(double value)
    {
        if (value < 0) throw new DomainException("Pressure cannot be negative");
        return new Pressure(value);
    }
    
    public static Pressure operator +(Pressure a, Pressure b) => new(a.Value + b.Value);
}
```

### Repository Pattern

```csharp
public interface IPumpRepository
{
    Task<Pump?> GetByIdAsync(int id);
    Task<List<Pump>> GetAllAsync(ISpecification<Pump>? spec = null);
    Task AddAsync(Pump pump);
    Task UpdateAsync(Pump pump);
    Task DeleteAsync(int id);
}

public class PumpRepository : IPumpRepository
{
    private readonly AppDbContext _context;
    
    public PumpRepository(AppDbContext context) => _context = context;
    
    public async Task<List<Pump>> GetAllAsync(ISpecification<Pump>? spec = null)
    {
        var query = _context.Pumps.AsQueryable();
        return spec == null 
            ? await query.ToListAsync() 
            : await query.Where(spec.ToExpression()).ToListAsync();
    }
}
```

## Dependency Injection en .NET

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

// Servicios
builder.Services.AddScoped<IPumpRepository, PumpRepository>();
builder.Services.AddScoped<ICreatePumpService, CreatePumpService>();
builder.Services.AddTransient<IEmailService, EmailService>();

// MediatR para CQRS
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreatePumpCommand).Assembly));

var app = builder.Build();
```

## Constraints

### MUST DO
- Usar inyección de dependencias
- Aplicar Repository Pattern
- Usar DTOs para transferencia de datos
- Validar en la capa de aplicación (FluentValidation)
- Manejar errores con Result pattern o excepciones específicas

### MUST NOT DO
- No meter lógica de negocio en controladores
- No acceder a BD directamente en controllers
- No usar clases estáticas para servicios
- No hardcodear strings de configuración
- No ignorar el patrón de entidades (usar DTOs directamente en BD)
