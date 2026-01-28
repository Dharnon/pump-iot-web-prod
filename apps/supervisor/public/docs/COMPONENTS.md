# Documentación de Componentes, Páginas y Hooks

**Proyecto**: Pump IoT Platform (Frontend)  
**Última actualización**: 21 Enero 2026

---

## 📄 Índice

1. [Páginas (App Router)](#páginas-app-router)
2. [Componentes de Negocio](#componentes-de-negocio)
3. [Componentes UI (Shadcn)](#componentes-ui-shadcn)
4. [Hooks](#hooks)
5. [Servicios y Utilidades](#servicios-y-utilidades)
6. [Schemas de Validación](#schemas-de-validación)

---

## 📄 Páginas (App Router)

### `app/login/page.tsx`

| Propiedad | Valor |
|-----------|-------|
| **Ruta** | `/login` |
| **Tipo** | Client Component (`"use client"`) |
| **Líneas** | 104 |
| **Responsabilidad** | Autenticación de usuarios |

**Estado Local:**
```typescript
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
```

**Flujo:**
1. Usuario ingresa credenciales
2. `handleSubmit` llama a `login()` de `lib/api.ts`
3. Si éxito → guarda token en localStorage → `router.push("/supervisor")`
4. Si error → muestra mensaje

**Dependencias:**
- `lib/api.ts` → `login()`
- `next/navigation` → `useRouter`
- UI: Card, Button, Input, Label

---

### `app/supervisor/layout.tsx`

| Propiedad | Valor |
|-----------|-------|
| **Ruta** | `/supervisor/*` |
| **Tipo** | Client Component |
| **Líneas** | 146 |
| **Responsabilidad** | Layout con sidebar, auth check |

**Estado Local:**
```typescript
const [user, setUser] = useState<{ username: string; role: string } | null>(null);
```

**Auth Check:**
```typescript
useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
        router.push("/login");
        return;
    }
    setUser(JSON.parse(storedUser));
}, [router]);
```

**Componentes Usados:**
- `SidebarProvider`, `Sidebar`, `SidebarContent`, `SidebarHeader`, etc.
- `ThemeToggle`
- `Avatar`

**Menú de Navegación:**
```typescript
const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/supervisor" },
    { title: "Listados CSV", icon: FileSpreadsheet, href: "/supervisor/csv-list" },
    { title: "Extractor PDF", icon: FileText, href: "/supervisor/pdf-extractor" },
];
```

---

### `app/supervisor/page.tsx` (Dashboard)

| Propiedad | Valor |
|-----------|-------|
| **Ruta** | `/supervisor` |
| **Tipo** | Client Component |
| **Líneas** | 536 |
| **Responsabilidad** | Dashboard principal con tabla de tests |

**Estado Local:**
```typescript
const [tests, setTests] = useState<TestItem[]>([]);
const [loading, setLoading] = useState(true);
const [globalFilter, setGlobalFilter] = useState("");
const [statusFilter, setStatusFilter] = useState<string>("all");
const [sorting, setSorting] = useState<SortingState>([]);
const [lastImport, setLastImport] = useState<{...} | null>(null);
```

**Features:**
- **StatCards** (4x): Total, Pendientes, En Proceso, Generados
- **DataTable** con TanStack React Table:
  - Sorting por columnas
  - Filtro global (búsqueda)
  - Filtro por status
  - Paginación dinámica basada en altura de contenedor
- **ImportModal**: Para subir Excel

**TanStack Table Config:**
```typescript
const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
});
```

**Responsive Page Size (ResizeObserver):**
```typescript
useEffect(() => {
    const observer = new ResizeObserver(calculatePageSize);
    if (tableContainerRef.current) {
        observer.observe(tableContainerRef.current);
    }
    return () => observer.disconnect();
}, [table]);
```

---

### `app/supervisor/csv-list/page.tsx`

| Propiedad | Valor |
|-----------|-------|
| **Ruta** | `/supervisor/csv-list` |
| **Tipo** | Client Component |
| **Líneas** | 138 |
| **Responsabilidad** | Vista de datos CSV importados |

**Estado Local:**
```typescript
const [listados, setListados] = useState<Listado[]>([]);
const [loading, setLoading] = useState(true);
```

**Estadísticas Calculadas:**
```typescript
// Clientes únicos
new Set(listados.map(l => l.cliente)).size

// Total bombas
listados.reduce((acc, l) => acc + l.numeroBombas, 0)
```

**API Call:**
```typescript
const fetchListados = useCallback(async () => {
    const data = await getListados(); // lib/api.ts
    setListados(data);
}, []);
```

---

### `app/supervisor/pdf-extractor/page.tsx`

| Propiedad | Valor |
|-----------|-------|
| **Ruta** | `/supervisor/pdf-extractor` |
| **Tipo** | Client Component |
| **Líneas** | 204 |
| **Responsabilidad** | Subir y extraer datos de PDFs |

**Estado Local:**
```typescript
const [pdfFile, setPdfFile] = useState<File | null>(null);
const [pdfUrl, setPdfUrl] = useState<string | null>(null);
const [extracting, setExtracting] = useState(false);
const [extractedData, setExtractedData] = useState<any>(null);
```

**Preview con iframe:**
```typescript
<iframe
    src={pdfUrl}
    className="w-full h-full absolute inset-0 border-t"
    title="PDF Preview"
/>
```

**TODO:** Migrar lógica de extracción real (actualmente simulada).

---

## 🧩 Componentes de Negocio

### `components/import-modal.tsx`

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | Client Component |
| **Líneas** | 258 |
| **Responsabilidad** | Modal wizard para importar Excel |

**Props:**
```typescript
interface ImportModalProps {
    onImportSuccess: (filename: string, count: number) => void;
}
```

**Estados (Step Machine):**
```typescript
type Step = "upload" | "select-sheet" | "importing" | "success";
const [step, setStep] = useState<Step>("upload");
```

**Flujo:**
1. `upload`: Drag & drop o click para seleccionar archivo
2. `select-sheet`: Si Excel tiene múltiples hojas, mostrar selector
3. `importing`: Spinner mientras se procesa
4. `success`: Feedback con count de registros importados

**API Calls:**
```typescript
// Detectar hojas
POST /api/excel/sheets → { sheets: string[] }

// Importar
POST /api/import-excel → { success: boolean, count: number }
```

---

### `components/theme-toggle.tsx`

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | Client Component |
| **Líneas** | ~40 |
| **Responsabilidad** | Toggle dark/light mode |

**Usa:** `next-themes` para persistir preferencia.

---

### `components/UnitConverter.tsx`

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | Client Component |
| **Líneas** | ~120 |
| **Responsabilidad** | Conversión de unidades (m³/h, GPM, etc.) |

---

## 🎨 Componentes UI (Shadcn)

Todos en `components/ui/`. Generados con `npx shadcn@latest add <component>`.

| Componente | Archivo | Líneas | Base |
|------------|---------|--------|------|
| Accordion | `accordion.tsx` | 75 | Radix Accordion |
| Avatar | `avatar.tsx` | 35 | Radix Avatar |
| Badge | `badge.tsx` | 45 | Personalizado |
| Button | `button.tsx` | 55 | Radix Slot |
| Card | `card.tsx` | 50 | Personalizado |
| Dialog | `dialog.tsx` | 100 | Radix Dialog |
| Dropdown Menu | `dropdown-menu.tsx` | 210 | Radix DropdownMenu |
| Empty | `empty.tsx` | 90 | Personalizado |
| Form | `form.tsx` | 100 | React Hook Form |
| Input | `input.tsx` | 25 | Personalizado |
| Label | `label.tsx` | 20 | Radix Label |
| Resizable | `resizable.tsx` | 55 | react-resizable-panels |
| Scroll Area | `scroll-area.tsx` | 50 | Radix ScrollArea |
| Select | `select.tsx` | 170 | Radix Select |
| Separator | `separator.tsx` | 20 | Radix Separator |
| Sheet | `sheet.tsx` | 110 | Radix Dialog |
| **Sidebar** | `sidebar.tsx` | **727** | Personalizado + Radix |
| Skeleton | `skeleton.tsx` | 10 | Personalizado |
| Sonner | `sonner.tsx` | 30 | sonner |
| Switch | `switch.tsx` | 35 | Radix Switch |
| Table | `table.tsx` | 70 | Personalizado |
| Tooltip | `tooltip.tsx` | 55 | Radix Tooltip |

### Sidebar en Detalle

El componente más grande (727 líneas). Incluye:

**Exports:**
```typescript
export {
    Sidebar,
    SidebarProvider,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger,
    SidebarRail,
    useSidebar, // Hook
    // ... +15 más
};
```

**Context:**
```typescript
type SidebarContextProps = {
    state: "expanded" | "collapsed";
    open: boolean;
    setOpen: (open: boolean) => void;
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    isMobile: boolean;
    toggleSidebar: () => void;
};
```

**Features:**
- Colapsable a iconos
- Versión mobile (Sheet)
- Keyboard shortcut (Ctrl+B)
- Persistencia con cookies
- Tooltips en modo collapsed

---

## 🪝 Hooks

### `hooks/use-mobile.ts`

| Propiedad | Valor |
|-----------|-------|
| **Líneas** | 20 |
| **Responsabilidad** | Detectar si viewport es mobile |

```typescript
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
        const onChange = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };
        mql.addEventListener("change", onChange);
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        return () => mql.removeEventListener("change", onChange);
    }, []);

    return !!isMobile;
}
```

**Uso:**
```typescript
const isMobile = useIsMobile();
// → true si viewport < 768px
```

### `useSidebar()` (en sidebar.tsx)

```typescript
function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.");
    }
    return context;
}
```

**Retorna:**
- `state`: "expanded" | "collapsed"
- `open`, `setOpen`: Estado de sidebar
- `openMobile`, `setOpenMobile`: Estado mobile
- `isMobile`: boolean
- `toggleSidebar`: función

---

## ⚙️ Servicios y Utilidades

### `lib/api.ts`

| Propiedad | Valor |
|-----------|-------|
| **Líneas** | 111 |
| **Responsabilidad** | Cliente HTTP centralizado |

**Base URL:**
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
```

**Wrapper Genérico:**
```typescript
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}
```

**Endpoints:**

| Función | Método | Endpoint |
|---------|--------|----------|
| `login()` | POST | `/api/auth/login` |
| `getTests()` | GET | `/api/tests` |
| `getListados()` | GET | `/api/listados` |
| `importExcel()` | POST | `/api/import-excel` |
| `importCsv()` | POST | `/api/import-csv` |
| `checkHealth()` | GET | `/api/health` |

---

### `lib/pdfExtractionService.ts`

| Propiedad | Valor |
|-----------|-------|
| **Líneas** | 205 |
| **Responsabilidad** | Extraer specs de PDFs Flowserve |

**Funciones Exportadas:**
```typescript
export async function extractSpecsFromPdf(file: File): Promise<ExtractedSpecs>
```

**Campos Extraídos:**
```typescript
interface ExtractedSpecs {
    flowRate?: number;      // Caudal
    head?: number;          // TDH
    rpm?: number;           // Velocidad
    maxPower?: number;      // Potencia
    efficiency?: number;    // Eficiencia
    npshr?: number;         // NPSHr
    qMin?: number;          // Caudal mínimo
    temperature?: number;   // Temperatura
    // ... más campos
}
```

**⚠️ Issue:** Worker carga desde CDN (ver docs/README_PDF_WORKER_FIX.md)

---

### `lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
```

**Uso:** Combinar clases Tailwind sin conflictos.

---

## ✅ Schemas de Validación

### `lib/schemas.ts`

**Schema Principal:**
```typescript
export const technicalSpecsSchema = z.object({
    // Primary
    flowRate: z.coerce.number().min(0.1, "Requerido"),
    head: z.coerce.number().min(0.1, "Requerido"),
    rpm: z.coerce.number().int().min(1, "Requerido"),
    impellerDiameter: z.coerce.number().optional(),
    maxPower: z.coerce.number().optional(),

    // Fluid
    temperature: z.coerce.number().optional(),
    viscosity: z.coerce.number().optional(),
    density: z.coerce.number().optional(),

    // Performance
    npshr: z.coerce.number().optional(),
    efficiency: z.coerce.number().optional(),
    qMin: z.coerce.number().optional(),
    bepFlow: z.coerce.number().optional(),

    // Construction
    tolerance: z.string().optional(),
    sealType: z.string().optional(),
    suctionDiameter: z.coerce.number().optional(),
    dischargeDiameter: z.coerce.number().optional(),
});

export type TechnicalSpecsFormValues = z.infer<typeof technicalSpecsSchema>;
```

**Interfaces Adicionales:**
```typescript
interface TestsToPerform {
    performanceTest?: boolean;
    npsh?: boolean;
    vibraciones?: boolean;
    ruido?: boolean;
    // ...
}

interface GeneralInfo {
    pedido: string;
    cliente: string;
    numeroBombas: number;
    // ...
}
```

---

## 🔗 Referencias Cruzadas

| Desde | Usa |
|-------|-----|
| `supervisor/page.tsx` | `ImportModal`, `api.ts`, TanStack Table |
| `supervisor/layout.tsx` | `Sidebar`, `ThemeToggle`, `useIsMobile` |
| `csv-list/page.tsx` | `api.ts` (`getListados`) |
| `pdf-extractor/page.tsx` | `pdfExtractionService.ts` |
| `login/page.tsx` | `api.ts` (`login`) |
| `ImportModal` | `api.ts` (detect sheets, import) |
| `Sidebar` | `useIsMobile`, `Sheet`, `Tooltip` |
