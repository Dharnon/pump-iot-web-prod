# 📦 Cómo Entregar Este Proyecto a un Compañero

## 🎯 Objetivo
Esta guía explica cómo entregar este proyecto a un compañero para que pueda desplegarlo en su máquina virtual sin problemas.

---

## 📋 Lo Que Has Preparado

### ✅ Documentación Completa en Español

1. **`LEEME.md`** - Inicio rápido (2 minutos de lectura)
   - Comandos básicos para comenzar
   - Opciones de instalación automática y manual
   
2. **`DESPLIEGUE.md`** - Guía completa (15-20 minutos de lectura)
   - Requisitos del sistema
   - Instalación paso a paso
   - Configuración detallada
   - Despliegue en producción
   - Solución de 10+ problemas comunes
   - Comandos de mantenimiento

3. **`docs/DEPLOYMENT_CHECKLIST.md`** - Checklist de verificación
   - Permite verificar que todo está correcto
   - Útil para no olvidar ningún paso

### ✅ Herramientas de Automatización

1. **`scripts/quick-start.sh`** - Script de instalación automática
   - Verifica requisitos del sistema
   - Instala dependencias
   - Configura el entorno
   - Construye la aplicación (opcional)

2. **`.env.example`** - Plantilla de configuración
   - Muestra todas las variables necesarias
   - Incluye ejemplos y comentarios

---

## 🚀 Cómo Entregar el Proyecto

### Opción A: Repositorio Git (Recomendado)

```bash
# Tu compañero solo necesita:
git clone https://github.com/Dharnon/pump-iot-web-prod.git
cd pump-iot-web-prod

# Y ejecutar:
bash scripts/quick-start.sh

# Luego configurar la URL del backend en .env.local
nano .env.local
# Cambiar: NEXT_PUBLIC_API_URL=http://IP_DEL_BACKEND:5002
```

**¡Eso es todo!** El script hace el resto automáticamente.

### Opción B: Archivo ZIP

Si prefieres entregar un archivo:

1. **Crear el paquete:**
```bash
# En tu máquina
cd ..
tar -czf pump-iot-web.tar.gz pump-iot-web-prod/
```

2. **Transferir el archivo:**
- Envía `pump-iot-web.tar.gz` por email, USB, o servicio de archivos

3. **Instrucciones para tu compañero:**
```bash
# Descomprimir
tar -xzf pump-iot-web.tar.gz
cd pump-iot-web-prod

# Ejecutar instalación
bash scripts/quick-start.sh

# Configurar backend
nano .env.local
```

---

## 📝 Instrucciones para Tu Compañero

### Paso 1: Preparar la Máquina Virtual

**Requisitos Mínimos:**
- Ubuntu 20.04 o superior (o similar)
- 4GB de RAM
- 10GB de espacio libre
- Conexión a Internet

**Comandos iniciales:**
```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar herramientas básicas
sudo apt install curl git build-essential -y
```

### Paso 2: Obtener el Proyecto

**Opción Git:**
```bash
git clone https://github.com/Dharnon/pump-iot-web-prod.git
cd pump-iot-web-prod
```

**Opción ZIP:**
```bash
tar -xzf pump-iot-web.tar.gz
cd pump-iot-web-prod
```

### Paso 3: Ejecutar Instalación Automática

```bash
bash scripts/quick-start.sh
```

El script:
- ✅ Verifica que Node.js esté instalado (v18+)
- ✅ Instala pnpm si no existe
- ✅ Verifica Git
- ✅ Instala todas las dependencias
- ✅ Crea archivo .env.local
- ✅ Pregunta si construir la aplicación
- ✅ Muestra los siguientes pasos

### Paso 4: Configurar Variables de Entorno

```bash
nano .env.local
```

**Cambiar:**
```bash
# De esto:
NEXT_PUBLIC_API_URL=http://localhost:5002

# A esto (usando la IP del servidor backend):
NEXT_PUBLIC_API_URL=http://192.168.1.100:5002
```

### Paso 5: Iniciar la Aplicación

**Para producción (recomendado):**
```bash
# Instalar PM2
npm install -g pm2

# Ir a la app
cd apps/supervisor

# Iniciar con PM2
pm2 start "pnpm start" --name pump-iot

# Configurar inicio automático
pm2 save
pm2 startup
```

**Para testing:**
```bash
pnpm dev
```

### Paso 6: Verificar que Funciona

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs pump-iot

# Probar en navegador:
# http://IP_DE_LA_VM:3000
```

---

## 📞 Material de Soporte para Tu Compañero

### Archivos a Revisar (en orden)

1. **`LEEME.md`** - Leer primero (5 min)
   - Comandos básicos
   - Problemas comunes
   
2. **`DESPLIEGUE.md`** - Leer si necesita más detalles (20 min)
   - Instrucciones completas
   - Solución de problemas
   - Comandos avanzados

3. **`docs/DEPLOYMENT_CHECKLIST.md`** - Usar durante el despliegue
   - Marcar cada paso completado
   - Verificar que nada falta

### Comandos de Ayuda Rápida

```bash
# Ver documentación
cat LEEME.md              # Inicio rápido
less DESPLIEGUE.md        # Guía completa

