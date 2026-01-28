# Informe de Viabilidad y Migración: Shadcn/UI a Telerik KendoReact

**Fecha:** 23 Enero 2026
**Objetivo:** Evaluar el impacto, esfuerzo y estrategia para migrar de Shadcn/UI a Telerik KendoReact en un entorno air-gapped.

## 1. Resumen Ejecutivo

Migrar de **Shadcn/UI** (headless, basado en Radix UI + Tailwind) a **Telerik KendoReact** (suite comercial completa) es un cambio arquitectónico fundamental.

*   **Impacto:** Alto. Afecta a casi todas las vistas de `operator` y `supervisor`.
*   **Estimación de Tiempo:** 3-5 semanas (dependiendo de la profundidad de la personalización de estilos).
*   **Veredicto:** Telerik acelerará el desarrollo de funcionalidades complejas (Grids, Schedulers, Charts) pero requerirá una curva de aprendizaje inicial y configuración cuidadosa para el entorno offline.

---

## 2. Análisis del Estado Actual (Shadcn/UI)

Actualmente, el proyecto depende fuertemente de Shadcn/UI.
*   **Apps Afectadas:** `operator` (49 componentes), `supervisor` (34 componentes).
*   **Estilos:** Dependencia total de Tailwind CSS y variables CSS (`globals.css`).
*   **Lógica:** Componentes "copiados y pegados" (arquitectura de Shadcn) que otorgan control total pero requieren mantenimiento manual de cada componente.

## 3. Componentes Clave: Mapeo y Reemplazo

Para replicar y mejorar la funcionalidad actual ("lo que necesito"), estos son los componentes críticos de Telerik que sustituirán a los actuales:

| Funcionalidad | Componente Actual (Shadcn) | Componente Telerik KendoReact | Ventaja Telerik |
| :--- | :--- | :--- | :--- |
| **Tablas de Datos** | `Table`, `DataTable` (TanStack) | **KendoReact Data Grid** | Filtrado, paginación, agrupación, exportación a Excel/PDF nativa "out-of-the-box". |
| **Gráficos** | `Chart` (Recharts) | **KendoReact Charts** | Renderizado Canvas/SVG optimizado, gran variedad de tipos, integrados con el tema. |
| **Heatmap / Kanban** | Desarrollo a medida / `div`s | **KendoReact Scheduler** / **Gantt** | Manejo nativo de recursos, líneas de tiempo complejas y vistas móviles adaptables. |
| **Formularios** | `Form` (React Hook Form) | **KendoReact Form** | Validación integrada, componentes de entrada (Datepicker, Dropdown) robustos. |
| **Layouts** | `Sidebar`, `Sheet`, `Resizable` | **KendoReact Layout** (Drawer, Splitter) | Comportamiento consistente y accesible. |
| **Reportes** | (No implementado / HTML) | **KendoReact PDF Generator** | Generación de PDFs complejos (protocolos) directamente en el cliente. |

## 4. Estrategia de DespliegUE en Sistema Air-gapped

Desplegar software comercial en un entorno sin internet (PLC/SCADA) requiere pasos estrictos.

### A. Gestión de Licencias
Telerik requiere validar la licencia. En un entorno offline, **no se puede validar contra los servidores de Progress**.
1.  **Clave de Licencia:** Se debe descargar un archivo de clave de licencia (`kendo-ui-license.js`) asociado a la cuenta de pago.
2.  **Integración:** Este archivo se importa en el punto de entrada (`main.tsx` o `layout.tsx`) para "activar" los componentes sin llamadas externas.
    ```javascript
    import { installLicense } from '@progress/kendo-licensing';
    installLicense({ ... });
    ```

### B. Dependencias (NPM)
No se podrá ejecutar `npm install` en el servidor de producción.
*   **Opción A (Recomendada): Bundling Total.** Al ejecutar `pnpm build`, todas las dependencias se empaquetan en los archivos estáticos de la carpeta `dist`. Solo se necesita transferir esta carpeta al servidor Web (IIS/Nginx).
*   **Opción B: Verdaccio/Registro Local.** Si se planea desarrollar dentro de la red air-gapped, se debe levantar un registro NPM local (Verdaccio) y replicar los paquetes de Telerik (tgz) en él.

