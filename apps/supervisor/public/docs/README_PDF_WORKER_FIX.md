# Fix: PDF Worker para Entorno Air-Gapped

## El Problema

En el archivo `src/lib/pdfExtractionService.ts` línea 5:

```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = 
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
```

Esto carga el worker de PDF.js desde un CDN externo (unpkg.com), lo cual **rompe el funcionamiento en un entorno air-gapped** (sin internet).

---

## ¿Qué es pdfjs-dist?

| Aspecto | Descripción |
|---------|-------------|
| **Qué es** | Librería de Mozilla para renderizar/extraer PDFs en el navegador |
| **Mantenedor** | Mozilla Foundation (creadores de Firefox) |
| **Por qué la usamos** | Extraer specs técnicas de datasheets Flowserve (PDFs) |
| **Alternativas** | pdf-parse (solo Node), react-pdf (wrapper de pdfjs) |

### ¿Por qué elegimos pdfjs-dist?

1. **Estándar de industria** - Mozilla la mantiene activamente
2. **Funciona en browser** - No requiere servidor para procesar
3. **Gratuita y open source** - Licencia Apache 2.0
4. **Soporte para PDFs complejos** - Datasheets con tablas, gráficos, etc.

---

## ¿Por qué necesita un "Worker"?

PDF.js procesa PDFs en un **Web Worker** para:
- No bloquear la UI mientras parsea documentos grandes
- Mejor rendimiento en extracción de texto

El worker es un archivo JavaScript separado que se carga de forma asíncrona.

---

## La Solución

### Paso 1: Localizar el archivo worker

El archivo está en `node_modules/pdfjs-dist/build/pdf.worker.min.mjs`

### Paso 2: Copiar a public/

```powershell
# Desde la raíz del proyecto
Copy-Item "node_modules\pdfjs-dist\build\pdf.worker.min.mjs" -Destination "public\pdf.worker.min.mjs"
```

### Paso 3: Modificar pdfExtractionService.ts

```diff
// src/lib/pdfExtractionService.ts

import * as pdfjsLib from 'pdfjs-dist';

- // Configurar el worker para Next.js
- // Usamos un CDN para evitar problemas con la carga de archivos locales del worker
- pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

+ // Worker local para entorno air-gapped
+ pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
```

### Paso 4: Añadir al .gitignore (opcional)

Si no quieres versionar el worker (se regenera al instalar deps):

```gitignore
# pdfjs worker (se copia en postinstall)
public/pdf.worker.min.mjs
```

### Paso 5: Script de postinstall (recomendado)

Añadir a `package.json` para automatizar la copia:

```json
{
  "scripts": {
    "postinstall": "node -e \"require('fs').copyFileSync('node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'public/pdf.worker.min.mjs')\""
  }
}
```

---

## Verificación

1. Eliminar caché del navegador
2. Desconectar internet
3. Cargar la página de extracción PDF
4. Subir un PDF de prueba
5. ✅ Debería funcionar sin errores de red

---

## ¿Deberíamos usar otra librería?

| Alternativa | Pros | Contras | Recomendación |
|-------------|------|---------|---------------|
| **pdf-parse** | Más simple | Solo Node.js, no browser | ❌ No aplica |
| **react-pdf** | Fácil de usar | Es wrapper de pdfjs | ⚠️ Mismo problema |
| **Mantener pdfjs** | Estándar, potente | Requiere este fix | ✅ **Recomendado** |

**Conclusión**: pdfjs-dist es la elección correcta. Solo necesita este pequeño fix para air-gap.

---

## Checklist de Implementación

- [ ] Copiar `pdf.worker.min.mjs` a `public/`
- [ ] Modificar `pdfExtractionService.ts`
- [ ] Añadir script postinstall a `package.json`
- [ ] Probar en entorno sin internet
- [ ] Documentar en README del proyecto
