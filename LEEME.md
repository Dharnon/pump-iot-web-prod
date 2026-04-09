# Pump IoT Web Platform

## ¿De qué va este proyecto?

**Pump IoT Web** es una aplicación web industrial diseñada para gestionar, ejecutar y certificar ensayos de rendimiento de bombas hidráulicas en el **banco de pruebas de Flowserve**.

### Objetivo

La plataforma digitaliza todo el flujo de trabajo de prueba de bombas — desde la recepción de un pedido hasta la emisión del certificado de rendimiento — eliminando los procesos en papel y aportando visibilidad en tiempo real sobre cada ensayo.

### ¿Quiénes la usan?

| Rol | Responsabilidad |
|-----|-----------------|
| **Supervisor** | Recibe los pedidos de ensayo, los planifica en los bancos de prueba, revisa los protocolos y gestiona los usuarios y la configuración. |
| **Operador** | Ejecuta el ensayo físico desde un cockpit dedicado: controla la bomba (velocidad del motor, apertura de válvula), monitoriza la telemetría en directo, captura puntos de operación y aprueba los resultados. |

### Funcionalidades principales

- **Bandeja de entrada (Inbox)** – Los supervisores reciben y gestionan los pedidos de ensayo (cliente, modelo de bomba, número de pedido).
- **Planificación de ensayos** – Asignación de trabajos a los distintos bancos de prueba (Banco A, B, C…) con cola de prioridad.
- **Cockpit del operador** – Panel de control en tiempo real para arrancar/parar el motor, ajustar velocidad y apertura de válvula, y visualizar medidores en vivo (presión, caudal, temperatura, potencia, NPSH).
- **Telemetría en vivo** – Flujo de datos continuo desde el banco físico vía SignalR, mostrado como gráficas y lecturas numéricas.
- **Captura de puntos** – Los operadores registran puntos de operación estabilizados que construyen la curva Q-H (caudal vs. altura) medida.
- **Analítica** – Comparación automática de la curva medida frente a la curva de diseño teórica, con determinación de conformidad (OK/KO) según el protocolo de ensayo ISO/IEC.
- **Informes PDF** – Generación con un solo clic del certificado de ensayo firmado, listo para entregar al cliente.
- **Gestión de usuarios** – Los supervisores crean, editan y desactivan cuentas de operador y asignan a cada operador su banco de prueba.

---

## 🚀 Inicio Rápido

## Para Comenzar Inmediatamente

### Opción 1: Script Automático (Recomendado)

```bash
# Clonar el repositorio
git clone https://github.com/Dharnon/pump-iot-web-prod.git
cd pump-iot-web-prod

# Ejecutar script de instalación
bash scripts/quick-start.sh
```

El script automáticamente:
- ✅ Verifica requisitos del sistema
- ✅ Instala dependencias necesarias
- ✅ Configura variables de entorno
- ✅ Construye la aplicación
- ✅ Muestra los siguientes pasos

---

### Opción 2: Instalación Manual

#### 1. Requisitos Previos
```bash
# Verificar Node.js (necesitas v18 o superior)
node --version

# Si no tienes Node.js o es una versión antigua:
# Instala desde https://nodejs.org/
```

#### 2. Instalar pnpm
```bash
npm install -g pnpm@9.15.4
```

#### 3. Instalar Dependencias
```bash
pnpm install
```

#### 4. Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar y configurar NEXT_PUBLIC_API_URL
nano .env.local
```

#### 5. Iniciar la Aplicación

**Modo Desarrollo:**
```bash
pnpm dev
# Abre http://localhost:3000
```

**Modo Producción:**
```bash
# Construir
pnpm build

# Iniciar
cd apps/supervisor
pnpm start

# O con PM2 (recomendado)
npm install -g pm2
pm2 start "pnpm start" --name pump-iot
```

---

## 📚 Documentación Completa

Para instrucciones detalladas de despliegue en producción:

- **[DESPLIEGUE.md](./DESPLIEGUE.md)** - Guía completa en español
- **[Checklist de Despliegue](./docs/DEPLOYMENT_CHECKLIST.md)** - Verificación paso a paso

---

## 🆘 Problemas Comunes

### Error: "pnpm: command not found"
```bash
npm install -g pnpm@9.15.4
```

### Error: Puerto 3000 en uso
```bash
# Ver qué está usando el puerto
sudo lsof -i :3000

# O cambiar el puerto en .env.local
PORT=3001
```

### No se conecta al backend
1. Verifica que el backend esté corriendo
2. Revisa la variable `NEXT_PUBLIC_API_URL` en `.env.local`
3. Verifica conectividad: `curl http://localhost:5002`

---

## 📞 Soporte

- Documentación técnica: `/docs`
- Guía de arquitectura: `ARCHITECTURE.md`
- Problemas conocidos: Ver `DESPLIEGUE.md` sección "Solución de Problemas"

---

## 🎯 Estructura del Proyecto

```
pump-iot-web-prod/
├── apps/
│   ├── supervisor/     # Aplicación principal
│   └── operator/       # Aplicación del operador
├── packages/           # Paquetes compartidos
├── docs/              # Documentación
├── scripts/           # Scripts de utilidad
├── DESPLIEGUE.md     # Guía de despliegue (LEER PRIMERO)
└── .env.example      # Plantilla de variables de entorno
```

---

**¿Primera vez?** → Lee [DESPLIEGUE.md](./DESPLIEGUE.md)  
**Despliegue rápido?** → Ejecuta `bash scripts/quick-start.sh`  
**Problemas?** → Revisa la sección de Solución de Problemas
