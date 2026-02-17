---
name: threejs-3d
description: Use when building 3D scenes with Three.js and React Three Fiber (R3F) for digital twins, industrial simulations, or interactive 3D visualizations. Includes camera controls, lighting, and performance optimization.
triggers:
  - Three.js
  - R3F
  - @react-three/fiber
  - @react-three/drei
  - 3D
  - scene
  - gemelo digital
  - digital twin
  - WebGL
  - modelo 3D
  - cockpit
  - banco de pruebas
role: specialist
scope: implementation
output-format: code
---

# Three.js / R3F Expert

Senior 3D graphics specialist with deep expertise in Three.js, React Three Fiber, and building industrial digital twins for real-time monitoring and control applications.

## When to Use This Skill

- Building 3D scenes for pump testing facilities
- Implementing digital twins with real-time data visualization
- Creating interactive 3D components (clickable meshes, hover states)
- Setting up camera controls and scene management
- Optimizing 3D performance for real-time applications
- Integrating WebGL with React state management
- Creating overlays and tooltips in 3D space

## Core Workflow

1. **Analyze requirements** - Identify scene components, data bindings, interactivity needs
2. **Design scene structure** - Plan hierarchy, lights, camera, performance targets
3. **Implement components** - Create R3F components with proper props
4. **Add interactivity** - Implement click handlers, hover states, animations
5. **Connect to data** - Bind 3D elements to telemetry/PLC data
6. **Optimize** - Apply performance best practices (instancing, LOD, frustum culling)

## Project Context

This project uses:
- **React Three Fiber** (`@react-three/fiber`) v8.x
- **React Three Drei** (`@react-three/drei`) for helpers
- **Three.js** v0.172.x
- **React 18** (NOT 19 - Three.js/R3F compatibility)
- **Operator App**: Vite + React 18 (located in `apps/operator/`)

### Scene Structure

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

### Data Flow

```
PLC (vNode) → WebSocket → TelemetryProvider → 3D Scene Components
```

## Reference Guide

| Topic | Reference | Load When |
|-------|-----------|-----------|
| Scene Setup | `references/scene-setup.md` | Initializing canvas, lights, camera |
| Interactivity | `references/interactivity.md` | Click handlers, hover, tooltips |
| Performance | `references/performance.md` | Optimization, instancing, LOD |
| Data Binding | `references/data-binding.md` | Connecting 3D to telemetry |
| Animations | `references/animations.md` | Transitions, particle effects |

## Constraints

### MUST DO
- Use TypeScript with proper typing for mesh refs and props
- Connect 3D state to React Context/TelemetryProvider (NOT local state in scene)
- Use `useFrame` for animations tied to data updates
- Implement proper cleanup (dispose geometries/materials)
- Use `Html` from drei for accessible tooltips
- Apply color coding based on status (green=ok, red=error, yellow=warning)

### MUST NOT DO
- Don't put all state in the 3D scene (use providers)
- Don't use local state for data that changes frequently
- Don't forget to dispose of resources
- Don't use DOM events directly in canvas (use pointer events)
- Don't ignore React 18 requirement (R3F doesn't support React 19 yet)

## Multi-Bank Support

For 5 test benches, implement bank switching:

```tsx
// Pattern for switching between banks
const BankScene = ({ bankId, bankData }) => {
  return (
    <Scene>
      <PumpModel data={bankData.readings} />
      <Pipeline flow={bankData.readings.flow} />
      <Valve position={bankData.controls.valveOpen} />
    </Scene>
  )
}

// In parent component
<Canvas>
  <Suspense fallback={null}>
    <BankScene bankId={selectedBankId} bankData={bankData.get />
  </Suspense>
</Canvas(selectedBankId)}>
```

## Output Templates

When implementing 3D features, provide:
1. R3F component with TypeScript types
2. Data binding explanation (how it connects to telemetry)
3. Performance considerations if complex scene

## Knowledge Reference

Three.js, React Three Fiber, React Three Drei, WebGL, GLTF/GLB models, instanced meshes, LOD (Level of Detail), frustum culling, raycasting, pointer events, Html overlays, post-processing, shaders, performance optimization, React Context integration, TanStack Query for real-time data.

## Related Skills

- **WebSocket Engineer** - Real-time data connection to PLC
- **React Expert** - State management integration
- **Operator App Patterns** - This project's specific architecture
