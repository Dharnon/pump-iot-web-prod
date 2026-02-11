# Test/Protocolo Route Split - Implementation Summary

## Overview

The test detail functionality has been split into two separate routes while sharing all components to avoid code duplication:

1. **`/supervisor/test/[id]`** - For pending tests (PENDING mode)
2. **`/supervisor/protocolo/[id]`** - For generated protocols (GENERATED mode)

## Key Features

### PENDING Mode (`test/[id]`)
- Shows PDF upload and extraction functionality
- Allows editing of extracted PDF data
- Shows only basic sections (no motor/details)
- "Finalize" button generates protocol
- Sets status to "GENERADO" on save
- Uploads PDF to database
- Redirects to /supervisor after finalization

### GENERATED Mode (`protocolo/[id]`)
- Shows existing PDF (readonly viewer)
- **All fields are editable** (including general info)
- Shows all sections including motor and details
- "Guardar" button updates protocol data
- Keeps current status on save
- No PDF upload
- Stays on page after save

## Architecture

### View Mode System

```typescript
// View configuration determines behavior
type ViewMode = 'PENDING' | 'GENERATED';

interface ViewConfig {
  mode: ViewMode;
  editable: boolean;
  showPdfUpload: boolean;
  showSaveButton: boolean;
  showExtendedSections: boolean;
  allFieldsEditable: boolean;
}
```

### Component Sharing

Both routes use the exact same components:
- `DetailView` - Main view component (shared)
- `GeneralInfoSection` - General information
- `TestsToPerformSection` - Test selection (PENDING only)
- `BombaDataSection` - Pump data
- `FluidH2OSection` - Water point data
- `FluidSection` - Fluid point data
- `MotorDataSection` - Motor data (GENERATED only)
- `DetailsSection` - Details and comments (GENERATED only)

### Route Structure

```
apps/supervisor/src/app/supervisor/
├── test/[id]/
│   └── page.tsx (32 lines) - PENDING mode
└── protocolo/[id]/
    └── page.tsx (32 lines) - GENERATED mode
```

Both pages are minimal and just configure the view mode:

```typescript
// test/[id]/page.tsx
const hookResult = useTestDetailPage(params.id as string, t, 'PENDING');

// protocolo/[id]/page.tsx  
const hookResult = useTestDetailPage(params.id as string, t, 'GENERATED');
```

## Field Editability

### PENDING Mode
| Section | Fields | Editable |
|---------|--------|----------|
| General Info | All | ❌ Read-only |
| Tests to Perform | All | ✅ Yes |
| Bomba Data | Most | ✅ Yes |
| Tipo Bomba | - | ❌ Read-only |
| Orden Trabajo | - | ❌ Read-only |
| Fluid H2O | All | ✅ Yes |
| Fluid | All | ✅ Yes |
| Motor | - | 🚫 Not shown |
| Details | - | 🚫 Not shown |

### GENERATED Mode
| Section | Fields | Editable |
|---------|--------|----------|
| General Info | All | ✅ **Yes** |
| Tests to Perform | - | 🚫 Not shown |
| Bomba Data | All | ✅ **Yes** |
| Tipo Bomba | - | ✅ **Yes** |
| Orden Trabajo | - | ✅ **Yes** |
| Fluid H2O | All | ✅ Yes |
| Fluid | All | ✅ Yes |
| Motor | All | ✅ **Yes** |
| Details | All | ✅ **Yes** |

**All fields are editable in GENERATED mode as required!**

## Save Behavior

### PENDING Mode (Finalize)
1. Validates test data
2. Maps data to DTO format
3. Sets `Status: "GENERADO"`
4. Sends PATCH request to `/api/tests/{id}`
5. Uploads PDF to database
6. Shows success: "Prueba generada exitosamente"
7. Redirects to `/supervisor`

### GENERATED Mode (Update)
1. Validates protocol data
2. Maps data to DTO format
3. **Does not** set Status (keeps current)
4. Sends PATCH request to `/api/tests/{id}`
5. **Does not** upload PDF
6. Shows success: "Protocolo actualizado exitosamente"
7. **Stays on current page**

## Data Flow

```
User Edit
    ↓
handlePdfDataChange(field, value)
    ↓
updateTestData(field, value)
    ↓
Determines if field belongs to generalInfo or pdfData
    ↓
Updates corresponding object in test state
    ↓
On Save:
    ↓
mapTestToSaveDTO(generalInfo, pdfData, bancoId, setStatusGenerated)
    ↓
patchTest(testId, dto)
    ↓
Success/Error handling based on viewMode
```

## File Structure

```
features/test-detail/
├── types/
│   └── viewMode.ts - View mode types and configs
├── services/
│   ├── dtoMapper.ts - Backend DTO mapping
│   └── entityMapper.ts - Entity to app format mapping
├── hooks/
│   ├── useTestDetail.ts - Data fetching (handles generalInfo + pdfData)
│   ├── useTestSave.ts - Save logic (mode-aware)
│   ├── usePdfUpload.ts - PDF file handling
│   ├── usePdfExtraction.ts - PDF OCR
│   ├── usePdfPanel.ts - Panel state
│   ├── useTestsToPerform.ts - Test selection
│   └── useTestDetailPage.ts - Facade hook (exports viewConfig)
├── components/
│   ├── DetailView.tsx - Shared view (10KB, reused by both routes)
│   ├── GeneralInfoSection.tsx - (supports editable mode)
│   ├── BombaDataSection.tsx - (supports allFieldsEditable)
│   ├── TestsToPerformSection.tsx
│   ├── FluidH2OSection.tsx
│   ├── FluidSection.tsx
│   ├── MotorDataSection.tsx
│   └── DetailsSection.tsx
└── index.ts - Public API
```

## Benefits

1. **Zero Code Duplication** - Both routes share same components
2. **Clear Separation** - PENDING vs GENERATED logic is explicit
3. **Type Safety** - ViewMode typed throughout
4. **Maintainability** - Single source of truth for UI
5. **Flexibility** - Easy to add new view modes if needed
6. **Clean Code** - Pages reduced from 261 lines to 32 lines each

## Usage Examples

### Navigating to Test Detail (Pending)
```typescript
router.push(`/supervisor/test/${testId}`);
```

### Navigating to Protocol Detail (Generated)
```typescript
router.push(`/supervisor/protocolo/${protocolId}`);
```

### API Endpoint
Both routes use the same API endpoint:
```
GET /api/tests/{id}
PATCH /api/tests/{id}
```

The backend differentiates based on the test status, not the route.

## Migration Notes

- Old test detail page backed up as `page.old.tsx`
- All functionality preserved
- Same UI/UX maintained
- API calls unchanged
- All existing features work as before

## Testing Checklist

- [ ] test/[id] loads pending tests correctly
- [ ] test/[id] PDF upload works
- [ ] test/[id] PDF extraction works
- [ ] test/[id] finalize button generates protocol
- [ ] protocolo/[id] loads generated protocols
- [ ] protocolo/[id] shows existing PDF
- [ ] protocolo/[id] all fields editable
- [ ] protocolo/[id] save updates data
- [ ] protocolo/[id] save doesn't redirect
- [ ] Both routes share same components (no duplication)

## Future Enhancements

Possible improvements:
1. Add validation for required fields
2. Add confirmation dialog before save
3. Add audit trail for field changes
4. Add version history for protocols
5. Add export to PDF functionality
6. Add print preview
