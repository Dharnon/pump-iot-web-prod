---
name: ui-ux-design
description: Use when designing user interfaces, improving visual design, UX patterns, accessibility, or working with Tailwind CSS, shadcn/ui components, or responsive layouts for industrial applications.
triggers:
  - UI
  - UX
  - diseño
  - interfaz
  - Tailwind
  - Tailwind CSS
  - shadcn
  - shadcn/ui
  - Radix
  - componentes
  - responsive
  - accesibilidad
  - a11y
  - layout
  - diseño industrial
  - dashboard
  - form
  - formulario
  - modal
  - tabla
  - navegación
role: specialist
scope: implementation
output-format: code
---

# UI/UX Design Specialist

Senior UI/UX designer and developer specialized in industrial applications, focusing on data-heavy dashboards, real-time monitoring interfaces, and operator-friendly controls for pump testing systems.

## When to Use This Skill

- Designing or improving user interfaces for industrial monitoring
- Creating responsive layouts for operator/supervisor apps
- Implementing accessible components (WCAG 2.1)
- Working with Tailwind CSS (v3 for operator, v4 for supervisor)
- Using shadcn/ui or Radix UI primitives
- Building data tables, forms, dashboards
- Improving navigation and user flows

## Project Context

### Tech Stack

- **Tailwind CSS**: v3.x (operator), v4.x (supervisor)
- **shadcn/ui**: Component library built on Radix UI
- **Radix UI**: Accessible primitive components
- **Framer Motion**: Animations
- **Two Apps**: supervisor (Next.js) + operator (Vite)

### Design Principles for Industrial Apps

1. **Clarity over aesthetics** - Operators need quick data comprehension
2. **High contrast** - Works in various lighting conditions
3. **Large touch targets** - Gloved hands, industrial environment
4. **Status color coding** - Green (ok), Yellow (warning), Red (error)
5. **Real-time feedback** - Immediate visual response to actions

## Core Workflow

1. **Analyze user needs** - Who is the user? (operator vs supervisor)
2. **Review existing components** - Check design system first
3. **Design or improve UI** - Apply consistent patterns
4. **Implement with Tailwind/shadcn** - Use existing components
5. **Verify accessibility** - WCAG 2.1 AA compliance
6. **Test responsiveness** - Mobile, tablet, desktop

## Component Library

### Available shadcn/ui Components

```
apps/supervisor/src/components/ui/
├── button.tsx
├── card.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── input.tsx
├── label.tsx
├── select.tsx
├── table.tsx
├── tabs.tsx
├── textarea.tsx
├── toast.tsx (via sonner)
└── ...
```

### Tailwind Configuration

```js
// supervisor (Tailwind v4)
@theme {
  --color-primary: #0070f3;
  --color-secondary: #646cff;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
}

// operator (Tailwind v3)
colors: {
  primary: '#0070f3',
  secondary: '#646cff',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
}
```

## Design Patterns

### Data Tables (TanStack Table)

```tsx
// Use for: Listados, reports, test history
// Supervisor: Use existing table components with TanStack Table
// Features needed: sorting, filtering, pagination, row selection
```

### Forms

```tsx
// Use for: Setup forms, configuration, data entry
// Use: react-hook-form + zod validation
// Pattern: Label + Input + Error Message + Helper Text
```

### Dashboard Layout

```tsx
// Supervisor: Sidebar navigation + main content area
// Operator: Full-screen cockpit with minimal UI overlay
// Use: CSS Grid for complex layouts
```

### Status Indicators

| Status | Color | Usage |
|--------|-------|-------|
| Success | Green `#22c55e` | Test passed, pump OK |
| Warning | Yellow `#f59e0b` | Near limits, attention needed |
| Error | Red `#ef4444` | Test failed, pump error |
| Info | Blue `#0070f3` | General information |
| Neutral | Gray `#6b7280` | Inactive, disabled |

## Accessibility (WCAG 2.1 AA)

### Requirements

- **Color contrast**: 4.5:1 for text, 3:1 for large text
- **Focus indicators**: Visible focus rings
- **Keyboard navigation**: All interactive elements accessible
- **Screen readers**: Proper ARIA labels
- **Touch targets**: Minimum 44x44px

### Radix UI Primitives

All shadcn/ui components are built on Radix, providing:
- Proper ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support

## Responsive Breakpoints

```js
// Tailwind default breakpoints
sm: '640px'   // Mobile landscape
md: '768px'  // Tablet
lg: '1024px' // Desktop
xl: '1280px' // Large desktop
2xl: '1536px' // Extra large
```

### Industrial Considerations

- **Operator displays**: Often 1920x1080 or larger
- **Supervisor tablets**: iPad Pro size (1024x1366)
- **Mobile**: Limited use, but support for emergencies

## Constraints

### MUST DO

- Use existing shadcn/ui components before creating new ones
- Apply consistent color palette (success/warning/danger)
- Ensure all interactive elements are keyboard accessible
- Use proper contrast ratios
- Test on actual display sizes used in facility

### MUST NOT DO

- Don't create custom components when shadcn has one
- Don't use inline styles - use Tailwind classes
- Don't ignore accessibility warnings
- Don't hardcode colors - use design tokens
- Don't break existing responsive layouts

## Related Skills

- **React Expert** - Component integration
- **Next.js Developer** - SSR patterns
- **Three.js 3D** - 3D UI overlays
- **Reports Generator** - PDF/printable layouts

## Reference Files

- `ARCHITECTURE.md` - App structure
- `packages/ui/` - Shared UI components
- `apps/*/src/components/ui/` - shadcn components
