---
name: threejs-interactive
description: Use when implementing click handlers, hover states, drag interactions, and user input in Three.js scenes. Includes raycasting, pointer events, and gesture support.
triggers:
  - click 3D
  - onClick
  - onPointerOver
  - drag
  - gesture
  - interact
  - selección
  - evento 3D
role: specialist
scope: implementation
output-format: code
---

# Three.js Interactive Components Expert

Specialist in implementing user interaction with 3D objects: clicks, hovers, drags, and gestures in React Three Fiber scenes.

## When to Use This Skill

- Making 3D components clickable
- Implementing hover effects and highlights
- Creating draggable/rotatable parts (valves, switches)
- Building selection systems for multiple objects
- Implementing gesture controls (pinch, rotate)
- Creating interactive controls (knobs, sliders in 3D)

## Core Workflow

1. **Identify interaction type** - Click, hover, drag, or gesture
2. **Add event handlers** - Use R3F pointer events
3. **Implement state** - Track selection, hover, drag state
4. **Add visual feedback** - Color changes, highlights, cursors
5. **Connect to logic** - Bind to PLC commands or UI state

## Pointer Events in R3F

```tsx
import { useState } from 'react'
import { ThreeEvent } from '@react-three/fiber'

interface InteractiveProps {
  onSelect: (id: string) => void
}

const PumpComponent = ({ onSelect }: InteractiveProps) => {
  const [hovered, setHovered] = useState(false)
  const [selected, setSelected] = useState(false)

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setSelected(!selected)
    onSelect('pump-1')
  }

  return (
    <mesh
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry />
      <meshStandardMaterial
        color={selected ? '#22c55e' : hovered ? '#3b82f6' : '#64748b'}
      />
    </mesh>
  )
}
```

## Common Interaction Patterns

### Clickable Component
```tsx
<mesh onClick={handleClick} onPointerOver={...} onPointerOut={...}>
  <sphereGeometry />
  <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
</mesh>
```

### Draggable Valve (Rotation)
```tsx
import { useDrag } from '@react-three/drei'

const Valve = ({ value, onChange }) => {
  const [rotation, setRotation] = useState(0)
  
  return (
    <mesh
      rotation={[0, rotation, 0]}
      onPointerDown={(e) => {
        e.target.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (e.target.hasPointerCapture(e.pointerId)) {
          const delta = e.movementX * 0.5
          setRotation(r => r + delta)
          onChange(normalizeValue(rotation + delta))
        }
      }}
      onPointerUp={(e) => {
        e.target.releasePointerCapture(e.pointerId)
      }}
    >
      <cylinderGeometry />
    </mesh>
  )
}
```

### Multi-Select with Shift
```tsx
<mesh
  onClick={(e) => {
    if (e.shiftKey) {
      // Add to selection
      addToSelection(id)
    } else {
      // Single select
      setSelection([id])
    }
  }}
/>
```

## State Visual Feedback

| State | Visual Feedback |
|-------|----------------|
| Normal | Default color |
| Hovered | Highlight color, cursor: pointer |
| Selected | Border/outline, bright color |
| Disabled | Grayed out, no pointer events |
| Error | Red color, pulsing |
| Active/Working | Green, animation |

## Constraints

### MUST DO
- Use `e.stopPropagation()` to prevent event bubbling
- Use `e.target.setPointerCapture()` for drag operations
- Add visual feedback for all states (hover, selected)
- Connect to TelemetryProvider for PLC commands
- Use `useCursor` from drei for proper cursor changes

### MUST NOT DO
- Don't forget to handle pointer capture cleanup
- Don't skip stopPropagation (causes unwanted selections)
- Don't use DOM events (use pointer events in R3F)
- Don't implement without visual feedback
