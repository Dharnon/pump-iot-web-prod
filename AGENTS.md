# AGENTS.md - Guía para Agentes de IA

> Este archivo es para uso interno del equipo de desarrollo. No incluir en entregables al cliente.

---

## Estructura del Proyecto

```
pump-iot-web-prod/
├── apps/
│   ├── supervisor/      # Next.js 16 (Dashboard, gestión)
│   │   └── src/
│   │       ├── app/           # App Router
│   │       ├── components/    # UI components
│   │       ├── hooks/         # Custom hooks
│   │       └── lib/           # API, schemas, utils
│   │
│   └── operator/       # Vite + React 18 (Cockpit 3D)
│       └── src/
│           ├── contexts/      # Providers (Navigation, Job, Telemetry)
│           ├── features/     # Feature-based structure
│           ├── hooks/        # Custom hooks
│           ├── views/        # Main views
│           └── components/  # UI components
│
├── packages/
│   ├── core/            # API client, tipos compartidos
│   └── ui/             # Componentes compartidos
│
└── docs/               # Documentación técnica
```

---

## Comandos de Desarrollo

```bash
# Desarrollo (ambas apps)
pnpm dev

# Solo supervisor
pnpm --filter @pump-iot/supervisor dev

# Solo operator
pnpm --filter @pump-iot/operator dev

# Build producción
pnpm build

# Validación (lint + type-check)
pnpm validate

# Tests
pnpm --filter @pump-iot/operator test
```

---

## Decisiones Arquitectónicas

### Apps Independientes

- **Reason**: Entorno air-gapped, resistencia si una app falla
- **Supervisor**: React 19, Next.js 16, Tailwind 4
- **Operator**: React 18 (Three.js/R3F compatibility), Vite 5, Tailwind 3

### Estado Híbrido

- **Supervisor**: SWR para cacheo
- **Operator**: TanStack Query (más flexible para lógica compleja)

### Proveedores Aislados (Operator)

```tsx
<NavigationProvider>
  <JobProvider>
    <TelemetryProvider>
      <AppContent />
    </TelemetryProvider>
  </JobProvider>
</NavigationProvider>
```

---

## Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL del backend (supervisor) |
| `VITE_API_URL` | URL del backend (operator) |
| `NEXT_PUBLIC_OPERATOR_URL` | URL del operator (para proxy) |

---

## Patrones de Código

### Componentes

- Usar **shadcn/ui** (Radix UI + Tailwind)
- Siempre tipar props con TypeScript
- Usar `cn()` de `tailwind-merge` para clases

### Hooks

- Nombrar como `use*` (useCaptureLogic, useListados)
- Preferir hooks sobre contextos cuando sea posible

### API

- Usar Zod para validación de esquemas
- Centralizar en `lib/api.ts` (supervisor) o `packages/core` (compartido)

---

## Cosas a Evitar

1. **No usar `console.log`** - Usar `sonner` (toasts) o logger
2. **No hardcodear URLs** - Usar variables de entorno
3. **No mezclar lógica con UI** - Extraer a hooks/features
4. **No añadir dependencias sin verificar** - Entorno air-gapped

---

## Testing

- **Operator**: Vitest (ya configurado)
- **Supervisor**: Pendiente setup
- **Ejecutar tests**: `pnpm test` o `pnpm test:watch`

---

## Skills Disponibles (para Agentes IA)

Las skills están en `.skills/` y se cargan automáticamente con opencode:

| Skill | Descripción |
|-------|-------------|
| **threejs-3d** | Escenas 3D, R3F, gemelo digital, performance |
| **threejs-modals** | Tooltips, overlays, Html en 3D |
| **threejs-interactive** | Click handlers, drag, selección 3D |
| **reports-generator** | PDF, CSV, exportación de pruebas |
| **plc-websocket** | WebSocket/SignalR conexión PLC/vNode |
| **solid-clean-react** | Principios SOLID y Clean Code en React |
| **solid-clean-architecture** | SOLID, Clean Architecture, DDD en .NET Core |

---

## Notas para Agentes

