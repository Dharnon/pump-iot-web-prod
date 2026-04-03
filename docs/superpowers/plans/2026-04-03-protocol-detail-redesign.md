# Protocol Detail Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the supervisor protocol detail view so the form dominates the screen, all current fields remain visible on desktop, and PDF/Excel previews become optional support panels.

**Architecture:** Keep the existing domain field sections and hook logic, but replace the current `DetailView` layout with a shared form-first shell. Move preview handling into an optional right-side panel and reorganize sections into a responsive two-column structure that collapses to one column on smaller screens.

**Tech Stack:** Next.js 16, React 19, shadcn/ui, Tailwind CSS, existing `test-detail` feature modules

---

## File Map

**Modify**
- `apps/supervisor/src/features/test-detail/components/DetailView.tsx`
- `apps/supervisor/src/features/test-detail/components/TestDetailHeader.tsx`
- `apps/supervisor/src/features/test-detail/components/GeneralInfoSection.tsx`
- `apps/supervisor/src/features/test-detail/components/TestsToPerformSection.tsx`
- `apps/supervisor/src/features/test-detail/components/BombaDataSection.tsx`
- `apps/supervisor/src/features/test-detail/components/FluidSection.tsx`
- `apps/supervisor/src/features/test-detail/components/FluidH2OSection.tsx`
- `apps/supervisor/src/features/test-detail/components/MotorDataSection.tsx`
- `apps/supervisor/src/features/test-detail/components/DetailsSection.tsx`

**Create**
- `apps/supervisor/src/features/test-detail/components/DetailSectionCard.tsx`
- `apps/supervisor/src/features/test-detail/components/DetailSectionGrid.tsx`
- `apps/supervisor/src/features/test-detail/components/DetailPreviewPanel.tsx`
- `apps/supervisor/src/features/test-detail/components/DetailStateActions.tsx`

**Verify**
- `apps/supervisor/src/app/supervisor/test/[id]/page.tsx`
- `apps/supervisor/src/app/supervisor/protocolo/[id]/page.tsx`

## Chunk 1: Shared Layout Extraction

### Task 1: Add reusable section-card primitives

**Files:**
- Create: `apps/supervisor/src/features/test-detail/components/DetailSectionCard.tsx`
- Create: `apps/supervisor/src/features/test-detail/components/DetailSectionGrid.tsx`

- [ ] **Step 1: Create `DetailSectionCard.tsx`**

Implement a lightweight section wrapper with:
- title slot
- optional meta slot
- content area
- compact, shell-aligned styling

- [ ] **Step 2: Create `DetailSectionGrid.tsx`**

Implement a responsive layout helper with:
- desktop two-column layout
- tablet/mobile single-column fallback
- predictable spacing between sections

- [ ] **Step 3: Verify imports compile**

Run:
```bash
pnpm --filter @pump-iot/supervisor build
```

Expected:
- build succeeds
- no import/path failures from the new primitives

- [ ] **Step 4: Commit**

```bash
git add apps/supervisor/src/features/test-detail/components/DetailSectionCard.tsx apps/supervisor/src/features/test-detail/components/DetailSectionGrid.tsx
git commit -m "feat: add protocol detail section layout primitives"
```

### Task 2: Introduce optional preview panel component

**Files:**
- Create: `apps/supervisor/src/features/test-detail/components/DetailPreviewPanel.tsx`
- Modify: `apps/supervisor/src/features/test-detail/components/DetailView.tsx`

- [ ] **Step 1: Create `DetailPreviewPanel.tsx`**

Implement a presentational component that:
- receives preview mode (`pdf` or `excel`)
- supports closed/open state
- supports desktop side panel and future mobile drawer adaptation
- renders existing preview content in a compact shell

- [ ] **Step 2: Replace direct preview layout in `DetailView.tsx`**

Move current PDF panel responsibility out of `ResizablePanelGroup` and into the new preview component boundary.

- [ ] **Step 3: Default preview closed**

Make preview closed on first render and only open when user toggles it.

- [ ] **Step 4: Verify behavior**

Run:
```bash
pnpm --filter @pump-iot/supervisor build
```

Expected:
- build succeeds
- detail routes still compile

- [ ] **Step 5: Commit**

```bash
git add apps/supervisor/src/features/test-detail/components/DetailPreviewPanel.tsx apps/supervisor/src/features/test-detail/components/DetailView.tsx
git commit -m "feat: make protocol preview panel optional"
```

## Chunk 2: Form-First Detail Layout

### Task 3: Rebuild `DetailView` around a form-first shell

**Files:**
- Modify: `apps/supervisor/src/features/test-detail/components/DetailView.tsx`
- Modify: `apps/supervisor/src/features/test-detail/components/TestDetailHeader.tsx`
- Create: `apps/supervisor/src/features/test-detail/components/DetailStateActions.tsx`

- [ ] **Step 1: Simplify header layout**

Refactor the header so it contains:
- breadcrumb identity
- order/client identity
- state badge
- state-specific actions
- preview toggle

- [ ] **Step 2: Create `DetailStateActions.tsx`**