### C. Fuentes e Iconos
Telerik usa iconos y fuentes que a veces se cargan de CDNs.
*   **Acción:** Descargar el paquete `@progress/kendo-font-icons` y `@progress/kendo-svg-icons` e instalarlos como dependencias locales.
*   **Fuentes:** Asegurar que las fuentes (Inter, Roboto) estén en local (`/public/fonts`) y no referenciadas desde Google Fonts.

---

## 5. Cronograma de Migración (Estimación Realista)

Asumiendo un desarrollador Senior dedicado.

### Fase 1: Configuración y "Hello World" (3 Días)
*   Compra y configuración de licencias.
*   Instalación de paquetes base (`@progress/kendo-react-*`).
*   Configuración del TEMA (Theming). Telerik tiene su propio sistema de diseño.
    *   *Desafío:* Adaptar el tema de Telerik (SASS/CSS) para que coincida con la estética "Glassmorphism/Dark" actual de Tailwind, o reescribir las clases de Tailwind para usar las de Kendo. **Esto es lo que más tiempo consume si se quiere mantener el diseño visual exacto.**

### Fase 2: Componentes Nucleares - Supervisor (5-7 Días)
*   Reemplazar `DataTable` complejos por **Kendo Grid**. Esto simplificará mucho código (eliminará mucho boilerplate de TanStack Table).
*   Implementar filtros y exportación a Excel (funcionalidad nativa de Kendo).

### Fase 3: Componentes Nucleares - Operator (5-7 Días)
*   Reemplazar gráficos (`Recharts`) por **Kendo Charts**. Asegurar que el rendimiento en tiempo real (telemetría) se mantenga.
*   Migrar modales y formularios de configuración.

### Fase 4: Heatmap y Vistas Complejas (5 Días)
*   Implementar la vista de Kanban/Heatmap usando **Kendo Scheduler** o componentes de Layout personalizados.

### Fase 5: Pruebas en Entorno Air-gapped (2-3 Días)
*   Simulación de desconexión.
*   Verificación de licencias offline.
*   Validación de carga de fuentes e iconos.

**Total Estimado:** ~20-25 días laborables (1 Mes natural).

---

## 6. Crítica y Riesgos

### Ventajas (Pros)
*   **Velocidad a largo plazo:** Una vez configurado, crear nuevas tablas o dashboards es 10x más rápido que con Shadcn.
*   **Robustez:** Menos errores de integración "casera". Grid y Charts están probados en batalla.
*   **Soporte:** Telerik ofrece soporte técnico real, algo vital para proyectos corporativos críticos.

### Desventajas (Contras)
*   **Pérdida de Flexibilidad Visual:** Shadcn (Tailwind) permite hacer *cualquier* cosa visualmente muy rápido. Telerik es más rígido; personalizarlo para que se vea "increíblemente moderno" y con "glassmorphism" requiere pelear contra sus estilos CSS por defecto (Kendo UI Themes).
*   **Peso del Bundle:** Kendo es más pesado que Shadcn (que es tree-shakeable componente a componente). Podría impactar ligeramente la carga inicial, aunque en una red local (Intranet/PLC) esto es menos relevante.
*   **Coste:** Requiere licencia por desarrollador.

## Conclusión

Si la prioridad es **funcionalidad empresarial robusta** (Grids avanzados, Excel, PDFs) y estabilidad a largo plazo en entorno industrial, la migración a Telerik es **altamente recomendada**.

Si la prioridad es **estética visual única** y control pixel-perfect total con bajo presupuesto de licencia, mantener Shadcn es mejor.

Dada la naturaleza crítica del sistema ("pump-iot", PLC, operación industrial), **Telerik es la opción más segura y profesional**, a pesar del esfuerzo inicial de migración de UI.