# Verificar instalación
node --version            # Debe ser v18+
pnpm --version            # Debe estar instalado

# Ver estado de la app
pm2 status                # Con PM2
pm2 logs pump-iot         # Ver logs

# Reiniciar aplicación
pm2 restart pump-iot

# Ver qué usa el puerto 3000
sudo lsof -i :3000

# Probar conexión con backend
curl http://localhost:5002/api/health
```

---

## 🎓 Capacitación Rápida (15 minutos)

Si puedes hacer una sesión con tu compañero:

### 1. Mostrar la Estructura (3 min)
```bash
cd pump-iot-web-prod
tree -L 2 -d
# Explicar: apps/, docs/, scripts/
```

### 2. Mostrar el Script de Instalación (2 min)
```bash
cat scripts/quick-start.sh
# Explicar qué hace cada paso
```

### 3. Ejecutar una Instalación Demo (5 min)
```bash
bash scripts/quick-start.sh
# Dejar que vea el proceso
```

### 4. Mostrar Configuración (2 min)
```bash
cat .env.example
nano .env.local
# Explicar NEXT_PUBLIC_API_URL
```

### 5. Mostrar Comandos Básicos (3 min)
```bash
pnpm dev              # Desarrollo
pnpm build            # Construcción
pm2 start/stop/logs   # Gestión en producción
```

---

## ⚠️ Puntos Importantes a Mencionar

### 1. Variables de Entorno
- **CRÍTICO:** Debe configurar `NEXT_PUBLIC_API_URL` con la IP correcta del backend
- Sin esto, la aplicación no se conectará

### 2. Firewall
```bash
# Debe permitir puerto 3000
sudo ufw allow 3000/tcp
sudo ufw status
```

### 3. Backend
- La aplicación NECESITA el backend corriendo
- Verificar con: `curl http://IP_BACKEND:5002/api/health`

### 4. PM2 para Producción
- Usar PM2 en producción, no `pnpm dev`
- PM2 reinicia automáticamente si hay crashes
- Logs centralizados con `pm2 logs`

### 5. Actualizaciones
```bash
# Para actualizar en el futuro:
git pull
pnpm install
pnpm build
pm2 restart pump-iot
```

---

## 📧 Plantilla de Email para Tu Compañero

```
Asunto: Proyecto Pump IoT Web - Instrucciones de Despliegue

Hola [Nombre],

Te envío el proyecto Pump IoT Web para que lo despliegues en tu VM.

INICIO RÁPIDO:
1. Clona el repositorio: git clone [URL]
2. Ejecuta: bash scripts/quick-start.sh
3. Configura .env.local con la IP del backend
4. Inicia con: pm2 start "pnpm start" --name pump-iot

DOCUMENTACIÓN:
- LEEME.md - Inicio rápido (leer primero)
- DESPLIEGUE.md - Guía completa
- docs/DEPLOYMENT_CHECKLIST.md - Checklist de verificación

CONFIGURACIÓN IMPORTANTE:
En el archivo .env.local, cambia:
NEXT_PUBLIC_API_URL=http://IP_DEL_BACKEND:5002

REQUISITOS:
- Ubuntu/Debian
- Node.js 18+ (el script lo verifica)
- 4GB RAM, 10GB disco
- Puerto 3000 disponible

Si tienes problemas, revisa la sección "Solución de Problemas" en DESPLIEGUE.md

Saludos,
[Tu nombre]
```

---

## ✅ Checklist de Entrega

Antes de entregar, verifica:

- [ ] Todos los archivos están en el repositorio
- [ ] `.env.example` existe y está documentado
- [ ] Scripts tienen permisos de ejecución (`chmod +x scripts/*.sh`)
- [ ] Documentación está completa y en español
- [ ] Has probado el proceso de instalación en una VM limpia
- [ ] Backend está accesible y funcionando
- [ ] IP del backend está disponible para configurar

---

## 🎉 Resumen

Tu compañero tiene TODO lo necesario:

✅ **Documentación completa en español**
- Inicio rápido (LEEME.md)
- Guía detallada (DESPLIEGUE.md)
- Checklist de verificación

✅ **Herramientas automáticas**
- Script de instalación (quick-start.sh)
- Plantilla de configuración (.env.example)

✅ **Soporte**
- Solución de problemas comunes
- Comandos útiles
- Estructura clara

**Con solo ejecutar `bash scripts/quick-start.sh` y configurar la IP del backend, estará listo! 🚀**

---

**Nota Final:** Este proyecto está diseñado para que cualquier persona con conocimientos básicos de Linux pueda desplegarlo sin ayuda externa. La documentación cubre desde lo más básico hasta configuraciones avanzadas.

¡Buena suerte con la entrega! 🎯
