# Plan de Migración a Monorepo: Supervisor & Operator

## 1. ¿Por qué es viable y recomendable?

Tu intuición es correcta. Separarlos en un **Monorepo** es la arquitectura ideal para este caso porque:

1.  **Desacople Tecnológico**:
    *   **Supervisor (App Corporativa)**: Mantenemos Next.js 16 + React 19 para SSR, SEO y gestión administrativa.
    *   **Operator (HMI Industrial)**: Usamos **Vite + React 18** para garantizar compatibilidad total con librerías 3D (`@react-three/fiber`), WebSockets y rendimiento nativo sin overhead de servidor.

2.  **Gestión Centralizada**: Al ser un solo repositorio (`pump-iot-web`), compartes configuración de Git, Linters y (en el futuro) componentes de UI, sin duplicar repositorios.

3.  **Navegación**:
    *   Funciona como dos sitios web conectados.
    *   Desde el Supervisor, un botón "Ir a Operador" simplemente navega a la URL de la app del operador (`/operator` o `operator.dominio.com`).
    *   Es transparente para el usuario final.

---

## 2. Nueva Estructura Propuesta

Transformaremos la carpeta actual en un espacio de trabajo (Workspace) de pnpm.

```text
pump-iot-web/ (Raíz del Monorepo)
├── package.json          (Scripts globales: "dev", "build")
├── pnpm-workspace.yaml   (Definición de apps)
├── apps/
│   ├── supervisor/       (MOVER la app actual Next.js aquí)
│   │   ├── src/app/supervisor/...
│   │   └── package.json
│   │
│   └── operator/         (NUEVA app Vite React 18)
│       ├── src/          (Migrar src/features/operator aquí)
│       └── package.json
│
└── packages/             (Opcional futuro: UI compartida)
```

---

## 3. Estrategia de Navegación

### En Desarrollo
Correremos ambas apps en paralelo:
*   **Supervisor**: `http://localhost:3000`
*   **Operator**: `http://localhost:5173`

El botón en el Login del Supervisor simplemente apuntará a `http://localhost:5173`.

### En Producción
Usaremos un Reverse Proxy (Nginx) o reglas de despliegue (Vercel/Netlify) para unificarlos:
*   `mi-planta.com/` -> Carga la app Supervisor
*   `mi-planta.com/operator` -> Carga la app Operator

---

## 4. Pasos de Ejecución

1.  **Preparación**: Crear carpetas `apps/` y mover archivos actuales a `apps/supervisor`.
2.  **Inicialización Operator**: Crear `apps/operator` usando Vite + React + TS.
3.  **Migración de Código**:
    *   Mover `src/features/operator` desde Supervisor a Operator.
    *   Instalar dependencias clave en Operator (`three`, `framer-motion`, `lucide-react`).
    *   Restaurar el código 3D original (ya que React 18 lo soportará).
4.  **Limpieza**: Borrar código de operario en la app Supervisor.
5.  **Enlace**: Configurar la navegación entre ambas.

---

## 5. Preguntas Frecuentes

> **¿Es un problema que la lógica esté en el backend?**
> No, es perfecto. Ambas apps (Supervisor y Operator) consumirán la misma API (`:4000`). El frontend solo presenta datos.

> **¿Puede un supervisor entrar al operador?**
> Sí. Solo necesita la URL. Incluso podemos compartir el token de autenticación (guardándolo en cookies o localStorage de dominio principal) para que no tenga que loguearse dos veces.

---

**Estado**: 🕒 Pendiente de Aprobación
