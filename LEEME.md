# 🚀 Inicio Rápido - Pump IoT Web

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

### Despliegue Normal (Con Internet)
- **[DESPLIEGUE.md](./DESPLIEGUE.md)** - Guía completa en español
- **[Checklist de Despliegue](./docs/DEPLOYMENT_CHECKLIST.md)** - Verificación paso a paso

### Despliegue en Entorno Aislado (Sin Internet)
- **[📚 Índice de Despliegue Air-Gapped](./AIRGAP_DEPLOYMENT_INDEX.md)** - Índice completo de documentación
- **[🔒 Inicio Rápido - Air-Gapped](./AIRGAP_QUICKSTART.md)** - Referencia rápida
- **[🔒 Guía Completa - Despliegue Offline](./OFFLINE_DEPLOYMENT.md)** - Guía detallada para entornos sin internet
- **[🪟 Configuración como Servicio de Windows](./WINDOWS_SERVICE_SETUP.md)** - Para ejecutar como servicio
- **[🔧 Solución de Problemas](./AIRGAP_TROUBLESHOOTING.md)** - Guía completa de resolución de problemas

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
