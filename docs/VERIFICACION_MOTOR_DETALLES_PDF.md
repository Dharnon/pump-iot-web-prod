# Verificación: Motor, Detalles y Botón de Colapso PDF

## Estado Actual ✅

Todas las funcionalidades solicitadas **ya están implementadas** en el código:

### 1. Secciones de Motor y Detalles en Vista GENERADO ✅

#### Ubicación en el Código
Archivo: `apps/supervisor/src/features/test-detail/components/DetailView.tsx`

**Motor Section (líneas 252-257):**
```tsx
{viewConfig.showExtendedSections && (
  <MotorDataSection 
    pdfData={test.pdfData} 
    onDataChange={handlePdfDataChange} 
  />
)}
```

**Details Section (líneas 260-265):**
```tsx
{viewConfig.showExtendedSections && (
  <DetailsSection 
    pdfData={test.pdfData} 
    onDataChange={handlePdfDataChange} 
  />
)}
```

#### Configuración
Archivo: `apps/supervisor/src/features/test-detail/types/viewMode.ts`

```typescript
export const GENERATED_VIEW_CONFIG: ViewConfig = {
  mode: 'GENERATED',
  editable: true,
  showPdfUpload: false,
  showSaveButton: true,
  showExtendedSections: true, // ✅ Muestra motor y detalles
  allFieldsEditable: true,
};
```

#### Campos Incluidos

**Motor Section:**
- Marca
- Tipo
- Potencia (kW)
- Velocidad (rpm)
- Intensidad (A)
- Rendimientos: η 25%, η 50%, η 75%, η 100%, η 125%

**Details Section (Detalles y Presiones):**
- Corrección Manométrica (m)
- Presión Atmosférica (mbar)
- Temperatura Agua (°C)
- Temperatura Ambiente (°C)
- Temperatura Lado Acoplamiento (°C)
- Temperatura Lado Bomba (°C)
- Tiempo Funcionamiento (min)
- Comentario (textarea)
- Comentario Interno (textarea)

### 2. Botón de Colapsar/Ocultar PDF ✅

#### Ubicación en el Código
Archivo: `apps/supervisor/src/features/test-detail/components/DetailView.tsx` (líneas 182-206)

```tsx
{viewConfig.mode === 'GENERATED' && (
  <Button 
    variant="ghost" 
    size="sm" 
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePdf();
    }}
    className="h-8 gap-2 text-muted-foreground hover:text-primary transition-colors ml-4"
    title={isPdfExpanded ? "Colapsar PDF" : "Expandir PDF"}
  >
    {isPdfExpanded ? (
      <>
        <EyeOff className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-widest font-bold">
          Ocultar PDF
        </span>
      </>
    ) : (
      <>
        <Eye className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-widest font-bold">
          Ver PDF
        </span>
      </>
    )}
  </Button>
)}
```

#### Funcionalidad
- **Condición:** Solo se muestra cuando `viewConfig.mode === 'GENERATED'`
- **Estados:** 
  - PDF visible: Muestra "Ocultar PDF" con icono EyeOff
  - PDF oculto: Muestra "Ver PDF" con icono Eye
- **Acción:** Llama a `togglePdf()` que colapsa/expande el panel del PDF
- **Ubicación:** En la barra de tabs, junto a "Datos"

## Matriz de Visibilidad por Modo

| Sección/Elemento | PENDING (test/[id]) | GENERATED (protocolo/[id]) |
|------------------|---------------------|----------------------------|
| General Info | ✅ Mostrado | ✅ Mostrado |
| Tests to Perform | ✅ Mostrado | ❌ Oculto |
| Bomba Data | ✅ Mostrado | ✅ Mostrado |
| Fluid H2O | ✅ Mostrado | ✅ Mostrado |
| Fluid | ✅ Mostrado | ✅ Mostrado |
| **Motor** | ❌ Oculto | ✅ **Mostrado** |
| **Details/Presiones** | ❌ Oculto | ✅ **Mostrado** |
| **Botón Colapsar PDF** | ❌ Oculto | ✅ **Mostrado** |

## Flujo de Datos

```
Usuario en protocolo/[id]
    ↓
useTestDetailPage(id, t, 'GENERATED')
    ↓
viewConfig = GENERATED_VIEW_CONFIG
    ↓
viewConfig.showExtendedSections = true
    ↓
DetailView recibe viewConfig
    ↓
Renderiza Motor y Details (condicional showExtendedSections)
    ↓
Renderiza botón colapsar PDF (condicional mode === 'GENERATED')
```

## Pruebas Sugeridas

### Verificación Manual

1. **Acceder a vista GENERADO:**
   ```
   /supervisor/protocolo/{id}
   ```

2. **Verificar secciones visibles:**
   - [ ] General Info se muestra
   - [ ] Bomba Data se muestra
   - [ ] Fluid H2O se muestra
   - [ ] Fluid se muestra
   - [ ] **Motor se muestra** ✅
   - [ ] **Detalles y Presiones se muestra** ✅
   - [ ] Tests to Perform NO se muestra

3. **Verificar botón PDF:**
   - [ ] Botón "Ocultar PDF" / "Ver PDF" visible en barra de tabs
   - [ ] Al hacer clic, el panel PDF se colapsa
   - [ ] Al hacer clic nuevamente, el panel PDF se expande
   - [ ] Icono cambia entre Eye/EyeOff
   - [ ] Texto cambia entre "Ver PDF"/"Ocultar PDF"

4. **Verificar campos editables:**
   - [ ] Todos los campos de Motor son editables
   - [ ] Todos los campos de Detalles son editables
   - [ ] Campos de comentario (textarea) funcionan

### Comparación con Vista PENDING

1. **Acceder a vista PENDING:**
   ```
   /supervisor/test/{id}
   ```

2. **Verificar diferencias:**
   - [ ] Motor NO se muestra
   - [ ] Detalles NO se muestra
   - [ ] Botón colapsar PDF NO se muestra
   - [ ] Tests to Perform SÍ se muestra

## Arquitectura Técnica

### Hooks Utilizados

**usePdfPanel:** (en DetailView vía useTestDetailPage)
```typescript
const {
  isPdfExpanded,    // Estado: PDF expandido o colapsado
  pdfPanelRef,      // Referencia al panel
  togglePdf,        // Función para colapsar/expandir
  onPanelResize,    // Handler para cambios de tamaño
} = hookResult;
```

### Componentes

**MotorDataSection:**
- Archivo: `features/test-detail/components/MotorDataSection.tsx`
- Props: `pdfData`, `onDataChange`
- Campos editables con CleanInput

**DetailsSection:**
- Archivo: `features/test-detail/components/DetailsSection.tsx`
- Props: `pdfData`, `onDataChange`
- Incluye campos numéricos y textareas para comentarios

## Resumen

✅ **Todo está implementado correctamente:**

1. ✅ Motor section se muestra en GENERATED
2. ✅ Details/Presiones section se muestra en GENERATED
3. ✅ Botón de colapsar PDF funcional en GENERATED
4. ✅ Todos los campos son editables
5. ✅ Configuración correcta en viewMode.ts
6. ✅ Renderizado condicional correcto en DetailView.tsx

**No se requieren cambios en el código.**

La funcionalidad está completa y lista para usar en:
- **Ruta:** `/supervisor/protocolo/[id]`
- **Vista:** GENERATED mode
