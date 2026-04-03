# Protocol Detail Redesign Design

**Date:** 2026-04-03
**Scope:** Shared detail experience for pending, generated, and active protocols inside the supervisor shell

## Goal

Redesign the protocol detail view so the form dominates the screen, all relevant fields remain visible in desktop mode, and PDF/Excel previews become optional validation aids instead of primary layout drivers.

## Context

The current detail experience has three structural problems:

1. The left document area takes too much visual priority even when no preview is needed.
2. The form is complete but reads like a long uninterrupted sheet of inputs.
3. Pending, generated, and active states reuse the same data surface without enough variation in actions or emphasis.

The desired direction is a single shared layout inside the new shell, with different role/state actions but one coherent visual model.

## Product Requirements

- The form must be the main focus of the screen.
- PDF and Excel previews must be optional and closed by default.
- Desktop should show all current fields without hiding core sections behind tabs.
- Pending, generated, and active detail views should share the same base layout.
- The layout must be responsive.
- The experience should fit the shadcn-based shell and shared design system direction.

## Proposed Experience

### 1. Shared Detail Shell

All protocol detail modes use one base shell:

- Compact header with breadcrumb, order/client identity, status, and state-specific actions
- Main content region centered on the form
- Optional right-side preview panel for PDF/Excel

Preview behavior:

- Closed by default
- Opened explicitly by the user
- Never dominates initial screen real estate
- Used for source verification, not as the primary work surface

### 2. Form-First Layout

The main form becomes a two-column section layout on desktop.

Column 1:

- General information
- Tests to perform
- Pump data
- Guaranteed point in fluid

Column 2:

- Guaranteed point in water
- Motor
- Details and pressures
- Comments / internal comments

This keeps the full field set visible while reducing the current “single continuous sheet” effect.

### 3. State Model

The layout remains consistent across:

- Pending
- Generated
- Active / En banco

Only the following vary by state:

- Primary CTA
- Secondary actions
- Validation emphasis
- Read/edit behavior for a small set of controls if needed

Examples:

- Pending: prioritize extraction review and `Finalizar`
- Generated: prioritize `Guardar` and `Enviar a banco`
- Active / En banco: prioritize operational status and state transition actions

### 4. Optional Validation Panel

The right panel supports:

- PDF preview
- Excel preview
- Lightweight source verification

Panel rules:

- Hidden by default
- User opens it manually
- Switch or tabs choose `PDF` or `Excel`
- In tablet/mobile it becomes overlay or drawer instead of consuming permanent width

### 5. Responsive Behavior

Desktop (`>= 1440px`):

- Two-column form
- Optional right preview panel

Laptop / medium desktop (`1024px - 1439px`):

- Two columns if space allows
- Slightly denser form spacing
- Preview opens as overlay-style side panel if necessary

Tablet / mobile (`< 1024px`):

- One-column stacked sections
- Preview opens as drawer or modal
- Header actions condensed

## Component Architecture

The redesign should move toward a reusable detail system rather than a one-off page.

Recommended component boundaries:

- `DetailShell`
- `DetailHeader`
- `DetailActionBar`
- `DetailSectionGrid`
- `DetailSectionCard`
- `DetailPreviewPanel`
- `DetailPreviewToggle`
- State-specific action helpers for pending/generated/active

Existing domain sections should stay domain-owned:

- `GeneralInfoSection`
- `TestsToPerformSection`
- `BombaDataSection`
- `FluidSection`
- `FluidH2OSection`
- `MotorDataSection`
- `DetailsSection`

The redesign should recompose them rather than rewrite domain logic up front.

## Visual Rules

- Use the new shell vocabulary already introduced in supervisor
- Stronger section grouping
- Tighter header hierarchy
- Less empty horizontal waste
- Reduced PDF-dropzone dominance
- Red Flowserve accents only for primary actions and key status emphasis
- Avoid turning the detail page into a dashboard of decorative cards

## Risks

1. Current field density may still be too high for some laptop sizes.
2. Existing section components may carry layout assumptions that resist clean recomposition.
3. PDF/Excel preview components may need adaptation to support overlay/drawer modes cleanly.
4. Pending/generated/active action logic may currently be too entangled with the existing `DetailView`.

## Recommended Delivery Order

1. Extract shared detail shell layout
2. Recompose existing sections into the new two-column structure
3. Make preview optional and closed by default
4. Apply responsive behavior
5. Refine state-specific action sets
6. Validate pending/generated/active flows visually

## Outcome

The result should be a single, reusable detail surface that:

- feels native to the new shell
- preserves full data visibility on desktop
- reduces visual fatigue
- supports optional source verification
- becomes a reusable foundation for future protocol-like pages
