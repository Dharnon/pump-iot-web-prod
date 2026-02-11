# 🚀 Guía de Despliegue - Pump IoT Web Platform

> 📢 **IMPORTANTE**: ¿Vas a desplegar en un entorno sin internet (air-gapped)?  
> → Lee la **[Guía de Despliegue Offline](./OFFLINE_DEPLOYMENT.md)** o el **[Inicio Rápido Air-Gapped](./AIRGAP_QUICKSTART.md)**

## 📋 Tabla de Contenidos
1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Instalación Paso a Paso](#instalación-paso-a-paso)
3. [Configuración](#configuración)
4. [Despliegue](#despliegue)
5. [Verificación](#verificación)
6. [Solución de Problemas](#solución-de-problemas)
7. [Comandos Útiles](#comandos-útiles)

---

## 🖥️ Requisitos del Sistema

### Software Necesario
- **Node.js**: Versión 18.x o superior (recomendado: 20.x LTS)
- **pnpm**: Versión 9.15.4 o superior
- **Git**: Para clonar el repositorio
- **Sistema Operativo**: Linux (Ubuntu/Debian recomendado), Windows con WSL2, o macOS

### Recursos Mínimos de Hardware
- **CPU**: 2 cores
- **RAM**: 4 GB mínimo (8 GB recomendado)
- **Disco**: 10 GB de espacio libre
- **Red**: Conexión a Internet para instalación inicial

---

## 📦 Instalación Paso a Paso

### Paso 1: Instalar Node.js

#### En Ubuntu/Debian:
```bash
# Instalar nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reiniciar terminal o ejecutar:
source ~/.bashrc

# Instalar Node.js LTS
nvm install --lts
nvm use --lts

# Verificar instalación
node --version  # Debe mostrar v20.x.x o superior
npm --version
```

#### En Windows:
Descargar e instalar desde: https://nodejs.org/

### Paso 2: Instalar pnpm

```bash
# Instalar pnpm globalmente
npm install -g pnpm@9.15.4

# Verificar instalación
pnpm --version  # Debe mostrar 9.15.4 o superior
```

### Paso 3: Clonar el Repositorio

```bash
# Navegar al directorio donde quieres instalar la aplicación
cd /home/tuusuario/proyectos

# Clonar el repositorio
git clone https://github.com/Dharnon/pump-iot-web-prod.git

# Entrar al directorio
cd pump-iot-web-prod
```

### Paso 4: Instalar Dependencias

```bash
# Instalar todas las dependencias del monorepo
pnpm install

# Esto instalará:
# - Dependencias del workspace raíz
# - Dependencias de la app supervisor
# - Dependencias de la app operator
# - Dependencias de los paquetes compartidos

# El proceso puede tomar 2-5 minutos dependiendo de tu conexión
```

---

## ⚙️ Configuración

### Variables de Entorno

#### 1. Crear archivo de configuración

```bash
# Copiar el archivo de ejemplo (si existe)
cp .env.example .env.local

# O crear manualmente
nano .env.local
```

#### 2. Configurar variables necesarias

Añade las siguientes variables al archivo `.env.local`:

```bash
# URL del Backend API
# IMPORTANTE: Cambiar localhost por la IP/dominio de tu servidor backend
NEXT_PUBLIC_API_URL=http://localhost:5002

# En producción, usar la IP de tu servidor:
# NEXT_PUBLIC_API_URL=http://192.168.1.100:5002
# O dominio:
# NEXT_PUBLIC_API_URL=https://api.tudominio.com

# Puerto para la aplicación supervisor (opcional, default: 3000)
PORT=3000

# Modo de ejecución
NODE_ENV=production
```

### Configuración Específica para Máquina Virtual

Si estás desplegando en una VM, asegúrate de:

1. **Configurar el firewall** para permitir el puerto 3000:
```bash
# Ubuntu/Debian con ufw
sudo ufw allow 3000/tcp
sudo ufw status
```

2. **Obtener la IP de tu VM**:
```bash
# Ver IP de la máquina
ip addr show
# O
hostname -I
```

3. **Actualizar NEXT_PUBLIC_API_URL** con la IP correcta del backend

---

## 🏗️ Despliegue

### Opción A: Modo Desarrollo (Para Testing)

```bash
# Ejecutar en modo desarrollo
pnpm dev

# Esto iniciará:
# - Supervisor app en http://localhost:3000
# - Operator app en http://localhost:3001
# - Hot reload habilitado
```

### Opción B: Modo Producción (Recomendado)

#### 1. Construir la aplicación

```bash
# Construir todas las apps
pnpm build

# Esto ejecutará:
# - TypeScript compilation
# - Next.js build optimization
# - Asset bundling
# - Tree shaking

# El proceso puede tomar 2-5 minutos
```

#### 2. Iniciar en producción

```bash
# Opción 1: Iniciar manualmente
cd apps/supervisor
pnpm start

# Opción 2: Usar PM2 (recomendado para producción)
# Primero instalar PM2
npm install -g pm2

# Iniciar con PM2
cd apps/supervisor
pm2 start "pnpm start" --name pump-iot-supervisor

# Ver logs
pm2 logs pump-iot-supervisor

# Ver estado
pm2 status

# Reiniciar
pm2 restart pump-iot-supervisor

# Detener
pm2 stop pump-iot-supervisor
```

#### 3. Configurar inicio automático (con PM2)

```bash
# Guardar configuración actual de PM2
pm2 save

# Configurar PM2 para iniciar al arranque del sistema
pm2 startup

# Copiar y ejecutar el comando que PM2 muestra
```

---

## ✅ Verificación

### Verificar que la aplicación está funcionando

1. **Verificar el proceso**:
```bash
# Si usas PM2
pm2 status

# Si ejecutas manualmente, verifica el puerto
sudo netstat -tulpn | grep :3000
```

2. **Probar desde el navegador**:
```
http://localhost:3000          # Desde la misma máquina
http://IP_DE_TU_VM:3000       # Desde otra máquina en la red
```

3. **Verificar logs**:
```bash
# Con PM2
pm2 logs pump-iot-supervisor

# Si ejecutas manualmente, los logs aparecen en la terminal
```

4. **Probar funcionalidades principales**:
- [ ] La página principal carga correctamente
- [ ] Se puede navegar entre secciones
- [ ] La conexión con el backend funciona
- [ ] Se pueden ver listados y protocolos

---

## 🔧 Solución de Problemas

### Problema: "pnpm: command not found"

**Solución**:
```bash
npm install -g pnpm@9.15.4
# O
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### Problema: Error de permisos al instalar

**Solución**:
```bash
# No uses sudo con pnpm
# En su lugar, configura npm para usar directorio local
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Problema: Puerto 3000 ya en uso

**Solución**:
```bash
# Encontrar proceso usando el puerto
sudo lsof -i :3000

# Matar el proceso (reemplaza PID con el número mostrado)
kill -9 PID

# O cambiar el puerto en .env.local
PORT=3001
```

### Problema: Error "Cannot find module"

**Solución**:
```bash
# Limpiar caché y reinstalar
pnpm store prune
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm install
```

### Problema: Build falla con error de memoria

**Solución**:
```bash
# Aumentar límite de memoria para Node.js
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build
```

### Problema: No se conecta al backend

**Verificaciones**:
1. Verificar que el backend está corriendo
2. Verificar NEXT_PUBLIC_API_URL en .env.local
3. Verificar firewall permite la conexión
4. Probar conexión manualmente:
```bash
curl http://localhost:5002/api/health
# O la URL configurada
```

### Problema: Página en blanco después de desplegar

**Solución**:
```bash
# Reconstruir desde cero
pnpm clean  # Si existe el script
# O manualmente
rm -rf .next
rm -rf apps/*/.next
rm -rf apps/*/out
pnpm build
```

---

## 📝 Comandos Útiles

### Gestión de la aplicación

```bash
# Ver todos los scripts disponibles
pnpm run

# Desarrollo
pnpm dev                    # Iniciar todas las apps en desarrollo
pnpm dev --filter supervisor # Solo app supervisor

# Producción
pnpm build                  # Construir todas las apps
pnpm start                  # Iniciar en producción

# Mantenimiento
pnpm lint                   # Verificar código
pnpm type-check            # Verificar tipos TypeScript
```

### Gestión con PM2

```bash
pm2 list                    # Listar todos los procesos
pm2 logs                    # Ver todos los logs
pm2 logs pump-iot-supervisor --lines 100  # Ver últimas 100 líneas
pm2 monit                   # Monitor en tiempo real
pm2 restart all             # Reiniciar todos los procesos
pm2 stop all                # Detener todos los procesos
pm2 delete all              # Eliminar todos los procesos de PM2
```

### Actualización de la aplicación

```bash
# Detener aplicación
pm2 stop pump-iot-supervisor

# Obtener últimos cambios
git pull

# Reinstalar dependencias si es necesario
pnpm install

# Reconstruir
pnpm build

# Reiniciar
pm2 restart pump-iot-supervisor
```

### Backup y Restauración

```bash
# Crear backup de configuración
cp .env.local .env.local.backup
tar -czf backup-$(date +%Y%m%d).tar.gz .env.local apps/supervisor/.next

# Restaurar desde backup
tar -xzf backup-20240211.tar.gz
```

---

## 🌐 Acceso desde Navegador

Una vez desplegada, puedes acceder a la aplicación desde:

- **Localmente**: http://localhost:3000
- **Desde la red local**: http://IP_DE_TU_VM:3000
- **Con dominio** (si lo configuraste): http://tudominio.com

### Configurar Nginx como Proxy Reverso (Opcional pero recomendado)

```bash
# Instalar Nginx
sudo apt update
sudo apt install nginx

# Crear configuración
sudo nano /etc/nginx/sites-available/pump-iot
```

Añadir:
```nginx
server {
    listen 80;
    server_name tudominio.com;  # O la IP de tu servidor

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar configuración
sudo ln -s /etc/nginx/sites-available/pump-iot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `pm2 logs` o la salida de la consola
2. Verifica la sección "Solución de Problemas"
3. Revisa la documentación técnica en `/docs`
4. Contacta al equipo de desarrollo

---

## 📄 Licencia y Notas

- Este proyecto es privado y confidencial
- Mantén las credenciales y configuraciones seguras
- Realiza backups regulares de la configuración
- Mantén el sistema actualizado con parches de seguridad

---

**Última actualización**: Febrero 2026  
**Versión de la guía**: 1.0
