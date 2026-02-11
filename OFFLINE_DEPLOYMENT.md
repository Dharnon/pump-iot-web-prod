# 🔒 Offline Deployment Guide - Air-Gapped Environment

**Version**: 1.0  
**Last Updated**: February 2026  
**Target**: VMware / Windows Server / Linux Server (Air-Gapped)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Bundle Preparation (On Internet-Connected Machine)](#bundle-preparation)
4. [Transfer to Air-Gapped Environment](#transfer)
5. [Installation on Air-Gapped Machine](#installation)
6. [Windows Service Setup](#windows-service-setup)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)
9. [Updates and Maintenance](#updates-and-maintenance)

---

## 🎯 Overview

This guide explains how to deploy the Pump IoT Web Platform in an **air-gapped environment** (no internet access). The process involves:

1. **Preparation Phase**: Create an offline bundle on a machine with internet access
2. **Transfer Phase**: Move the bundle to the air-gapped environment
3. **Installation Phase**: Deploy and configure on the target machine
4. **Service Setup**: Configure as a Windows service (optional)

### Why This Approach?

- ✅ No internet required during deployment
- ✅ All dependencies bundled
- ✅ Pre-built artifacts included
- ✅ Reproducible deployments
- ✅ Compliant with industrial security policies

---

## 🖥️ Prerequisites

### On Preparation Machine (With Internet)

- Node.js 18.x or higher
- pnpm 9.15.4 or higher
- Git (to clone the repository)
- Sufficient disk space (≈2-3 GB for bundle)

### On Target Machine (Air-Gapped)

**Must be installed BEFORE disconnecting from internet:**

#### 1. Node.js 18.x LTS or higher

**Download offline installer:**

- **Windows**: Download `.msi` from https://nodejs.org/
  - File: `node-v20.x.x-x64.msi` (≈30 MB)
  
- **Linux**: Download binary tarball
  ```bash
  # On internet-connected machine
  wget https://nodejs.org/dist/v20.11.0/node-v20.11.0-linux-x64.tar.xz
  ```

#### 2. pnpm Package Manager

**Option A: Bundle with npm (recommended)**

On internet-connected machine:
```bash
npm pack pnpm@9.15.4
# This creates: pnpm-9.15.4.tgz
```

On air-gapped machine:
```bash
npm install -g pnpm-9.15.4.tgz
```

**Option B: Use standalone binary**
```bash
# On internet-connected machine
curl -fsSL https://get.pnpm.io/install.sh > pnpm-install.sh
# Transfer pnpm-install.sh to air-gapped machine
```

#### 3. (Optional) PM2 Process Manager

For production deployments:
```bash
# On internet-connected machine
npm pack pm2
# Transfer pm2-x.x.x.tgz to air-gapped machine
```

---

## 📦 Bundle Preparation

### Step 1: Clone the Repository

On a machine with internet access:

```bash
git clone https://github.com/Dharnon/pump-iot-web-prod.git
cd pump-iot-web-prod
```

### Step 2: Run Bundle Preparation Script

```bash
bash scripts/prepare-offline-bundle.sh
```

This script will:
- ✅ Verify prerequisites
- ✅ Install all dependencies
- ✅ Build production artifacts
- ✅ Package dependencies for offline use
- ✅ Create installation scripts
- ✅ Generate documentation
- ✅ Create compressed archive

**Output**: `pump-iot-offline-bundle-YYYYMMDD-HHMMSS.tar.gz`

**Expected size**: 500 MB - 1.5 GB (compressed)

### Step 3: Verify Bundle

```bash
# Verify checksum
sha256sum -c pump-iot-offline-bundle-*.tar.gz.sha256

# List contents (optional)
tar -tzf pump-iot-offline-bundle-*.tar.gz | head -20
```

---

## 🔄 Transfer to Air-Gapped Environment

### Methods

**1. USB Drive / External Storage**
```bash
# Copy bundle to USB
cp pump-iot-offline-bundle-*.tar.gz /media/usb/
cp pump-iot-offline-bundle-*.tar.gz.sha256 /media/usb/
```

**2. Secure File Transfer (if available)**
```bash
scp pump-iot-offline-bundle-*.tar.gz user@airgapped-server:/tmp/
```

**3. CD/DVD Burn**
- Burn the `.tar.gz` file to disc
- Recommended for highly secure environments

### Files to Transfer

- ✅ `pump-iot-offline-bundle-YYYYMMDD-HHMMSS.tar.gz` (main bundle)
- ✅ `pump-iot-offline-bundle-YYYYMMDD-HHMMSS.tar.gz.sha256` (checksum)
- ✅ `node-v20.x.x-x64.msi` or `.tar.xz` (if not installed)
- ✅ `pnpm-9.15.4.tgz` (if not installed)
- ✅ `pm2-x.x.x.tgz` (optional, for production)

---

## ⚙️ Installation on Air-Gapped Machine

### Step 1: Install Prerequisites (if not done)

**Install Node.js:**

**Windows:**
```cmd
REM Double-click node-v20.x.x-x64.msi and follow wizard
REM Or via command line:
msiexec /i node-v20.11.0-x64.msi /quiet
```

**Linux:**
```bash
# Extract Node.js binary
tar -xJf node-v20.11.0-linux-x64.tar.xz
sudo mv node-v20.11.0-linux-x64 /opt/nodejs
sudo ln -s /opt/nodejs/bin/node /usr/local/bin/node
sudo ln -s /opt/nodejs/bin/npm /usr/local/bin/npm

# Verify
node --version
npm --version
```

**Install pnpm:**
```bash
npm install -g pnpm-9.15.4.tgz
pnpm --version
```

### Step 2: Extract Bundle

**Windows:**
```cmd
REM Use 7-Zip or built-in extractor
tar -xzf pump-iot-offline-bundle-20260211-143000.tar.gz
cd pump-iot-offline-bundle-20260211-143000
```

**Linux:**
```bash
tar -xzf pump-iot-offline-bundle-20260211-143000.tar.gz
cd pump-iot-offline-bundle-20260211-143000
```

### Step 3: Verify Checksum (Important!)

```bash
# Windows (PowerShell)
Get-FileHash pump-iot-offline-bundle-*.tar.gz -Algorithm SHA256

# Linux
sha256sum -c pump-iot-offline-bundle-*.tar.gz.sha256
```

### Step 4: Run Installation Script

**Windows:**
```cmd
install-offline.bat
```

**Linux/Mac:**
```bash
chmod +x install-offline.sh
./install-offline.sh
```

The script will:
- ✅ Restore dependencies from offline store
- ✅ Copy pre-built artifacts
- ✅ Set up project structure

### Step 5: Configure Environment

```bash
cd source
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Backend API URL (update with your server IP)
NEXT_PUBLIC_API_URL=http://192.168.1.100:5002

# Port configuration
PORT=3000

# Environment
NODE_ENV=production
```

### Step 6: Start the Application

**Option A: Direct Start (for testing)**
```bash
cd source/apps/supervisor
pnpm start
```

**Option B: With PM2 (recommended for production)**
```bash
# Install PM2 (if transferred as .tgz)
npm install -g pm2-x.x.x.tgz

# Start application
cd source/apps/supervisor
pm2 start "pnpm start" --name pump-iot-supervisor

# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup
# Follow the command shown by PM2
```

---

## 🪟 Windows Service Setup

### Method 1: Using NSSM (Recommended)

**1. Download NSSM (on internet-connected machine)**
```
Download from: https://nssm.cc/download
Transfer nssm-2.24.zip to air-gapped machine
```

**2. Extract and Install Service**
```cmd
REM Extract NSSM
unzip nssm-2.24.zip
cd nssm-2.24\win64

REM Install as service
nssm install PumpIoTWeb "C:\Program Files\nodejs\pnpm.cmd" start
nssm set PumpIoTWeb AppDirectory "C:\pump-iot-web\source\apps\supervisor"
nssm set PumpIoTWeb DisplayName "Pump IoT Web Platform"
nssm set PumpIoTWeb Description "Industrial Pump Testing Platform"
nssm set PumpIoTWeb Start SERVICE_AUTO_START

REM Start service
nssm start PumpIoTWeb

REM Check status
nssm status PumpIoTWeb
```

**3. Service Management**
```cmd
REM Stop service
nssm stop PumpIoTWeb

REM Restart service
nssm restart PumpIoTWeb

REM Remove service
nssm remove PumpIoTWeb confirm
```

### Method 2: Using node-windows

**1. Install node-windows (bundle on internet machine)**
```bash
npm pack node-windows
# Transfer to air-gapped machine
```

**2. Create Service Script**

Create `install-service.js`:
```javascript
const Service = require('node-windows').Service;

const svc = new Service({
  name: 'Pump IoT Web',
  description: 'Pump IoT Web Platform - Industrial Testing System',
  script: 'C:\\pump-iot-web\\source\\apps\\supervisor\\node_modules\\next\\dist\\bin\\next',
  scriptOptions: 'start',
  nodeOptions: [],
  workingDirectory: 'C:\\pump-iot-web\\source\\apps\\supervisor',
  env: [{
    name: "NODE_ENV",
    value: "production"
  }]
});

svc.on('install', () => {
  console.log('Service installed successfully');
  svc.start();
});

svc.on('start', () => {
  console.log('Service started');
});

svc.install();
```

**3. Install Service**
```cmd
REM Install node-windows
npm install -g node-windows-x.x.x.tgz

REM Run installation script (as Administrator)
node install-service.js
```

### Method 3: Using PM2 with pm2-windows-service

```cmd
REM Install PM2 and pm2-windows-service
npm install -g pm2-x.x.x.tgz
npm install -g pm2-windows-service-x.x.x.tgz

REM Setup PM2 as Windows Service
pm2-service-install -n PumpIoTPM2

REM Start application with PM2
cd C:\pump-iot-web\source\apps\supervisor
pm2 start "pnpm start" --name pump-iot
pm2 save
```

---

## ✅ Verification

### 1. Check Application Status

```bash
# If using PM2
pm2 status

# If using direct start
# Check if port 3000 is listening
netstat -an | grep 3000  # Linux
netstat -an | findstr 3000  # Windows
```

### 2. Test HTTP Access

```bash
# From the server itself
curl http://localhost:3000

# From another machine on the network
curl http://SERVER_IP:3000
```

### 3. Browser Test

Open browser and navigate to:
- `http://localhost:3000` (from server)
- `http://192.168.1.100:3000` (from network)

### 4. Check Logs

**PM2 Logs:**
```bash
pm2 logs pump-iot-supervisor
pm2 logs --lines 100
```

**Direct Start:**
Logs appear in the console where you ran `pnpm start`

**Windows Service (NSSM):**
```cmd
REM Logs stored in:
REM C:\pump-iot-web\source\apps\supervisor\logs
```

---

## 🔧 Troubleshooting

### Issue: "Cannot find module"

**Cause**: Dependencies not properly restored

**Solution**:
```bash
cd source
rm -rf node_modules apps/*/node_modules packages/*/node_modules
./install-offline.sh  # Re-run installation
```

### Issue: "Port 3000 already in use"

**Solution**:
```bash
# Find process using port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux
lsof -i :3000
kill -9 <PID>

# Or change port in .env.local
PORT=3001
```

### Issue: "Build artifacts not found"

**Cause**: Build not included in bundle or corrupted

**Solution**:
```bash
cd source
pnpm install --offline
pnpm build
```

### Issue: Service won't start on Windows

**Check:**
1. Node.js path is correct
2. Service has proper permissions
3. Check Windows Event Viewer for errors
4. Verify .env.local exists and is configured

**Solution**:
```cmd
REM Check NSSM logs
nssm set PumpIoTWeb AppStdout C:\pump-iot-logs\stdout.log
nssm set PumpIoTWeb AppStderr C:\pump-iot-logs\stderr.log
nssm restart PumpIoTWeb
type C:\pump-iot-logs\stderr.log
```

### Issue: Application accessible locally but not from network

**Cause**: Firewall blocking port

**Windows Firewall:**
```cmd
REM Add firewall rule (as Administrator)
netsh advfirewall firewall add rule name="Pump IoT Web" dir=in action=allow protocol=TCP localport=3000
```

**Linux Firewall (ufw):**
```bash
sudo ufw allow 3000/tcp
sudo ufw status
```

### Issue: "pnpm: command not found" in service

**Cause**: pnpm not in system PATH for service account

**Solution**:
```cmd
REM For NSSM, use full path to pnpm
nssm set PumpIoTWeb Application "C:\Users\YourUser\AppData\Roaming\npm\pnpm.cmd"
```

---

## 🔄 Updates and Maintenance

### Updating the Application (Offline)

**1. Prepare new bundle** (on internet-connected machine):
```bash
git pull
bash scripts/prepare-offline-bundle.sh
```

**2. Transfer new bundle** to air-gapped machine

**3. Stop current application:**
```bash
# PM2
pm2 stop pump-iot-supervisor

# Windows Service
nssm stop PumpIoTWeb
```

**4. Backup current installation:**
```bash
cp -r source source.backup.$(date +%Y%m%d)
```

**5. Extract and install new bundle:**
```bash
tar -xzf pump-iot-offline-bundle-NEW.tar.gz
cd pump-iot-offline-bundle-NEW
./install-offline.sh
```

**6. Restore configuration:**
```bash
cp source.backup.YYYYMMDD/.env.local source/.env.local
```

**7. Restart application:**
```bash
# PM2
pm2 restart pump-iot-supervisor

# Windows Service
nssm start PumpIoTWeb
```

### Monitoring and Logs

**PM2 Monitoring:**
```bash
pm2 monit                    # Real-time monitoring
pm2 logs --lines 200         # View logs
pm2 status                   # Check status
```

**Log Rotation (PM2):**
```bash
npm install -g pm2-logrotate-x.x.x.tgz  # Install on air-gapped machine
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Backup Strategy

**Daily Backup Script** (Linux):
```bash
#!/bin/bash
BACKUP_DIR="/backup/pump-iot"
DATE=$(date +%Y%m%d)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/pump-iot-backup-$DATE.tar.gz \
  /pump-iot-web/source/.env.local \
  /pump-iot-web/source/apps/supervisor/.next

# Keep only last 7 days
find $BACKUP_DIR -name "pump-iot-backup-*.tar.gz" -mtime +7 -delete
```

**Windows Task Scheduler** for backups:
```cmd
REM Create backup.bat
@echo off
set BACKUP_DIR=C:\Backups\pump-iot
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%
mkdir %BACKUP_DIR%
tar -czf %BACKUP_DIR%\pump-iot-backup-%DATE%.tar.gz C:\pump-iot-web\source\.env.local
```

---

## 📞 Support

### Pre-Deployment Checklist

- [ ] Node.js installed and working (v18+)
- [ ] pnpm installed and working (v9.15.4+)
- [ ] Offline bundle transferred and verified (checksum)
- [ ] Backend API accessible from deployment server
- [ ] Firewall rules configured (port 3000)
- [ ] Environment variables configured (.env.local)
- [ ] Application starts successfully
- [ ] Accessible from browser
- [ ] Service configured for auto-start (production)

### Quick Reference

| Task | Command |
|------|---------|
| Start application | `cd source/apps/supervisor && pnpm start` |
| Start with PM2 | `pm2 start "pnpm start" --name pump-iot` |
| Check PM2 status | `pm2 status` |
| View PM2 logs | `pm2 logs pump-iot` |
| Stop PM2 app | `pm2 stop pump-iot` |
| Restart PM2 app | `pm2 restart pump-iot` |
| Start NSSM service | `nssm start PumpIoTWeb` |
| Stop NSSM service | `nssm stop PumpIoTWeb` |
| Check NSSM status | `nssm status PumpIoTWeb` |

### Getting Help

1. Check logs first (PM2 or service logs)
2. Review this troubleshooting section
3. Check main deployment guide: `DESPLIEGUE.md`
4. Check architecture docs: `ARCHITECTURE.md`
5. Contact development team with:
   - Error logs
   - Environment details
   - Steps to reproduce

---

## 📄 Additional Resources

- **Main Deployment Guide**: [DESPLIEGUE.md](./DESPLIEGUE.md)
- **Architecture Overview**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **README**: [README.md](./README.md)
- **Scripts**: `scripts/` directory

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**Maintained by**: Pump IoT Development Team
