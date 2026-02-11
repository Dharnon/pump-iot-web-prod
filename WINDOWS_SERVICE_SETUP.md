# 🪟 Windows Service Setup Guide

**Target**: Windows Server 2016+ / Windows 10+  
**Purpose**: Run Pump IoT Web Platform as a Windows Service  
**Last Updated**: February 2026

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Method 1: NSSM (Recommended)](#method-1-nssm-recommended)
4. [Method 2: PM2 Windows Service](#method-2-pm2-windows-service)
5. [Method 3: node-windows](#method-3-node-windows)
6. [Service Management](#service-management)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Configuration](#advanced-configuration)

---

## 🎯 Overview

Running as a Windows Service provides:

- ✅ **Auto-start on boot**: Service starts automatically when server boots
- ✅ **Recovery**: Automatic restart on failure
- ✅ **Background operation**: Runs without user login
- ✅ **Service management**: Standard Windows Service controls
- ✅ **Event logging**: Integration with Windows Event Viewer

### Comparison of Methods

| Feature | NSSM | PM2 + pm2-service | node-windows |
|---------|------|-------------------|--------------|
| **Ease of Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **GUI Management** | ✅ Yes | ❌ No | ❌ No |
| **Stability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Monitoring** | Basic | Advanced (PM2) | Basic |
| **Log Rotation** | Manual | Built-in | Manual |
| **Air-gapped Install** | Easy | Moderate | Moderate |

**Recommendation**: Use **NSSM** for simplicity, or **PM2** for advanced monitoring.

---

## 🔧 Prerequisites

### Required Software (Air-Gapped Installation)

**1. Node.js** (v18+ or v20 LTS)

Download on internet-connected machine:
- URL: https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
- Transfer to air-gapped server
- Install with Administrator privileges

**2. Application Installed**

Ensure the Pump IoT Web Platform is already installed:
```cmd
cd C:\pump-iot-web\source\apps\supervisor
pnpm start
```
Verify it works before proceeding with service setup.

**3. Administrator Access**

All service installations require Administrator privileges.

---

## 🛠️ Method 1: NSSM (Recommended)

**NSSM** (Non-Sucking Service Manager) is the easiest way to create Windows services.

### Step 1: Download NSSM (Offline)

**On internet-connected machine:**
```
1. Go to: https://nssm.cc/download
2. Download: nssm-2.24.zip (≈500 KB)
3. Transfer to air-gapped server
```

### Step 2: Extract NSSM

```cmd
REM Extract to a permanent location
cd C:\
mkdir C:\nssm
REM Extract nssm-2.24.zip to C:\nssm

REM Add to PATH (optional but recommended)
setx PATH "%PATH%;C:\nssm\nssm-2.24\win64" /M
```

### Step 3: Install Service (GUI Method)

```cmd
REM Run as Administrator
cd C:\nssm\nssm-2.24\win64
nssm install PumpIoTWeb
```

This opens a GUI where you configure:

**Application Tab:**
- **Path**: `C:\Program Files\nodejs\pnpm.cmd`
- **Startup directory**: `C:\pump-iot-web\source\apps\supervisor`
- **Arguments**: `start`

**Details Tab:**
- **Display name**: `Pump IoT Web Platform`
- **Description**: `Industrial Pump Testing and Monitoring System`
- **Startup type**: `Automatic`

**I/O Tab:**
- **Output (stdout)**: `C:\pump-iot-web\logs\service-output.log`
- **Error (stderr)**: `C:\pump-iot-web\logs\service-error.log`

**Environment Tab:**
- Add: `NODE_ENV=production`

Click **Install service**

### Step 4: Install Service (Command Line Method)

```cmd
REM Run as Administrator
cd C:\nssm\nssm-2.24\win64

REM Create logs directory
mkdir C:\pump-iot-web\logs

REM Install and configure service
nssm install PumpIoTWeb "C:\Program Files\nodejs\pnpm.cmd" start
nssm set PumpIoTWeb AppDirectory "C:\pump-iot-web\source\apps\supervisor"
nssm set PumpIoTWeb DisplayName "Pump IoT Web Platform"
nssm set PumpIoTWeb Description "Industrial Pump Testing and Monitoring System"
nssm set PumpIoTWeb Start SERVICE_AUTO_START
nssm set PumpIoTWeb AppEnvironmentExtra NODE_ENV=production
nssm set PumpIoTWeb AppStdout "C:\pump-iot-web\logs\service-output.log"
nssm set PumpIoTWeb AppStderr "C:\pump-iot-web\logs\service-error.log"

REM Configure service recovery
nssm set PumpIoTWeb AppExit Default Restart
nssm set PumpIoTWeb AppRestartDelay 5000
nssm set PumpIoTWeb AppThrottle 1500

REM Start the service
nssm start PumpIoTWeb
```

### Step 5: Verify Service

```cmd
REM Check service status
nssm status PumpIoTWeb

REM Or use Windows Services
services.msc

REM Check logs
type C:\pump-iot-web\logs\service-output.log
type C:\pump-iot-web\logs\service-error.log

REM Test access
curl http://localhost:3000
```

### NSSM Service Management

```cmd
REM Start service
nssm start PumpIoTWeb

REM Stop service
nssm stop PumpIoTWeb

REM Restart service
nssm restart PumpIoTWeb

REM Check status
nssm status PumpIoTWeb

REM Edit service (opens GUI)
nssm edit PumpIoTWeb

REM Remove service
nssm stop PumpIoTWeb
nssm remove PumpIoTWeb confirm
```

---

## 🔄 Method 2: PM2 Windows Service

**PM2** provides advanced process management with monitoring capabilities.

### Step 1: Install PM2 (Offline)

**On internet-connected machine:**
```bash
npm pack pm2
npm pack pm2-windows-service
```

Transfer `pm2-x.x.x.tgz` and `pm2-windows-service-x.x.x.tgz` to air-gapped server.

**On air-gapped machine:**
```cmd
REM Run as Administrator
npm install -g pm2-5.3.0.tgz
npm install -g pm2-windows-service-0.2.1.tgz
```

### Step 2: Configure PM2 as Windows Service

```cmd
REM Run as Administrator
pm2-service-install -n PumpIoTPM2

REM This will prompt for:
REM - PM2_HOME: C:\ProgramData\pm2\home (or custom path)
REM - PM2_SERVICE_SCRIPTS: C:\pump-iot-web\pm2-scripts
REM - Set PM2_SERVICE_PM2_DIR: Auto
```

### Step 3: Start Application with PM2

```cmd
REM Navigate to application
cd C:\pump-iot-web\source\apps\supervisor

REM Start with PM2
pm2 start "pnpm start" --name pump-iot-supervisor

REM Configure startup script
pm2 save

REM Verify
pm2 list
pm2 logs pump-iot-supervisor
```

### Step 4: Service Management

The PM2 service is now installed as `PumpIoTPM2` in Windows Services.

```cmd
REM Start PM2 service (starts all saved apps)
sc start PumpIoTPM2

REM Stop PM2 service
sc stop PumpIoTPM2

REM Check service status
sc query PumpIoTPM2

REM PM2 app management (service must be running)
pm2 list
pm2 restart pump-iot-supervisor
pm2 stop pump-iot-supervisor
pm2 logs
```

### PM2 Advanced Features

```cmd
REM Real-time monitoring
pm2 monit

REM View detailed info
pm2 show pump-iot-supervisor

REM Log rotation setup
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

REM Restart on file changes (development)
pm2 restart pump-iot-supervisor --watch

REM Environment variables
pm2 restart pump-iot-supervisor --update-env

REM Delete app from PM2
pm2 delete pump-iot-supervisor
```

---

## 🔧 Method 3: node-windows

**node-windows** creates native Windows services from Node.js scripts.

### Step 1: Install node-windows (Offline)

**On internet-connected machine:**
```bash
npm pack node-windows
```

**On air-gapped machine:**
```cmd
npm install -g node-windows-1.0.0.tgz
```

### Step 2: Create Service Installation Script

Create `C:\pump-iot-web\install-service.js`:

```javascript
const Service = require('node-windows').Service;
const path = require('path');

// Define service
const svc = new Service({
  name: 'Pump IoT Web Platform',
  description: 'Industrial Pump Testing and Monitoring System',
  script: path.join(__dirname, 'source', 'apps', 'supervisor', 'node_modules', '.bin', 'next'),
  scriptOptions: ['start'],
  nodeOptions: [],
  workingDirectory: path.join(__dirname, 'source', 'apps', 'supervisor'),
  env: [{
    name: "NODE_ENV",
    value: "production"
  }, {
    name: "PORT",
    value: "3000"
  }],
  // Service recovery
  maxRestarts: 3,
  maxRetries: 3,
  wait: 5, // seconds between retries
  grow: 0.25 // increase wait time by 25% on each retry
});

// Listen for install event
svc.on('install', () => {
  console.log('Service installed successfully!');
  console.log('Starting service...');
  svc.start();
});

// Listen for start event
svc.on('start', () => {
  console.log('Service started successfully!');
  console.log('Application is now running as a Windows Service.');
});

// Listen for error event
svc.on('error', (err) => {
  console.error('Service error:', err);
});

// Install the service
console.log('Installing Pump IoT Web Platform as Windows Service...');
svc.install();
```

### Step 3: Install the Service

```cmd
REM Run as Administrator
cd C:\pump-iot-web
node install-service.js
```

### Step 4: Create Uninstall Script

Create `C:\pump-iot-web\uninstall-service.js`:

```javascript
const Service = require('node-windows').Service;
const path = require('path');

// Define service (must match installation script)
const svc = new Service({
  name: 'Pump IoT Web Platform',
  script: path.join(__dirname, 'source', 'apps', 'supervisor', 'node_modules', '.bin', 'next')
});

svc.on('uninstall', () => {
  console.log('Service uninstalled successfully!');
});

svc.uninstall();
```

### Service Management

```cmd
REM Start service (via Windows Services)
sc start "Pump IoT Web Platform"

REM Stop service
sc stop "Pump IoT Web Platform"

REM Query status
sc query "Pump IoT Web Platform"

REM Or use services.msc GUI

REM To uninstall
node C:\pump-iot-web\uninstall-service.js
```

---

## 🎛️ Service Management

### Using Windows Services GUI

```cmd
REM Open Services Manager
services.msc
```

Find your service (e.g., "Pump IoT Web Platform"), right-click:
- **Start**: Start the service
- **Stop**: Stop the service
- **Restart**: Restart the service
- **Properties**: Configure startup type, recovery, etc.

### Using Command Line (sc)

```cmd
REM Start service
sc start PumpIoTWeb

REM Stop service
sc stop PumpIoTWeb

REM Query status
sc query PumpIoTWeb

REM Configure startup type
sc config PumpIoTWeb start= auto

REM Delete service
sc delete PumpIoTWeb
```

### Using PowerShell

```powershell
# Start service
Start-Service -Name "PumpIoTWeb"

# Stop service
Stop-Service -Name "PumpIoTWeb"

# Restart service
Restart-Service -Name "PumpIoTWeb"

# Get service status
Get-Service -Name "PumpIoTWeb"

# Set startup type
Set-Service -Name "PumpIoTWeb" -StartupType Automatic
```

---

## 🔍 Troubleshooting

### Service Won't Start

**1. Check Event Viewer**
```cmd
REM Open Event Viewer
eventvwr.msc

REM Navigate to: Windows Logs > Application
REM Look for errors from your service
```

**2. Check Service Logs**
```cmd
REM NSSM logs
type C:\pump-iot-web\logs\service-error.log

REM PM2 logs
pm2 logs

REM Check service is configured correctly
nssm dump PumpIoTWeb
```

**3. Verify Paths**
```cmd
REM Check Node.js path
where node
where pnpm

REM Verify application directory
dir C:\pump-iot-web\source\apps\supervisor
```

**4. Test Manually First**
```cmd
REM Try running manually to identify issues
cd C:\pump-iot-web\source\apps\supervisor
pnpm start

REM If this works, service configuration is the issue
```

### Common Issues

**Issue: "The service did not respond to the start or control request in a timely fashion"**

Solution:
```cmd
REM Increase service timeout (NSSM)
nssm set PumpIoTWeb AppThrottle 5000

REM Or increase system-wide timeout (Registry)
reg add "HKLM\SYSTEM\CurrentControlSet\Control" /v ServicesPipeTimeout /t REG_DWORD /d 60000 /f
```

**Issue: "Access Denied" or Permission Errors**

Solution:
```cmd
REM Configure service to run as specific user
nssm set PumpIoTWeb ObjectName ".\YourUsername" "YourPassword"

REM Or grant permissions to Network Service account
icacls C:\pump-iot-web /grant "NETWORK SERVICE:(OI)(CI)F" /T
```

**Issue: Port Already in Use**

Solution:
```cmd
REM Find process using port 3000
netstat -ano | findstr :3000

REM Kill the process
taskkill /PID <PID> /F

REM Or change port in .env.local
echo PORT=3001 >> C:\pump-iot-web\source\.env.local
```

**Issue: Environment Variables Not Loading**

Solution for NSSM:
```cmd
REM Set environment variables explicitly
nssm set PumpIoTWeb AppEnvironmentExtra NODE_ENV=production PORT=3000
nssm restart PumpIoTWeb
```

**Issue: Application Works Manually but Not as Service**

Likely causes:
1. Working directory not set correctly
2. Environment variables missing
3. File permissions

Solution:
```cmd
REM Verify working directory
nssm get PumpIoTWeb AppDirectory

REM Should be: C:\pump-iot-web\source\apps\supervisor

REM Check environment
nssm get PumpIoTWeb AppEnvironmentExtra

REM Verify file permissions
icacls C:\pump-iot-web
```

---

## ⚙️ Advanced Configuration

### Auto-Recovery Configuration (NSSM)

```cmd
REM Configure service recovery
nssm set PumpIoTWeb AppExit Default Restart
nssm set PumpIoTWeb AppRestartDelay 5000
nssm set PumpIoTWeb AppThrottle 1500
nssm set PumpIoTWeb AppNoConsole 1

REM Set failure actions via Windows Services
sc failure PumpIoTWeb reset= 86400 actions= restart/5000/restart/10000/restart/30000
```

### Memory Limits

```cmd
REM Set Node.js memory limit
nssm set PumpIoTWeb AppEnvironmentExtra NODE_OPTIONS=--max-old-space-size=2048
```

### Log Rotation

**Using logrotate (Windows port):**

Download `logrotate-win` on internet machine, transfer to server.

Create `C:\pump-iot-web\logrotate.conf`:
```
C:\pump-iot-web\logs\*.log {
    daily
    rotate 7
    size 10M
    compress
    missingok
    notifempty
}
```

Schedule with Task Scheduler:
```cmd
schtasks /create /tn "Pump IoT Log Rotation" /tr "C:\logrotate\logrotate.exe C:\pump-iot-web\logrotate.conf" /sc daily /st 02:00
```

### Firewall Configuration

```cmd
REM Add firewall rule (as Administrator)
netsh advfirewall firewall add rule name="Pump IoT Web - HTTP" dir=in action=allow protocol=TCP localport=3000

REM For HTTPS (if configured)
netsh advfirewall firewall add rule name="Pump IoT Web - HTTPS" dir=in action=allow protocol=TCP localport=443

REM Verify rule
netsh advfirewall firewall show rule name="Pump IoT Web - HTTP"
```

### Monitoring and Alerts

**Using Windows Task Scheduler for Health Checks:**

Create `C:\pump-iot-web\healthcheck.ps1`:
```powershell
$url = "http://localhost:3000"
try {
    $response = Invoke-WebRequest -Uri $url -TimeoutSec 5
    if ($response.StatusCode -ne 200) {
        throw "HTTP $($response.StatusCode)"
    }
} catch {
    # Service is down, restart it
    Restart-Service -Name "PumpIoTWeb"
    
    # Log to Event Viewer
    Write-EventLog -LogName Application -Source "Pump IoT Monitor" `
        -EntryType Warning -EventId 1001 `
        -Message "Pump IoT Web service was not responding and has been restarted"
}
```

Schedule health check:
```cmd
schtasks /create /tn "Pump IoT Health Check" /tr "powershell -File C:\pump-iot-web\healthcheck.ps1" /sc minute /mo 5
```

### Multiple Instances

To run multiple instances on different ports:

```cmd
REM Install second instance
nssm install PumpIoTWeb-Dev "C:\Program Files\nodejs\pnpm.cmd" start
nssm set PumpIoTWeb-Dev AppDirectory "C:\pump-iot-web\source\apps\supervisor"
nssm set PumpIoTWeb-Dev AppEnvironmentExtra NODE_ENV=development PORT=3001
nssm start PumpIoTWeb-Dev
```

---

## 📝 Best Practices

### Production Checklist

- [x] Service set to **Automatic** startup
- [x] Recovery configured (auto-restart on failure)
- [x] Log rotation configured
- [x] Firewall rules added
- [x] Health monitoring in place
- [x] Backup scheduled
- [x] Environment variables secured
- [x] Service running under appropriate account
- [x] Logs directory has write permissions
- [x] Test service restart (simulate failure)

### Security Considerations

1. **Run as Limited User**: Don't run as Administrator
   ```cmd
   nssm set PumpIoTWeb ObjectName ".\PumpIoTService" "SecurePassword123"
   ```

2. **Secure Environment Variables**: Store sensitive data securely
   ```cmd
   REM Don't put secrets in service configuration
   REM Use .env.local with restricted permissions
   icacls C:\pump-iot-web\source\.env.local /inheritance:r /grant:r Administrators:F
   ```

3. **Regular Updates**: Keep Node.js and dependencies updated

4. **Audit Logs**: Monitor service logs regularly

---

## 📞 Quick Reference

### NSSM Commands
```cmd
nssm install ServiceName           # Install service
nssm start ServiceName             # Start service
nssm stop ServiceName              # Stop service
nssm restart ServiceName           # Restart service
nssm status ServiceName            # Check status
nssm edit ServiceName              # Edit configuration (GUI)
nssm remove ServiceName confirm    # Remove service
```

### PM2 Commands
```cmd
pm2 list                           # List all processes
pm2 start app                      # Start process
pm2 stop app                       # Stop process
pm2 restart app                    # Restart process
pm2 delete app                     # Delete process
pm2 logs                           # View logs
pm2 monit                          # Monitor processes
pm2 save                           # Save process list
```

### Windows Service Commands
```cmd
sc start ServiceName               # Start service
sc stop ServiceName                # Stop service
sc query ServiceName               # Query status
sc config ServiceName start= auto  # Set auto-start
sc delete ServiceName              # Delete service
```

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**Platform**: Windows Server 2016+ / Windows 10+