1. **Leer ARCHITECTURE.md** antes de hacer cambios grandes
2. **Ejecutar `pnpm validate`** antes de sugerir cambios
3. **Verificar con tests** si hay tests existentes
4. **Consultar docs/** para contexto técnico adicional
5. **No crear archivos de documentación** (.md) a menos que se pida explícitamente

---

## Stack Tecnológico

| Tecnología | Versión | App |
|------------|---------|-----|
| Next.js | 16.1.1 | supervisor |
| Vite | 5.x | operator |
| React | 19 / 18 | both |
| Tailwind | 4 / 3 | supervisor / operator |
| TypeScript | 5.x | both |
| TanStack Query | 5.x | operator |
| SWR | 2.x | supervisor |
| Three.js | 0.172.x | operator (gemelo digital) |
| R3F | 8.x | operator (React bindings) |

---

## Sistema de 5 Bancos de Pruebas

### Arquitectura Multi-Banco

```
┌─────────────────────────────────────────────────────────┐
│                    Operator App                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Banco 1 │ │ Banco 2 │ │ Banco 3 │ │ Banco 4 │ ...  │
│  │  3D    │ │  3D    │ │  3D    │ │  3D    │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  WebSocket / SignalR │
              │  (tiempo real)       │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  vNode (Codesys)     │
              │  → PLC                │
              └───────────────────────┘
```

### Patrón de Cambio de Banco

```tsx
// apps/operator/src/contexts/TelemetryProvider.tsx
interface TelemetryContext {
  selectedBankId: number;
  bankData: Map<number, BankTelemetry>;
  switchBank: (id: number) => void;
}
```

### Video Streaming

- Usar WebRTC o HLS para transmisión de video en tiempo real
- Integrar en el cockpit 3D como overlay o panel separado

---

## Conexión PLC (vNode)

### Opciones de Backend

| Opción | Ventajas | Desventajas |
|--------|----------|-------------|
| **.NET + SignalR** | Backend existente, misma tecnología | Más cambios |
| **Node + Socket.IO** | Fácil integración vNode, popular | Nuevo servicio |

### Esquema de Datos (Propuesto)

```typescript
// Tipos para datos del PLC
interface PLCData {
  timestamp: number;
  bankId: number;
  readings: {
    temperature: number;
    pressure: number;
    flow: number;
    rpm: number;
  };
  controls: {
    pumpOn: boolean;
    valveOpen: number; // 0-100%
  };
}

interface PLCCommand {
  bankId: number;
  action: 'start' | 'stop' | 'setValve' | 'setSpeed';
  value?: number;
}
```

### Frecuencia de Actualización

- **Lectura crítica**: 100-500ms (temperatura, presión)
- **Lectura normal**: 1s (RPM, caudal)
- **Escritura**: On-demand (comandos del operador)

---

## Three.js / R3F - Gemelo Digital

### Estructura de Escena

```
apps/operator/src/
├── features/
│   └── testing/
│       ├── components/
│       │   ├── PumpModel.tsx      # Modelo 3D bomba
│       │   ├── Pipeline.tsx       # Tuberías
│       │   ├── Valve.tsx          # Válvula interactiva
│       │   ├── SensorOverlay.tsx  # overlays de datos
│       │   └── CameraControls.tsx # controles cámara
│       └── scenes/
│           └── TestBenchScene.tsx # escena completa
```

### Patrones R3F

- Usar `@react-three/fiber` para renderizado
- Usar `@react-three/drei` para helpers (OrbitControls, Html, etc.)
- Mantener estado en providers (NO en la escena)

### Interactividad 3D

```tsx
// Ejemplo: Click en componente 3D
<Mesh
  onClick={() => onComponentClick('pump')}
  onPointerOver={() => setHovered(true)}
  onPointerOut={() => setHovered(false)}
>
  <Html>Tooltip con datos</Html>
</Mesh>
```

### Estado Visual (Gemelo Digital)

- Colores dinámicos según estado (verde=ok, rojo=error, amarillo=advertencia)
- Animaciones basadas en datos del PLC
- Indicadores de flujo (partículas o líneas)

---

## Reportes

### Tipos de Reportes

| Tipo | Contenido | Formato |
|------|-----------|---------|
| **Pre-test** | Datos teóricos de la bomba | PDF |
| **In-test** | Datos en tiempo real | Live dashboard |
| **Post-test** | Resultados completos + gráficos | PDF + CSV |
| **Histórico** | Pruebas anteriores | Tabla + gráficos |

### Generación de Reportes

- **Supervisor**: PDF con pdfjs-dist o jspdf
- **Datos**: Exportar desde API REST
- **Gráficos**: Recharts para visualizaciones
