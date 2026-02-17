---
name: threejs-modals
description: Use when creating 3D modals, tooltips, overlays, and UI elements that appear within the Three.js scene. Includes Html components from drei, positioning, and accessibility.
triggers:
  - tooltip
  - overlay
  - 3D modal
  - Html component
  - annotation
  - label
  - popup 3D
  - sensor display
  - datos en 3D
role: specialist
scope: implementation
output-format: code
---

# Three.js Modals & Overlays Expert

Specialist in creating UI overlays, tooltips, and modal dialogs within 3D scenes using React Three Fiber's Html component and related techniques.

## When to Use This Skill

- Creating tooltips that follow 3D objects
- Building sensor value displays in 3D space
- Implementing modal dialogs for detailed information
- Adding annotations to 3D models
- Creating floating UI panels in the scene
- Showing real-time data next to 3D components

## Core Workflow

1. **Identify target** - Determine which 3D object needs the overlay
2. **Choose method** - Html component vs portal vs CSS2DRenderer
3. **Position** - Use `position`, `center`, or anchor props
4. **Style** - Apply Tailwind/styled components for the overlay content
5. **Connect data** - Bind to telemetry context for real-time updates

## Html Component Pattern

```tsx
import { Html } from '@react-three/drei'

<SensorMesh onPointerOver={() => setHovered(true)}>
  {hovered && (
    <Html
      position={[0, 1, 0]}
      center
      distanceFactor={10}
      occlude
    >
      <div className="bg-black/80 text-white p-2 rounded-lg">
        <p>Temperature: {data.temperature}°C</p>
        <p>Pressure: {data.pressure} bar</p>
      </div>
    </Html>
  )}
</SensorMesh>
```

## Common Patterns

### Sensor Display
Shows real-time sensor value next to the component:
```tsx
<Html position={[0.5, 0.5, 0]}>
  <SensorBadge value={reading} unit="°C" status={status} />
</Html>
```

### Tooltip
Appears on hover with detailed info:
```tsx
<Html position={[0, 1, 0]} distanceFactor={8} occlude>
  <Tooltip content={componentData} />
</Html>
```

### Modal in 3D
Full modal dialog within the scene:
```tsx
<Html position={[0, 0, 0]} center fullscreen>
  <Modal3D onClose={closeModal}>
    <DetailedView data={selectedComponent} />
  </Modal3D>
</Html>
```

## Accessibility Considerations

- Use semantic HTML inside Html components
- Add `aria-label` to interactive 3D elements
- Ensure keyboard navigation works with overlays
- Provide screen reader announcements for state changes

## Constraints

### MUST DO
- Use `occlude` to hide tooltips behind objects
- Use `distanceFactor` for size scaling at distance
- Apply `center` for proper anchor point
- Use `className` for styling (Tailwind supported)

### MUST NOT DO
- Don't create full-screen modals that block all interaction
- Don't forget to handle occlude performance
- Don't use fixed pixel sizes (use responsive units)
- Don't skip cleanup of event handlers