Centralize action rendering for:
- pending
- generated
- active / en banco

Keep action logic state-aware but visually consistent.

- [ ] **Step 3: Replace resizable split with form-first content layout**

In `DetailView.tsx`:
- make the form region primary
- render a two-column section grid in desktop
- attach preview panel as optional right-side region

- [ ] **Step 4: Verify route rendering**

Run:
```bash
pnpm --filter @pump-iot/supervisor build
```

Expected:
- `/supervisor/test/[id]` compiles
- `/supervisor/protocolo/[id]` compiles

- [ ] **Step 5: Commit**

```bash
git add apps/supervisor/src/features/test-detail/components/DetailView.tsx apps/supervisor/src/features/test-detail/components/TestDetailHeader.tsx apps/supervisor/src/features/test-detail/components/DetailStateActions.tsx
git commit -m "feat: redesign protocol detail shell"
```

## Chunk 3: Section Recomposition

### Task 4: Wrap domain sections in the new card/grid system

**Files:**
- Modify: `apps/supervisor/src/features/test-detail/components/GeneralInfoSection.tsx`
- Modify: `apps/supervisor/src/features/test-detail/components/TestsToPerformSection.tsx`
- Modify: `apps/supervisor/src/features/test-detail/components/BombaDataSection.tsx`
- Modify: `apps/supervisor/src/features/test-detail/components/FluidSection.tsx`
- Modify: `apps/supervisor/src/features/test-detail/components/FluidH2OSection.tsx`
- Modify: `apps/supervisor/src/features/test-detail/components/MotorDataSection.tsx`
- Modify: `apps/supervisor/src/features/test-detail/components/DetailsSection.tsx`

- [ ] **Step 1: Remove separator-driven stacking assumptions**

Update each section so it works cleanly inside section cards without depending on full-width separators from the old vertical sheet layout.

- [ ] **Step 2: Standardize titles, spacing and density**

Unify:
- section heading treatment
- internal spacing
- compact input density
- comments block spacing

- [ ] **Step 3: Keep full field coverage**

Verify the redesigned layout still exposes:
- all general info fields
- test toggles
- all pump/fluid/water/motor/detail fields
- both comment areas

- [ ] **Step 4: Verify build**

Run:
```bash
pnpm --filter @pump-iot/supervisor build
```

Expected:
- build succeeds
- no removed-field regressions in pending/protocol detail routes

- [ ] **Step 5: Commit**

```bash
git add apps/supervisor/src/features/test-detail/components/GeneralInfoSection.tsx apps/supervisor/src/features/test-detail/components/TestsToPerformSection.tsx apps/supervisor/src/features/test-detail/components/BombaDataSection.tsx apps/supervisor/src/features/test-detail/components/FluidSection.tsx apps/supervisor/src/features/test-detail/components/FluidH2OSection.tsx apps/supervisor/src/features/test-detail/components/MotorDataSection.tsx apps/supervisor/src/features/test-detail/components/DetailsSection.tsx
git commit -m "feat: recompose protocol detail sections into shared cards"
```

## Chunk 4: Responsive and UX Validation

### Task 5: Add responsive behavior and preview fallbacks

**Files:**
- Modify: `apps/supervisor/src/features/test-detail/components/DetailView.tsx`
- Modify: `apps/supervisor/src/features/test-detail/components/DetailPreviewPanel.tsx`

- [ ] **Step 1: Implement desktop behavior**

Ensure:
- two-column sections on wide screens
- optional right preview panel
- form remains dominant when preview opens

- [ ] **Step 2: Implement tablet/mobile behavior**

Ensure:
- section grid collapses to one column
- preview becomes overlay/drawer style if needed
- header actions remain usable

- [ ] **Step 3: Verify build**

Run:
```bash
pnpm --filter @pump-iot/supervisor build
```

Expected:
- build succeeds

- [ ] **Step 4: Verify manually in browser**

Run:
```bash
pnpm --filter @pump-iot/supervisor dev
```

Check:
- pending detail route
- generated protocol route
- preview closed by default
- preview open/close behavior
- desktop and narrow widths

- [ ] **Step 5: Commit**

```bash
git add apps/supervisor/src/features/test-detail/components/DetailView.tsx apps/supervisor/src/features/test-detail/components/DetailPreviewPanel.tsx
git commit -m "feat: add responsive behavior to protocol detail redesign"
```

## Chunk 5: Final Validation

### Task 6: Validate state-specific flows

**Files:**
- Verify only

- [ ] **Step 1: Verify pending flow**

Check:
- upload/import still works
- `Finalizar` state remains correct
- preview remains optional

- [ ] **Step 2: Verify generated flow**

Check:
- save still works
- move-to-bank action still renders correctly

- [ ] **Step 3: Verify active / en banco flow**

Check:
- return-to-generated action still renders correctly
- no layout breaks in active state

- [ ] **Step 4: Run final build**

Run:
```bash
pnpm --filter @pump-iot/supervisor build
```

Expected:
- build passes cleanly

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: finalize protocol detail redesign"
```
