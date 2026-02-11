# Test Detail Feature - Clean Architecture Documentation

## Overview

The Test Detail feature has been refactored following **SOLID principles** and **Clean Architecture** patterns. This document explains the new structure and design decisions.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Page Layer                           │
│  (Orchestration - 261 lines, down from 900)                 │
│                                                               │
│  - Uses useTestDetailPage facade hook                        │
│  - Composes presentation components                          │
│  - Handles routing and navigation                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Hooks Layer                             │
│  (Business Logic - Facade Pattern)                          │
│                                                               │
│  useTestDetailPage (Facade)                                  │
│    ├── useTestDetail (data fetching)                         │
│    ├── usePdfUpload (file handling)                          │
│    ├── usePdfExtraction (PDF analysis)                       │
│    ├── useTestSave (persistence)                             │
│    ├── usePdfPanel (UI state)                                │
│    └── useTestsToPerform (test selection)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Services Layer                            │
│  (Data Transformation)                                       │
│                                                               │
│  - dtoMapper.ts (App → Backend DTO)                          │
│  - entityMapper.ts (Backend Entities → App)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Components Layer                            │
│  (Presentation - Single Responsibility)                     │
│                                                               │
│  - GeneralInfoSection                                        │
│  - TestsToPerformSection                                     │
│  - BombaDataSection                                          │
│  - FluidH2OSection                                           │
│  - FluidSection                                              │
│  - MotorDataSection                                          │
│  - DetailsSection                                            │
│  - StatusBadge, CleanInput                                   │
└─────────────────────────────────────────────────────────────┘
```

## SOLID Principles Applied

### 1. Single Responsibility Principle (SRP)

Each module has one clear responsibility:

- **Services**: Only handle data transformation
- **Hooks**: Only manage specific business logic
- **Components**: Only render UI for one section
- **Page**: Only orchestrate composition

**Example**:
```typescript
// Before: 900-line page handling everything
// After: Separated concerns

// Service - Only transforms data
export function mapEntitiesToPdfData(entities: TestEntities): TestPdfData {
  // Pure transformation logic
}

// Hook - Only manages PDF upload
export function usePdfUpload(t: TranslationFn) {
  // File handling logic only
}

// Component - Only renders motor data
export function MotorDataSection({ pdfData, onDataChange }) {
  // UI rendering only
}
```

### 2. Open/Closed Principle (OCP)

The architecture is open for extension but closed for modification:

- New sections can be added by creating new components
- New hooks can be added without changing existing ones
- Service layer can be extended with new mappers

**Example**:
```typescript
// Adding a new section requires NO changes to existing code
<NewCustomSection 
  pdfData={test.pdfData} 
  onDataChange={handlePdfDataChange} 
/>
```

### 3. Liskov Substitution Principle (LSP)

Components and hooks are interchangeable:

```typescript
// Any section component follows the same contract
interface SectionProps {
  pdfData: TestPdfData | null | undefined;
  onDataChange: (field: string, value: string) => void;
}

// Can be substituted without breaking functionality
<FluidH2OSection {...sectionProps} />
<FluidSection {...sectionProps} />
<MotorDataSection {...sectionProps} />
```

### 4. Interface Segregation Principle (ISP)

Hooks expose only what's needed:

```typescript
// Each hook returns focused interface
export interface UsePdfUploadResult {
  pdfFile: File | null;
  pdfUrl: string | null;
  isDragging: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent) => void;
  // ... only PDF-related functions
}

// Not forced to implement unrelated functionality
```

### 5. Dependency Inversion Principle (DIP)

High-level modules depend on abstractions:

```typescript
// Page depends on hook abstraction, not implementation
const {
  test,
  saving,
  handleSave,
  // ... other functions
} = useTestDetailPage(testId, t);

// Hook depends on service abstraction
const dto = mapTestToSaveDTO(generalInfo, pdfData);
```

## Project Structure

```
apps/supervisor/src/features/test-detail/
├── components/               # Presentation Layer
│   ├── BombaDataSection.tsx
│   ├── DetailsSection.tsx
│   ├── FluidH2OSection.tsx
│   ├── FluidSection.tsx
│   ├── GeneralInfoSection.tsx
│   ├── MotorDataSection.tsx
│   ├── TestsToPerformSection.tsx
│   ├── StatusBadge.tsx
│   ├── CleanInput.tsx
│   ├── TestDetailHeader.tsx
│   └── index.ts             # Barrel export
│
├── hooks/                   # Business Logic Layer
│   ├── useTestDetail.ts
│   ├── usePdfUpload.ts
│   ├── usePdfExtraction.ts
│   ├── useTestSave.ts
│   ├── usePdfPanel.ts
│   ├── useTestsToPerform.ts
│   ├── useTestDetailPage.ts # Facade Hook
│   └── index.ts
│
├── services/                # Data Transformation Layer
│   ├── dtoMapper.ts         # App → Backend
│   ├── entityMapper.ts      # Backend → App
│   └── index.ts
│
└── index.ts                 # Feature Public API
```

## Key Design Patterns

### 1. Facade Pattern

`useTestDetailPage` acts as a facade, providing a simple interface to complex subsystems:

```typescript
// Before: Page managed 10+ state variables and functions
const [test, setTest] = useState();
const [loading, setLoading] = useState();
const [pdfFile, setPdfFile] = useState();
// ... 10 more states

