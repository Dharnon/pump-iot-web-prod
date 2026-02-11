# 🚀 Quick Start - Air-Gapped Deployment

**Quick reference for deploying in air-gapped environments**

---

## 📦 Phase 1: Prepare Bundle (Internet-Connected Machine)

```bash
# Clone repository
git clone https://github.com/Dharnon/pump-iot-web-prod.git
cd pump-iot-web-prod

# Run bundle preparation script
bash scripts/prepare-offline-bundle.sh

# Result: pump-iot-offline-bundle-YYYYMMDD-HHMMSS.tar.gz
```

**Also download these installers:**
- Node.js 20.x: https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
- pnpm: `npm pack pnpm@9.15.4` → `pnpm-9.15.4.tgz`
- (Optional) PM2: `npm pack pm2` → `pm2-x.x.x.tgz`
- (Optional) NSSM: https://nssm.cc/download → `nssm-2.24.zip`

---

## 🔄 Phase 2: Transfer to Air-Gapped Machine

Transfer these files via USB/CD/secure transfer:
- ✅ `pump-iot-offline-bundle-YYYYMMDD-HHMMSS.tar.gz`
- ✅ `pump-iot-offline-bundle-YYYYMMDD-HHMMSS.tar.gz.sha256`
- ✅ `node-v20.11.0-x64.msi` (Windows) or `.tar.xz` (Linux)
- ✅ `pnpm-9.15.4.tgz`
- ✅ `nssm-2.24.zip` (for Windows service)

---

## ⚙️ Phase 3: Install Prerequisites

### Windows:
```cmd
REM Install Node.js
node-v20.11.0-x64.msi

REM Install pnpm
npm install -g pnpm-9.15.4.tgz

REM Verify
node --version
pnpm --version
```

### Linux:
```bash
# Install Node.js
tar -xJf node-v20.11.0-linux-x64.tar.xz
sudo mv node-v20.11.0-linux-x64 /opt/nodejs
sudo ln -s /opt/nodejs/bin/node /usr/local/bin/node
sudo ln -s /opt/nodejs/bin/npm /usr/local/bin/npm

# Install pnpm
npm install -g pnpm-9.15.4.tgz

# Verify
node --version
pnpm --version
```

---

## 📥 Phase 4: Install Application

```bash
# Extract bundle
tar -xzf pump-iot-offline-bundle-20260211-143000.tar.gz
cd pump-iot-offline-bundle-20260211-143000

# Run installation script
# Windows:
install-offline.bat

# Linux/Mac:
chmod +x install-offline.sh
./install-offline.sh
```

---

## 🔧 Phase 5: Configure

```bash
cd source
cp .env.example .env.local
nano .env.local  # or notepad .env.local on Windows
```

**Edit `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:5002
PORT=3000
NODE_ENV=production
```

---

## ▶️ Phase 6: Start Application

### Option A: Direct Start (Testing)
```bash
cd source/apps/supervisor
pnpm start
```

### Option B: PM2 (Production)
```bash
# Install PM2
npm install -g pm2-x.x.x.tgz

# Start application
cd source/apps/supervisor
pm2 start "pnpm start" --name pump-iot
pm2 save
pm2 startup  # Follow instructions
```

### Option C: Windows Service (Production)
```cmd
REM Extract NSSM
unzip nssm-2.24.zip
cd nssm-2.24\win64

REM Install service
nssm install PumpIoTWeb "C:\Program Files\nodejs\pnpm.cmd" start
nssm set PumpIoTWeb AppDirectory "C:\pump-iot-web\source\apps\supervisor"
nssm set PumpIoTWeb DisplayName "Pump IoT Web Platform"
nssm set PumpIoTWeb Start SERVICE_AUTO_START
nssm start PumpIoTWeb
```

---

## ✅ Verify

```bash
# Check if running
curl http://localhost:3000

# Or open browser:
# http://localhost:3000
# http://YOUR_SERVER_IP:3000
```

---

## 🔥 Firewall (if needed)

### Windows:
```cmd
netsh advfirewall firewall add rule name="Pump IoT Web" dir=in action=allow protocol=TCP localport=3000
```

### Linux:
```bash
sudo ufw allow 3000/tcp
```

---

## 📚 Full Documentation

- **Offline Deployment Guide**: [OFFLINE_DEPLOYMENT.md](./OFFLINE_DEPLOYMENT.md)
- **Windows Service Setup**: [WINDOWS_SERVICE_SETUP.md](./WINDOWS_SERVICE_SETUP.md)
- **General Deployment**: [DESPLIEGUE.md](./DESPLIEGUE.md)

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | Change `PORT=3001` in `.env.local` |
| Can't access from network | Check firewall, use server IP not localhost |
| Service won't start | Check logs, verify paths, run manually first |
| "Cannot find module" | Re-run `install-offline.sh` |

**For detailed troubleshooting**: See [AIRGAP_TROUBLESHOOTING.md](./AIRGAP_TROUBLESHOOTING.md)

---

## 📞 Quick Commands

```bash
# PM2
pm2 status              # Check status
pm2 logs                # View logs
pm2 restart pump-iot    # Restart app
pm2 stop pump-iot       # Stop app

# Windows Service (NSSM)
nssm status PumpIoTWeb  # Check status
nssm start PumpIoTWeb   # Start service
nssm stop PumpIoTWeb    # Stop service
nssm restart PumpIoTWeb # Restart service

# Direct
cd source/apps/supervisor
pnpm start              # Start directly
```

---

**Last Updated**: February 2026
