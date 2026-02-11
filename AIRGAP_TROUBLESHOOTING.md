# 🔧 Air-Gapped Deployment - Troubleshooting Guide

**Comprehensive troubleshooting for offline/air-gapped deployments**

---

## 🎯 Table of Contents

1. [Bundle Preparation Issues](#bundle-preparation-issues)
2. [Transfer and Verification Issues](#transfer-and-verification-issues)
3. [Installation Issues](#installation-issues)
4. [Runtime Issues](#runtime-issues)
5. [Windows Service Issues](#windows-service-issues)
6. [Network and Connectivity Issues](#network-and-connectivity-issues)
7. [Performance Issues](#performance-issues)
8. [Update and Maintenance Issues](#update-and-maintenance-issues)

---

## 📦 Bundle Preparation Issues

### Issue: "pnpm store export not available"

**Symptom**: Script shows warning about pnpm store export not being available

**Cause**: Older pnpm version doesn't support `store export` command

**Solution**: Script automatically falls back to copying `node_modules`. This is normal and works fine.

**Alternative**: Update pnpm on preparation machine
```bash
npm install -g pnpm@latest
```

---

### Issue: Bundle creation takes very long time

**Symptom**: Script seems stuck at "Building applications..." step

**Cause**: Normal - building all applications can take 5-10 minutes

**What's happening**:
- TypeScript compilation
- Next.js optimization
- Vite bundling
- Asset processing

**Monitor progress**:
```bash
# In another terminal, check CPU usage
top
# or
htop
```

**If truly stuck** (no CPU activity for 5+ minutes):
```bash
# Kill and retry with more memory
export NODE_OPTIONS="--max-old-space-size=8192"
bash scripts/prepare-offline-bundle.sh
```

---

### Issue: "No space left on device"

**Symptom**: Error during bundle creation about disk space

**Cause**: Insufficient disk space (needs ~3-5 GB free)

**Solution**:
```bash
# Check available space
df -h

# Clean unnecessary files
pnpm store prune
rm -rf offline-bundles/old-bundles

# Or use a different disk with more space
BUNDLE_DIR=/mnt/external/bundles bash scripts/prepare-offline-bundle.sh
```

---

### Issue: Bundle is too large (>2 GB)

**Symptom**: Bundle file is very large, difficult to transfer

**Cause**: All dependencies and builds included

**Solutions**:

**Option 1**: Split the bundle
```bash
# After bundle is created
cd offline-bundles
split -b 500M pump-iot-offline-bundle-*.tar.gz bundle-part-

# On air-gapped machine, recombine:
cat bundle-part-* > pump-iot-offline-bundle.tar.gz
```

**Option 2**: Use better compression
```bash
# Edit the script to use xz compression (smaller, slower)
tar -cJf "${BUNDLE_NAME}.tar.xz" -C "offline-bundles" "$BUNDLE_NAME"
# Results in ~40% smaller file
```

**Option 3**: Exclude development dependencies (advanced)
```bash
# Before running bundle script
pnpm install --prod
# Then run bundle script
```

---

## 🔄 Transfer and Verification Issues

### Issue: Checksum verification fails

**Symptom**: `sha256sum -c` shows "FAILED"

**Cause**: File corrupted during transfer

**Solution**:
```bash
# 1. Verify the checksum file itself
cat pump-iot-offline-bundle-*.tar.gz.sha256

# 2. Calculate checksum manually
sha256sum pump-iot-offline-bundle-*.tar.gz

# 3. Compare with original
# If different, re-transfer the file

# 4. For USB transfers, check USB drive health
# For network transfers, use reliable protocol (rsync, scp with checksums)
```

**Prevention**:
```bash
# Use rsync for reliable transfers
rsync -avz --progress --checksum pump-iot-offline-bundle-*.tar.gz user@target:/path/
```

---

### Issue: Cannot transfer large file via USB

**Symptom**: Copy fails or USB not recognized

**Solutions**:

**If file too large for FAT32**:
```bash
# Format USB as exFAT (supports large files)
# Or split the file (see above)
```

**If USB keeps disconnecting**:
```bash
# Try compression to reduce size
gzip pump-iot-offline-bundle-*.tar.gz
# Creates .tar.gz.gz (double compressed)
```

---

### Issue: File extraction fails

**Symptom**: `tar: Error is not recoverable` or similar

**Cause**: Incomplete download or corruption

**Solution**:
```bash
# 1. Verify file integrity first
sha256sum -c pump-iot-offline-bundle-*.tar.gz.sha256

# 2. If corrupted, re-transfer

# 3. Try listing contents without extracting
tar -tzf pump-iot-offline-bundle-*.tar.gz | head

# 4. If partially corrupted, try recovering
tar -xzf pump-iot-offline-bundle-*.tar.gz --ignore-failed-read
```

---

## ⚙️ Installation Issues

### Issue: "pnpm: command not found" on air-gapped machine

**Symptom**: Installation script fails because pnpm is not available

**Cause**: pnpm not installed or not in PATH

**Solution**:

**Check if pnpm is installed**:
```bash
which pnpm
# or
where pnpm  # Windows
```

**If not found but installed**:
```bash
# Add to PATH (Linux/Mac)
export PATH="$PATH:$HOME/.local/share/pnpm"

# Or use full path
/home/user/.local/share/pnpm/pnpm --version
```

**If not installed**:
```bash
# You need the pnpm .tgz file transferred
npm install -g pnpm-9.15.4.tgz

# Verify
pnpm --version
```

---

### Issue: "Cannot find pnpm-9.15.4.tgz"

**Symptom**: Can't install pnpm because the .tgz file wasn't transferred

**Solution**:

**Option 1**: Use npm (comes with Node.js)
```bash
# pnpm is written in JavaScript, we can download it differently
# On machine with limited internet access (if available momentarily):
npm install -g pnpm@9.15.4
```

**Option 2**: Extract from bundle
```bash
# The bundle might include pnpm in node_modules
cp -r source/node_modules/.pnpm /tmp/pnpm-backup
# Then manually configure
```

**Option 3**: Alternative package manager
```bash
# Use npm instead of pnpm (slower but works)
cd source
npm install --production
npm run start
```

---

### Issue: Dependencies restoration fails

**Symptom**: "Cannot find module" errors during or after installation

**Cause**: Offline store not properly imported or corrupted

**Solution**:

**If using pnpm store**:
```bash
# Check if store was imported
ls -la ~/.local/share/pnpm/store

# Manually import
cd source
pnpm store import ../pnpm-store

# Reinstall offline
pnpm install --offline --frozen-lockfile
```

**If using node_modules backup**:
```bash
# Verify backup exists
ls -la ../dependencies/

# Re-copy
rm -rf node_modules
cp -r ../dependencies/node_modules_root ./node_modules

# For workspace packages
rm -rf apps/supervisor/node_modules
cp -r ../dependencies/node_modules_supervisor ./apps/supervisor/node_modules
```

---

### Issue: "Build artifacts not found"

**Symptom**: Application won't start, complains about missing .next or dist directories

**Cause**: Build artifacts not properly copied during installation

**Solution**:

**Verify builds exist in bundle**:
```bash
ls -la ../builds/
# Should see: supervisor-.next/ and operator-dist/
```

**Manually restore**:
```bash
cd source

# Restore supervisor build
cp -r ../builds/supervisor-.next ./apps/supervisor/.next

# Restore operator build
cp -r ../builds/operator-dist ./apps/operator/dist

# Verify
ls -la apps/supervisor/.next
ls -la apps/operator/dist
```

**If builds missing from bundle**:
```bash
# Need to rebuild (requires dependencies installed first)
cd source
pnpm install --offline
pnpm build
```

---

## 🚀 Runtime Issues

### Issue: Application starts but shows blank page

**Symptom**: Server running but browser shows blank white page

**Cause**: Multiple possible causes

**Diagnostics**:
```bash
# 1. Check browser console (F12)
# Look for JavaScript errors or failed network requests

# 2. Check server logs
pm2 logs  # if using PM2
# or check console output if running directly

# 3. Verify build artifacts
ls -la apps/supervisor/.next/

# 4. Check environment variables
cat .env.local
```

**Solutions**:

**If API URL is wrong**:
```bash
# Update .env.local
nano .env.local
# Change NEXT_PUBLIC_API_URL to correct backend URL
# Restart application
```

**If build is corrupted**:
```bash
# Rebuild
cd source
pnpm build
# Restart application
```

---

### Issue: "ECONNREFUSED" connecting to backend

**Symptom**: Frontend loads but can't connect to backend API

**Cause**: Backend not running or wrong URL in configuration

**Diagnostics**:
```bash
# 1. Check if backend is running
curl http://localhost:5002/api/health
# or whatever your backend URL is

# 2. Check configured URL
grep NEXT_PUBLIC_API_URL .env.local

# 3. Check network connectivity
ping 192.168.1.100  # your backend IP
telnet 192.168.1.100 5002
```

**Solutions**:

**If backend is down**:
```bash
# Start the backend first
# (Refer to backend deployment documentation)
```

**If URL is wrong**:
```bash
# Update .env.local
nano .env.local
NEXT_PUBLIC_API_URL=http://CORRECT_IP:5002

# Restart frontend
pm2 restart pump-iot  # or restart service
```

**If firewall blocking**:
```bash
# Windows
netsh advfirewall firewall add rule name="Backend API" dir=in action=allow protocol=TCP localport=5002

# Linux
sudo ufw allow 5002/tcp
```

---

### Issue: High memory usage or crashes

**Symptom**: Application consumes excessive RAM or crashes with "out of memory"

**Cause**: Node.js default memory limits

**Solution**:

**Increase memory limit**:
```bash
# Set environment variable
export NODE_OPTIONS="--max-old-space-size=4096"

# For PM2
pm2 delete pump-iot
pm2 start "pnpm start" --name pump-iot --node-args="--max-old-space-size=4096"
pm2 save
```

**For Windows Service (NSSM)**:
```cmd
nssm set PumpIoTWeb AppEnvironmentExtra NODE_OPTIONS=--max-old-space-size=4096
nssm restart PumpIoTWeb
```

---

## 🪟 Windows Service Issues

### Issue: Service won't start - "Error 1053: The service did not respond"

**Symptom**: Service fails to start with timeout error

**Cause**: Service takes too long to start (common with Node.js)

**Solution**:

**Increase timeout**:
```cmd
REM Registry edit to increase service timeout (as Administrator)
reg add "HKLM\SYSTEM\CurrentControlSet\Control" /v ServicesPipeTimeout /t REG_DWORD /d 120000 /f

REM Restart computer for change to take effect
shutdown /r /t 0
```

**Or configure NSSM throttle**:
```cmd
nssm set PumpIoTWeb AppThrottle 10000
nssm set PumpIoTWeb AppExit Default Restart
nssm restart PumpIoTWeb
```

---

### Issue: Service starts but application not accessible

**Symptom**: Service shows "Running" but can't access http://localhost:3000

**Diagnostics**:
```cmd
REM Check if port is listening
netstat -ano | findstr :3000

REM Check service logs
type C:\pump-iot-web\logs\service-error.log

REM Check Windows Event Viewer
eventvwr.msc
REM Navigate to: Windows Logs > Application
```

**Common causes and solutions**:

**1. Working directory wrong**:
```cmd
nssm get PumpIoTWeb AppDirectory
REM Should be: C:\pump-iot-web\source\apps\supervisor

REM Fix if wrong:
nssm set PumpIoTWeb AppDirectory "C:\pump-iot-web\source\apps\supervisor"
nssm restart PumpIoTWeb
```

**2. Environment variables missing**:
```cmd
REM Add .env.local path
nssm set PumpIoTWeb AppEnvironmentExtra NODE_ENV=production
nssm restart PumpIoTWeb
```

**3. Permission issues**:
```cmd
REM Run service as specific user
nssm set PumpIoTWeb ObjectName ".\YourUsername" "YourPassword"

REM Or grant permissions to NETWORK SERVICE
icacls C:\pump-iot-web /grant "NETWORK SERVICE:(OI)(CI)F" /T
```

---

### Issue: Service stops unexpectedly

**Symptom**: Service starts but stops after a few seconds/minutes

**Diagnostics**:
```cmd
REM Check service event log
nssm set PumpIoTWeb AppStdout C:\pump-iot-web\logs\output.log
nssm set PumpIoTWeb AppStderr C:\pump-iot-web\logs\error.log
nssm restart PumpIoTWeb

REM Wait a moment, then check logs
type C:\pump-iot-web\logs\error.log
```

**Common causes**:

**Application crashing**:
```cmd
REM Test running manually first
cd C:\pump-iot-web\source\apps\supervisor
pnpm start
REM If this crashes too, fix the application issue first
```

**Node.js path issue**:
```cmd
REM Use absolute path to pnpm
where pnpm
REM Copy the full path

nssm set PumpIoTWeb Application "C:\Users\YourUser\AppData\Roaming\npm\pnpm.cmd"
nssm restart PumpIoTWeb
```

---

## 🌐 Network and Connectivity Issues

### Issue: Can access locally but not from other machines

**Symptom**: Works on `localhost:3000` but not on `SERVER_IP:3000` from other computers

**Cause**: Firewall blocking incoming connections

**Solution**:

**Windows**:
```cmd
REM Add firewall rule (as Administrator)
netsh advfirewall firewall add rule name="Pump IoT Web" dir=in action=allow protocol=TCP localport=3000

REM Verify rule exists
netsh advfirewall firewall show rule name="Pump IoT Web"

REM If still not working, temporarily disable firewall to test
netsh advfirewall set allprofiles state off
REM Test access, then re-enable:
netsh advfirewall set allprofiles state on
```

**Linux**:
```bash
# UFW
sudo ufw allow 3000/tcp
sudo ufw status

# iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables-save

# Verify
sudo netstat -tulpn | grep :3000
```

---

### Issue: Intermittent connectivity

**Symptom**: Application sometimes works, sometimes doesn't

**Diagnostics**:
```bash
# Monitor continuously
while true; do curl -s http://localhost:3000 > /dev/null && echo "OK" || echo "FAIL"; sleep 1; done
```

**Common causes**:

**1. Application restarting**:
```bash
# Check PM2 restarts
pm2 info pump-iot
# Look for restart count

# Check logs for crashes
pm2 logs --lines 100
```

**2. Network issues**:
```bash
# Check network stability
ping -c 100 SERVER_IP
# Look for packet loss
```

**3. Resource exhaustion**:
```bash
# Monitor resources
top
# or
htop

# Check for memory/CPU spikes
```

---

## 🚀 Performance Issues

### Issue: Slow application performance

**Symptom**: Pages load slowly, UI feels sluggish

**Diagnostics**:
```bash
# Check server resources
top  # or htop on Linux
# Task Manager on Windows

# Check Node.js process
ps aux | grep node

# Check network latency to backend
ping BACKEND_IP
curl -w "@curl-format.txt" -o /dev/null -s http://BACKEND_IP:5002/api/endpoint
```

**Solutions**:

**If high CPU usage**:
```bash
# Verify production mode
grep NODE_ENV .env.local
# Should be: NODE_ENV=production

# Restart in production mode if needed
```

**If high memory usage**:
```bash
# Increase memory limit (see earlier section)
# Or add more RAM to server
```

**If slow network**:
```bash
# Use nginx reverse proxy with caching
# (See OFFLINE_DEPLOYMENT.md for nginx setup)
```

---

## 🔄 Update and Maintenance Issues

### Issue: Update fails - "git pull" doesn't work

**Symptom**: Cannot update application using git in air-gapped environment

**Cause**: No git/GitHub access in air-gapped environment

**Solution**: Use offline update process

**Steps**:
1. Create new bundle on internet-connected machine (after pulling updates)
2. Transfer new bundle to air-gapped machine
3. Backup current installation
4. Install new bundle
5. Restore configuration

```bash
# Backup
cp -r source source.backup.$(date +%Y%m%d)
cp source/.env.local /tmp/env.backup

# Install new bundle
tar -xzf pump-iot-offline-bundle-NEW.tar.gz
cd pump-iot-offline-bundle-NEW
./install-offline.sh

# Restore config
cp /tmp/env.backup source/.env.local

# Restart
pm2 restart pump-iot
```

---

### Issue: Configuration lost after update

**Symptom**: After update, application doesn't work - environment variables missing

**Cause**: Forgot to backup .env.local before update

**Solution**:

**If you have backup**:
```bash
cp source.backup.YYYYMMDD/.env.local source/.env.local
```

**If no backup**:
```bash
# Recreate from .env.example
cd source
cp .env.example .env.local
nano .env.local
# Manually enter your configuration again
```

**Prevention**: Always backup before updates
```bash
# Create backup script
cat > /backup/backup-config.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
cp /pump-iot-web/source/.env.local /backup/env-$DATE.backup
echo "Backed up to /backup/env-$DATE.backup"
EOF

chmod +x /backup/backup-config.sh
```

---

## 🆘 General Debugging Tips

### Enable Detailed Logging

**Node.js debugging**:
```bash
# Set debug mode
export DEBUG=*
pnpm start
```

**PM2 logs**:
```bash
pm2 logs --lines 200
pm2 logs --raw  # No timestamps
```

**Next.js debugging**:
```bash
# Enable verbose build output
pnpm build --debug
```

---

### Collect System Information

When asking for help, collect this information:

```bash
# System info (Linux)
cat > /tmp/system-info.txt << EOF
=== System Information ===
OS: $(uname -a)
Node: $(node --version)
pnpm: $(pnpm --version)
Available Memory: $(free -h)
Disk Space: $(df -h /)

=== Application Info ===
Working Directory: $(pwd)
ENV File: $(cat .env.local 2>&1)

=== Process Info ===
$(ps aux | grep node)

=== Network Info ===
$(netstat -tulpn | grep :3000)
$(curl -s http://localhost:3000 || echo "Cannot connect")

=== Logs ===
$(pm2 logs --lines 50 2>&1)
EOF

cat /tmp/system-info.txt
```

**Windows**:
```cmd
REM Create system-info.txt
systeminfo > C:\temp\system-info.txt
node --version >> C:\temp\system-info.txt
pnpm --version >> C:\temp\system-info.txt
netstat -ano | findstr :3000 >> C:\temp\system-info.txt
type C:\pump-iot-web\logs\service-error.log >> C:\temp\system-info.txt
```

---

## 📞 Getting Help

### Before Asking for Help

- [ ] Check this troubleshooting guide
- [ ] Check main documentation (OFFLINE_DEPLOYMENT.md)
- [ ] Verify all prerequisites are installed
- [ ] Try restarting the application
- [ ] Check logs for error messages
- [ ] Collect system information (see above)

### What to Include When Reporting Issues

1. **Environment**: OS, Node.js version, pnpm version
2. **Deployment method**: Direct start, PM2, Windows Service
3. **Error message**: Full error message and stack trace
4. **Logs**: Last 50-100 lines of logs
5. **Steps to reproduce**: What you did before the error occurred
6. **What you've tried**: Solutions you've already attempted

---

## 📚 Additional Resources

- **Main Deployment Guide**: [DESPLIEGUE.md](./DESPLIEGUE.md)
- **Offline Deployment Guide**: [OFFLINE_DEPLOYMENT.md](./OFFLINE_DEPLOYMENT.md)
- **Windows Service Setup**: [WINDOWS_SERVICE_SETUP.md](./WINDOWS_SERVICE_SETUP.md)
- **Quick Start**: [AIRGAP_QUICKSTART.md](./AIRGAP_QUICKSTART.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**Maintained by**: Pump IoT Development Team