// After: One hook provides everything
const { test, loading, handleSave, handleAnalyzePdf, ... } = useTestDetailPage(id, t);
```

### 2. Composition Pattern

Components are composed rather than inherited:

```typescript
// Clean composition in page
<GeneralInfoSection generalInfo={test.generalInfo} t={t} />
<TestsToPerformSection testsToPerform={testsToPerform} onToggleTest={toggleTest} t={t} />
<BombaDataSection pdfData={test.pdfData} generalInfo={test.generalInfo} onDataChange={handlePdfDataChange} />
```

### 3. Adapter Pattern

Services act as adapters between domain models:

```typescript
// Maps backend entities to frontend format
const pdfData = mapEntitiesToPdfData({
  bomba: data.bomba,
  fluido: data.fluido,
  // ...
});

// Maps frontend data to backend DTOs
const dto = mapTestToSaveDTO(generalInfo, pdfData);
```

## Benefits

### 1. Maintainability
- **71% code reduction** in main page (900 → 261 lines)
- Each file has clear, single purpose
- Easy to locate and fix bugs

### 2. Testability
- Services are pure functions (easy to unit test)
- Hooks can be tested in isolation
- Components can be tested with simple props

### 3. Reusability
- Components can be reused in other pages
- Hooks can be composed differently
- Services work with any data source

### 4. Scalability
- New features added without modifying existing code
- Team can work on different layers independently
- Clear boundaries prevent coupling

### 5. Type Safety
- TypeScript interfaces for all layers
- Strong typing prevents runtime errors
- IDE autocomplete and refactoring support

## Migration Guide

### For New Features

1. **Add new section**: Create component in `components/`
2. **Add new business logic**: Create hook in `hooks/`
3. **Add new transformation**: Add function in `services/`
4. **Export**: Update barrel exports (`index.ts`)
5. **Integrate**: Use in page via composition

### For Existing Code

The original page is backed up as `page.tsx.backup` if rollback is needed.

## Performance Considerations

### Code Splitting
- Hooks use dynamic imports for heavy dependencies
- Services are pure functions (tree-shakeable)
- Components are small (fast rendering)

### Memoization
- Pure components prevent unnecessary re-renders
- useCallback in hooks prevents recreation
- Data transformations cached in hooks

## Testing Strategy

### Unit Tests
```typescript
// Services (pure functions)
describe('mapEntitiesToPdfData', () => {
  it('should map bomba data correctly', () => {
    const entities = { bomba: { item: '123' } };
    const result = mapEntitiesToPdfData(entities);
    expect(result.item).toBe('123');
  });
});

// Hooks
describe('useTestsToPerform', () => {
  it('should toggle test selection', () => {
    const { result } = renderHook(() => useTestsToPerform());
    act(() => result.current.toggleTest('npsh'));
    expect(result.current.testsToPerform.npsh).toBe(true);
  });
});
```

### Integration Tests
```typescript
// Components
describe('BombaDataSection', () => {
  it('should call onDataChange when input changes', () => {
    const onDataChange = jest.fn();
    render(<BombaDataSection pdfData={mockData} onDataChange={onDataChange} />);
    // Test interactions
  });
});
```

## Future Enhancements

1. **Add validation layer**: Services for business rules validation
2. **Add caching layer**: React Query for server state management
3. **Add error boundary**: Better error handling per section
4. **Add analytics**: Track user interactions per section
5. **Add accessibility**: ARIA labels and keyboard navigation

## Conclusion

This refactoring demonstrates enterprise-grade architecture that:
- ✅ Follows SOLID principles
- ✅ Implements Clean Architecture
- ✅ Reduces code complexity by 71%
- ✅ Improves maintainability and testability
- ✅ Enables team scalability
- ✅ Provides type safety throughout

The architecture is production-ready and follows industry best practices for large-scale React applications.
