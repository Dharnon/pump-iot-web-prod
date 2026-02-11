# 📚 Air-Gapped Deployment - Documentation Index

**Complete guide for deploying Pump IoT Web Platform in air-gapped/offline environments**

---

## 🎯 Start Here

**New to air-gapped deployment?** → Start with the [Quick Start Guide](./AIRGAP_QUICKSTART.md)

**Need detailed instructions?** → Read the [Full Offline Deployment Guide](./OFFLINE_DEPLOYMENT.md)

**Deploying on Windows?** → See [Windows Service Setup](./WINDOWS_SERVICE_SETUP.md)

**Having issues?** → Check the [Troubleshooting Guide](./AIRGAP_TROUBLESHOOTING.md)

---

## 📖 Documentation Overview

### For First-Time Deployment

1. **[AIRGAP_QUICKSTART.md](./AIRGAP_QUICKSTART.md)** - Quick reference (10 min read)
   - Overview of the 6-phase deployment process
   - Essential commands
   - Quick troubleshooting

2. **[OFFLINE_DEPLOYMENT.md](./OFFLINE_DEPLOYMENT.md)** - Complete guide (30 min read)
   - Detailed prerequisites
   - Step-by-step bundle preparation
   - Transfer methods
   - Installation procedures
   - Verification steps
   - Update/maintenance procedures

### For Windows Service Setup

3. **[WINDOWS_SERVICE_SETUP.md](./WINDOWS_SERVICE_SETUP.md)** - Windows-specific guide (20 min read)
   - Three methods for Windows Service creation (NSSM, PM2, node-windows)
   - Service management commands
   - Auto-start configuration
   - Recovery and monitoring

### For Troubleshooting

4. **[AIRGAP_TROUBLESHOOTING.md](./AIRGAP_TROUBLESHOOTING.md)** - Comprehensive troubleshooting (reference)
   - Bundle preparation issues
   - Transfer and verification problems
   - Installation errors
   - Runtime issues
   - Windows Service problems
   - Network connectivity
   - Performance optimization

### General Documentation

5. **[DESPLIEGUE.md](./DESPLIEGUE.md)** - Standard deployment guide (Spanish)
   - For deployments with internet access
   - General deployment procedures
   - Configuration details

6. **[README.md](./README.md)** - Project overview
   - Quick links to all documentation
   - Project structure
   - Getting started for development

---

## 🛠️ Available Scripts

### Preparation Scripts (Run on Internet-Connected Machine)

- **`scripts/prepare-offline-bundle.sh`** - Creates complete offline deployment bundle
  ```bash
  bash scripts/prepare-offline-bundle.sh
  ```
  - Installs dependencies
  - Builds applications
  - Packages everything for offline installation
  - Creates installation scripts
  - Generates compressed archive

### Validation Scripts

- **`scripts/validate-airgap-setup.sh`** - Validates air-gapped deployment setup
  ```bash
  bash scripts/validate-airgap-setup.sh
  ```
  - Checks all required files exist
  - Verifies documentation is present
  - Ensures scripts are executable

### Installation Scripts (Included in Bundle)

- **`install-offline.sh`** (Linux/Mac) - Installs from offline bundle
- **`install-offline.bat`** (Windows) - Installs from offline bundle

---

## 🗺️ Deployment Workflow

