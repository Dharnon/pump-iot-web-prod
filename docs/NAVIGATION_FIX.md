# Navigation Fix: Protocol Routing

## Issue Fixed
When clicking on a generated protocol in the supervisor table, the application was incorrectly navigating to `/supervisor/test/{id}` instead of `/supervisor/protocolo/{id}`.

## Root Cause
The `onRowClick` handler in the supervisor dashboard (`page.tsx`) was hardcoded to always route to the test page, regardless of the test/protocol status.

## Solution
Implemented conditional routing based on the status of the clicked item:

```tsx
onRowClick={(row) => {
  // Route to test page for pending, protocolo page for generated
  const route = row.status === 'PENDING' 
    ? `/supervisor/test/${row.id}` 
    : `/supervisor/protocolo/${row.id}`;
  router.push(route);
}}
```

## Routing Logic

### PENDING Status → Test Route
- **Route:** `/supervisor/test/{id}`
- **View Mode:** PENDING
- **Features:**
  - PDF upload and extraction
  - Edit extracted data
  - "Finalize" button to generate protocol
  - Shows basic sections (no motor/details)

### Generated Statuses → Protocol Route
Any status that is NOT "PENDING" routes to the protocol page:
- **Route:** `/supervisor/protocolo/{id}`
- **View Mode:** GENERATED
- **Statuses:** GENERADO, GENERATED, COMPLETED, IN_PROGRESS, etc.
- **Features:**
  - View existing PDF
  - All fields editable (including general info)
  - "Guardar" button to update data
  - Shows all sections (including motor/details)
  - PDF collapse/expand button

## User Flow

### Viewing Pending Tests
```
User Action:
1. Navigate to supervisor dashboard
2. Click "Pendientes" tab (or it's default)
3. Click on any pending test row

System Response:
→ Routes to: /supervisor/test/{id}
→ Shows: PENDING view with upload/extraction
→ Button: "Finalize"
```

### Viewing Generated Protocols
```
User Action:
1. Navigate to supervisor dashboard
2. Click "Protocolos" tab
3. Click on any generated protocol row

System Response:
→ Routes to: /supervisor/protocolo/{id}
→ Shows: GENERATED view with all fields editable
→ Button: "Guardar"
```

## Code Changes

**File:** `apps/supervisor/src/app/supervisor/page.tsx`
**Line:** 226 (previously), now 226-233

**Before:**
```tsx
<DataTable
  columns={(viewMode === "pending" ? pendingColumns : protocolColumns) as any}
  data={filteredData}
  loading={isLoading}
  onRowClick={(row) => router.push(`/supervisor/test/${row.id}`)}
  globalFilter={globalFilter}
/>
```

**After:**
```tsx
<DataTable
  columns={(viewMode === "pending" ? pendingColumns : protocolColumns) as any}
  data={filteredData}
  loading={isLoading}
  onRowClick={(row) => {
    // Route to test page for pending, protocolo page for generated
    const route = row.status === 'PENDING' 
      ? `/supervisor/test/${row.id}` 
      : `/supervisor/protocolo/${id}`;
    router.push(route);
  }}
  globalFilter={globalFilter}
/>
```

## Routing Matrix

| Item Status | Dashboard Tab | Click Destination | View Mode | PDF Upload | All Fields Edit | Motor/Details |
|------------|---------------|-------------------|-----------|------------|-----------------|---------------|
| PENDING | Pendientes | `/supervisor/test/{id}` | PENDING | ✅ Yes | ❌ No | 🚫 Hidden |
| GENERADO | Protocolos | `/supervisor/protocolo/{id}` | GENERATED | ❌ No | ✅ Yes | ✅ Shown |
| GENERATED | Protocolos | `/supervisor/protocolo/{id}` | GENERATED | ❌ No | ✅ Yes | ✅ Shown |
| COMPLETED | Protocolos | `/supervisor/protocolo/{id}` | GENERATED | ❌ No | ✅ Yes | ✅ Shown |
| IN_PROGRESS | Protocolos | `/supervisor/protocolo/{id}` | GENERATED | ❌ No | ✅ Yes | ✅ Shown |

## Testing Scenarios

### Test 1: Pending Test Navigation
1. Go to `/supervisor`
2. Ensure "Pendientes" tab is active
3. Click on any test with status "PENDING"
4. **Expected:** Browser navigates to `/supervisor/test/{id}`
5. **Expected:** PENDING view loads with PDF upload functionality

### Test 2: Generated Protocol Navigation
1. Go to `/supervisor`
2. Click on "Protocolos" tab
3. Click on any protocol with status "GENERADO" or "GENERATED"
4. **Expected:** Browser navigates to `/supervisor/protocolo/{id}`
5. **Expected:** GENERATED view loads with all fields editable

### Test 3: Different Statuses
Test each generated status:
- Click on GENERADO protocol → `/supervisor/protocolo/{id}` ✅
- Click on GENERATED protocol → `/supervisor/protocolo/{id}` ✅
- Click on COMPLETED protocol → `/supervisor/protocolo/{id}` ✅
- Click on IN_PROGRESS protocol → `/supervisor/protocolo/{id}` ✅

## Integration with Existing Features

This fix integrates with the previously implemented route split:

### Route Configuration
- **`/supervisor/test/[id]/page.tsx`**
  - Calls: `useTestDetailPage(id, t, 'PENDING')`
  - View: PENDING mode

- **`/supervisor/protocolo/[id]/page.tsx`**
  - Calls: `useTestDetailPage(id, t, 'GENERATED')`
  - View: GENERATED mode

### Shared Component
Both routes use `DetailView` component which adapts based on `viewConfig`:
- PENDING config: Shows upload, hides motor/details, limited editing
- GENERATED config: Shows PDF viewer, all sections, all fields editable

## Benefits

1. **Correct Navigation:** Users now reach the appropriate view for their data
2. **Consistent UX:** Pending tests go to test editing, protocols go to protocol viewing
3. **Proper Context:** Each view shows the right tools for the job
4. **Prevents Confusion:** No more upload UI for already-generated protocols
5. **Data Integrity:** Prevents accidental status changes from wrong view

## Related Documentation

- `docs/TEST_PROTOCOLO_SPLIT.md` - Route split architecture
- `docs/VERIFICACION_MOTOR_DETALLES_PDF.md` - Field verification
- `features/test-detail/types/viewMode.ts` - View mode configuration
- `features/test-detail/components/DetailView.tsx` - Shared view component

## Commit History

1. Initial route split implementation
2. Made all fields editable in GENERATED mode
3. Updated save functionality for both modes
4. ✅ **Fixed navigation routing** (this commit)

## Notes

- The fix uses simple status checking (`status === 'PENDING'`)
- All non-pending statuses route to protocolo view
- Future statuses will automatically route to protocolo
- No backend changes required
- No additional configuration needed