```
┌─────────────────────────────────────────────────────────┐
│  Phase 1: PREPARATION (Internet-Connected Machine)     │
│  ────────────────────────────────────────────────       │
│  1. Clone repository                                    │
│  2. Run scripts/prepare-offline-bundle.sh              │
│  3. Download Node.js, pnpm installers                  │
│  📦 Output: Offline bundle package                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Phase 2: TRANSFER (USB/CD/Secure Transfer)            │
│  ────────────────────────────────────────────────       │
│  Transfer bundle + installers to air-gapped machine    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Phase 3: PREREQUISITES (Air-Gapped Machine)           │
│  ────────────────────────────────────────────────       │
│  1. Install Node.js (from transferred installer)       │
│  2. Install pnpm (from transferred .tgz)               │
│  3. (Optional) Install PM2/NSSM for production         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Phase 4: INSTALLATION                                  │
│  ────────────────────────────────────────────────       │
│  1. Extract bundle                                      │
│  2. Run install-offline.sh (or .bat)                   │
│  3. Configure .env.local                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Phase 5: DEPLOYMENT                                    │
│  ────────────────────────────────────────────────       │
│  Choose deployment method:                              │
│  • Direct start (development/testing)                   │
│  • PM2 (production - Linux/Mac)                        │
│  • Windows Service (production - Windows)              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Phase 6: VERIFICATION                                  │
│  ────────────────────────────────────────────────       │
│  1. Test http://localhost:3000                         │
│  2. Test from network                                  │
│  3. Verify connectivity to backend                     │
│  4. Configure firewall if needed                       │
│  ✅ Application Running!                               │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Quick Reference

### Essential Files to Transfer

From internet-connected machine to air-gapped machine:

- [ ] `pump-iot-offline-bundle-YYYYMMDD-HHMMSS.tar.gz` - Main bundle
- [ ] `pump-iot-offline-bundle-YYYYMMDD-HHMMSS.tar.gz.sha256` - Checksum
- [ ] `node-v20.x.x-x64.msi` (Windows) or `node-v20.x.x-linux-x64.tar.xz` (Linux)
- [ ] `pnpm-9.15.4.tgz`
- [ ] (Optional) `pm2-x.x.x.tgz`
- [ ] (Optional) `nssm-2.24.zip` (for Windows service)

### Quick Commands

**Preparation** (on internet machine):
```bash
git clone https://github.com/Dharnon/pump-iot-web-prod.git
cd pump-iot-web-prod
bash scripts/prepare-offline-bundle.sh
```

**Installation** (on air-gapped machine):
```bash
# Extract bundle
tar -xzf pump-iot-offline-bundle-*.tar.gz
cd pump-iot-offline-bundle-*

# Install
./install-offline.sh  # Linux/Mac
# or
install-offline.bat   # Windows
```

**Start Application**:
```bash
# Direct start
cd source/apps/supervisor
pnpm start

# With PM2
pm2 start "pnpm start" --name pump-iot
pm2 save

# Windows Service (NSSM)
nssm install PumpIoTWeb "C:\Program Files\nodejs\pnpm.cmd" start
nssm set PumpIoTWeb AppDirectory "C:\path\to\source\apps\supervisor"
nssm start PumpIoTWeb
```

---

## 🎓 Common Scenarios

### Scenario 1: First-Time Air-Gapped Deployment

**What to read**:
1. [AIRGAP_QUICKSTART.md](./AIRGAP_QUICKSTART.md) - Get overview
2. [OFFLINE_DEPLOYMENT.md](./OFFLINE_DEPLOYMENT.md) - Follow detailed steps
3. [WINDOWS_SERVICE_SETUP.md](./WINDOWS_SERVICE_SETUP.md) - If on Windows

**What to do**:
1. Prepare bundle on machine with internet
2. Transfer to air-gapped machine
3. Install prerequisites
4. Run installation script
5. Configure and start

---

### Scenario 2: Windows Server Production Deployment

**What to read**:
1. [AIRGAP_QUICKSTART.md](./AIRGAP_QUICKSTART.md) - Overview
2. [WINDOWS_SERVICE_SETUP.md](./WINDOWS_SERVICE_SETUP.md) - Detailed Windows setup

**What to do**:
1. Complete basic installation
2. Choose service method (NSSM recommended)
3. Install as Windows Service
4. Configure auto-start and recovery
5. Test failover scenarios

---

### Scenario 3: VMware Deployment

**What to read**:
1. [OFFLINE_DEPLOYMENT.md](./OFFLINE_DEPLOYMENT.md) - General deployment
2. Platform-specific guide:
   - [WINDOWS_SERVICE_SETUP.md](./WINDOWS_SERVICE_SETUP.md) for Windows VM
   - Or standard PM2 setup for Linux VM

**What to do**:
1. Ensure VM has required resources (2+ CPU, 4+ GB RAM)
2. Transfer bundle to VM
3. Install as per platform
4. Configure network/firewall in VMware
5. Test from outside the VM

---

### Scenario 4: Update Existing Installation

**What to read**:
1. [OFFLINE_DEPLOYMENT.md](./OFFLINE_DEPLOYMENT.md) - Section: "Updates and Maintenance"
2. [AIRGAP_TROUBLESHOOTING.md](./AIRGAP_TROUBLESHOOTING.md) - Section: "Update and Maintenance Issues"

**What to do**:
1. Backup current installation (.env.local, custom configs)
2. Prepare new bundle on internet machine
3. Transfer to air-gapped machine
4. Stop current application
5. Install new bundle
6. Restore configurations
7. Restart application

---

### Scenario 5: Troubleshooting Deployment Issues

**What to read**:
1. [AIRGAP_TROUBLESHOOTING.md](./AIRGAP_TROUBLESHOOTING.md) - Find your specific issue

**What to do**:
1. Identify the phase where issue occurs (preparation, transfer, installation, runtime)
2. Find relevant section in troubleshooting guide
3. Try suggested solutions
4. Collect system information if issue persists
5. Contact support with detailed information

---

## 🔍 Finding Information Quickly

### I need to...

- **Create an offline bundle** → [AIRGAP_QUICKSTART.md](./AIRGAP_QUICKSTART.md) or `scripts/prepare-offline-bundle.sh`
- **Install on air-gapped machine** → [OFFLINE_DEPLOYMENT.md](./OFFLINE_DEPLOYMENT.md)
- **Set up Windows Service** → [WINDOWS_SERVICE_SETUP.md](./WINDOWS_SERVICE_SETUP.md)
- **Fix an issue** → [AIRGAP_TROUBLESHOOTING.md](./AIRGAP_TROUBLESHOOTING.md)
- **Update the application** → [OFFLINE_DEPLOYMENT.md](./OFFLINE_DEPLOYMENT.md) - "Updates and Maintenance"
- **Configure environment variables** → [OFFLINE_DEPLOYMENT.md](./OFFLINE_DEPLOYMENT.md) - "Configuration"
- **Understand the architecture** → [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Deploy with internet** → [DESPLIEGUE.md](./DESPLIEGUE.md)

---

## 📞 Support

### Self-Service Resources

1. **Check documentation** - Start with this index
2. **Validation script** - Run `scripts/validate-airgap-setup.sh`
3. **Troubleshooting guide** - See [AIRGAP_TROUBLESHOOTING.md](./AIRGAP_TROUBLESHOOTING.md)
4. **Search documentation** - All docs are markdown, easily searchable

### When Contacting Support

Include:
- Environment: OS, Node.js version, pnpm version
- Deployment phase: Where in the process are you?
- Error message: Full error with stack trace
- Logs: Recent application logs
- What you tried: Solutions already attempted

---

## 📝 Version Information

- **Documentation Version**: 1.0
- **Last Updated**: February 2026
- **Target Platforms**: Windows Server 2016+, Ubuntu 20.04+, RHEL 8+
- **Node.js Version**: 18.x, 20.x LTS
- **pnpm Version**: 9.15.4+

---

## ✅ Deployment Checklist

Use this checklist to ensure successful deployment:

### Preparation Phase
- [ ] Repository cloned on internet-connected machine
- [ ] Bundle preparation script executed successfully
- [ ] Node.js installer downloaded
- [ ] pnpm package downloaded
- [ ] Optional tools downloaded (PM2, NSSM)
- [ ] Bundle checksum verified
- [ ] All files ready for transfer

### Transfer Phase
- [ ] Bundle transferred to air-gapped machine
- [ ] Checksum file transferred
- [ ] Installers transferred
- [ ] Transfer integrity verified (checksum matches)

### Installation Phase
- [ ] Node.js installed and verified
- [ ] pnpm installed and verified
- [ ] Bundle extracted successfully
- [ ] Installation script executed
- [ ] Dependencies restored
- [ ] Build artifacts in place

### Configuration Phase
- [ ] .env.local created from .env.example
- [ ] NEXT_PUBLIC_API_URL configured correctly
- [ ] Backend connectivity verified
- [ ] Firewall rules configured
- [ ] Port 3000 accessible

### Deployment Phase
- [ ] Application starts without errors
- [ ] Accessible from localhost
- [ ] Accessible from network
- [ ] Service configured (if production)
- [ ] Auto-start configured (if production)
- [ ] Logs accessible and rotating

### Verification Phase
- [ ] Web interface loads correctly
- [ ] Can connect to backend API
- [ ] All features functional
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Backup strategy in place

---

**Need help?** Start with [AIRGAP_QUICKSTART.md](./AIRGAP_QUICKSTART.md) or [AIRGAP_TROUBLESHOOTING.md](./AIRGAP_TROUBLESHOOTING.md)

**Ready to begin?** Run `bash scripts/prepare-offline-bundle.sh` to create your deployment package!
