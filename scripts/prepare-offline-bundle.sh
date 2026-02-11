#!/bin/bash

# ============================================
# Prepare Offline Deployment Bundle
# ============================================
# This script prepares a complete offline deployment bundle
# that can be transferred to an air-gapped environment
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Variables
BUNDLE_NAME="pump-iot-offline-bundle-$(date +%Y%m%d-%H%M%S)"
BUNDLE_DIR="offline-bundles/$BUNDLE_NAME"
PROJECT_ROOT=$(pwd)

main() {
    clear
    print_header "PUMP IOT WEB - OFFLINE BUNDLE PREPARATION"
    
    print_info "This script will create a complete offline deployment package"
    print_info "Bundle will be created at: $BUNDLE_DIR"
    echo ""
    
    # Step 1: Check prerequisites
    print_header "Step 1: Checking Prerequisites"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js found: $(node --version)"
    
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed"
        print_info "Install with: npm install -g pnpm@9.15.4"
        exit 1
    fi
    print_success "pnpm found: $(pnpm --version)"
    
    # Step 2: Create bundle directory
    print_header "Step 2: Creating Bundle Directory"
    mkdir -p "$BUNDLE_DIR"
    print_success "Created directory: $BUNDLE_DIR"
    
    # Step 3: Install dependencies
    print_header "Step 3: Installing Dependencies"
    print_info "Installing all dependencies with pnpm..."
    pnpm install --frozen-lockfile
    print_success "Dependencies installed"
    
    # Step 4: Build the applications
    print_header "Step 4: Building Applications"
    print_info "Building all applications for production..."
    pnpm build
    print_success "Applications built successfully"
    
    # Step 5: Copy source code (excluding node_modules initially)
    print_header "Step 5: Copying Source Code"
    print_info "Copying project files..."
    
    # Create a temporary exclusion list
    cat > /tmp/rsync-exclude.txt << 'EOF'
node_modules/
.git/
.next/
dist/
out/
.turbo/
.cache/
offline-bundles/
*.log
.env.local
.DS_Store
EOF
    
    rsync -av --exclude-from=/tmp/rsync-exclude.txt "$PROJECT_ROOT/" "$BUNDLE_DIR/source/"
    print_success "Source code copied"
    
    # Step 6: Package dependencies using pnpm
    print_header "Step 6: Packaging Dependencies"
    print_info "Creating offline pnpm store..."
    
    # Create a directory for the pnpm store
    mkdir -p "$BUNDLE_DIR/pnpm-store"
    
    # Export the pnpm store
    cd "$PROJECT_ROOT"
    pnpm store export "$PROJECT_ROOT/$BUNDLE_DIR/pnpm-store" || {
        print_warning "pnpm store export not available, using alternative method"
        # Alternative: copy node_modules
        print_info "Copying node_modules as fallback..."
        mkdir -p "$BUNDLE_DIR/dependencies"
        cp -r node_modules "$BUNDLE_DIR/dependencies/node_modules_root"
        cp -r apps/supervisor/node_modules "$BUNDLE_DIR/dependencies/node_modules_supervisor" 2>/dev/null || true
        cp -r apps/operator/node_modules "$BUNDLE_DIR/dependencies/node_modules_operator" 2>/dev/null || true
    }
    
    print_success "Dependencies packaged"
    
    # Step 7: Copy build artifacts
    print_header "Step 7: Copying Build Artifacts"
    print_info "Copying production builds..."
    
    mkdir -p "$BUNDLE_DIR/builds"
    
    # Copy supervisor build
    if [ -d "apps/supervisor/.next" ]; then
        cp -r apps/supervisor/.next "$BUNDLE_DIR/builds/supervisor-.next"
        print_success "Supervisor build copied"
    fi
    
    # Copy operator build
    if [ -d "apps/operator/dist" ]; then
        cp -r apps/operator/dist "$BUNDLE_DIR/builds/operator-dist"
        print_success "Operator build copied"
    fi
    
    # Step 8: Copy pnpm lock file
    print_header "Step 8: Copying Lock Files"
    cp pnpm-lock.yaml "$BUNDLE_DIR/source/" 2>/dev/null || true
    print_success "Lock files copied"
    
    # Step 9: Create installation scripts
    print_header "Step 9: Creating Installation Scripts"
    
    # Create Linux/Mac installation script
    cat > "$BUNDLE_DIR/install-offline.sh" << 'INSTALL_SCRIPT'
#!/bin/bash

# Offline Installation Script for Pump IoT Web Platform
set -e

echo "========================================="
echo "PUMP IOT WEB - OFFLINE INSTALLATION"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Installing from offline bundle...${NC}"

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}Warning: pnpm not found. Please install pnpm first:${NC}"
    echo "  npm install -g pnpm@9.15.4"
    echo ""
    echo "Note: In an air-gapped environment, you need to:"
    echo "1. Download pnpm installer on a machine with internet"
    echo "2. Transfer it to this machine"
    echo "3. Install it locally"
    exit 1
fi

# Navigate to source directory
cd source

echo -e "${BLUE}Restoring dependencies from offline store...${NC}"

# If we have a pnpm store, import it
if [ -d "../pnpm-store" ]; then
    echo "Importing pnpm store..."
    pnpm store import ../pnpm-store
    pnpm install --offline --frozen-lockfile
elif [ -d "../dependencies" ]; then
    echo "Restoring node_modules from backup..."
    cp -r ../dependencies/node_modules_root ./node_modules
    [ -d "../dependencies/node_modules_supervisor" ] && cp -r ../dependencies/node_modules_supervisor ./apps/supervisor/node_modules
    [ -d "../dependencies/node_modules_operator" ] && cp -r ../dependencies/node_modules_operator ./apps/operator/node_modules
else
    echo -e "${YELLOW}Warning: No offline dependencies found${NC}"
    echo "You may need to install dependencies with internet access"
fi

# Restore build artifacts
echo -e "${BLUE}Restoring build artifacts...${NC}"
if [ -d "../builds/supervisor-.next" ]; then
    cp -r ../builds/supervisor-.next ./apps/supervisor/.next
    echo -e "${GREEN}✓ Supervisor build restored${NC}"
fi

if [ -d "../builds/operator-dist" ]; then
    cp -r ../builds/operator-dist ./apps/operator/dist
    echo -e "${GREEN}✓ Operator build restored${NC}"
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Installation Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Configure environment variables:"
echo "   cp .env.example .env.local"
echo "   nano .env.local"
echo ""
echo "2. Start the application:"
echo "   cd apps/supervisor"
echo "   pnpm start"
echo ""
echo "For more information, see: ../OFFLINE_DEPLOYMENT.md"
INSTALL_SCRIPT
    
    chmod +x "$BUNDLE_DIR/install-offline.sh"
    print_success "Linux/Mac installation script created"
    
    # Create Windows installation script
    cat > "$BUNDLE_DIR/install-offline.bat" << 'INSTALL_BAT'
@echo off
REM Offline Installation Script for Pump IoT Web Platform (Windows)

echo =========================================
echo PUMP IOT WEB - OFFLINE INSTALLATION
echo =========================================
echo.

echo Installing from offline bundle...

REM Check if pnpm is available
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: pnpm not found. Please install pnpm first:
    echo   npm install -g pnpm@9.15.4
    echo.
    echo Note: In an air-gapped environment, you need to:
    echo 1. Download pnpm installer on a machine with internet
    echo 2. Transfer it to this machine
    echo 3. Install it locally
    exit /b 1
)

cd source

echo Restoring dependencies from offline store...

REM Check if we have a pnpm store
if exist "..\pnpm-store" (
    echo Importing pnpm store...
    pnpm store import ..\pnpm-store
    pnpm install --offline --frozen-lockfile
) else if exist "..\dependencies" (
    echo Restoring node_modules from backup...
    xcopy /E /I /Y ..\dependencies\node_modules_root node_modules
    if exist "..\dependencies\node_modules_supervisor" xcopy /E /I /Y ..\dependencies\node_modules_supervisor apps\supervisor\node_modules
    if exist "..\dependencies\node_modules_operator" xcopy /E /I /Y ..\dependencies\node_modules_operator apps\operator\node_modules
) else (
    echo Warning: No offline dependencies found
    echo You may need to install dependencies with internet access
)

REM Restore build artifacts
echo Restoring build artifacts...
if exist "..\builds\supervisor-.next" (
    xcopy /E /I /Y ..\builds\supervisor-.next apps\supervisor\.next
    echo [OK] Supervisor build restored
)

if exist "..\builds\operator-dist" (
    xcopy /E /I /Y ..\builds\operator-dist apps\operator\dist
    echo [OK] Operator build restored
)

echo.
echo =========================================
echo Installation Complete!
echo =========================================
echo.
echo Next steps:
echo 1. Configure environment variables:
echo    copy .env.example .env.local
echo    notepad .env.local
echo.
echo 2. Start the application:
echo    cd apps\supervisor
echo    pnpm start
echo.
echo For Windows Service setup, see: ..\WINDOWS_SERVICE_SETUP.md
INSTALL_BAT
    
    print_success "Windows installation script created"
    
    # Step 10: Create README for the bundle
    cat > "$BUNDLE_DIR/README.md" << 'README'
# Pump IoT Web Platform - Offline Deployment Bundle

This bundle contains everything needed to deploy the Pump IoT Web Platform in an air-gapped environment.

## Contents

- `source/` - Complete source code
- `pnpm-store/` or `dependencies/` - All npm dependencies packaged offline
- `builds/` - Pre-built production artifacts
- `install-offline.sh` - Installation script for Linux/Mac
- `install-offline.bat` - Installation script for Windows
- `OFFLINE_DEPLOYMENT.md` - Detailed offline deployment guide
- `WINDOWS_SERVICE_SETUP.md` - Guide for running as Windows service

## Quick Start

### Prerequisites (Must be installed before offline installation)

1. **Node.js** 18.x or higher
   - Download installer from: https://nodejs.org/
   - Transfer to air-gapped machine and install
   
2. **pnpm** 9.15.4 or higher
   - On a machine with internet: `npm pack pnpm`
   - Transfer the .tgz file to air-gapped machine
   - Install with: `npm install -g pnpm-9.15.4.tgz`

### Installation Steps

#### On Linux/Mac:
```bash
chmod +x install-offline.sh
./install-offline.sh
```

#### On Windows:
```cmd
install-offline.bat
```

## Post-Installation

1. Configure environment variables:
   ```bash
   cd source
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

2. Start the application:
   ```bash
   cd source/apps/supervisor
   pnpm start
   ```

3. Access the application:
   - Supervisor: http://localhost:3000
   - Operator: http://localhost:3000/operator

## Windows Service Setup

For running as a Windows service, see `WINDOWS_SERVICE_SETUP.md`

## Support

For issues or questions, refer to the documentation in the `source/` directory:
- `DESPLIEGUE.md` - Deployment guide (Spanish)
- `README.md` - General information
- `ARCHITECTURE.md` - Architecture documentation

## Version Information

- Bundle Created: $(date)
- Node.js Version: $(node --version)
- pnpm Version: $(pnpm --version)
README
    
    print_success "README created"
    
    # Step 11: Create comprehensive offline deployment guide
    print_header "Step 11: Creating Documentation"
    
    cp "$PROJECT_ROOT/scripts/prepare-offline-bundle.sh" "$BUNDLE_DIR/" || true
    
    print_success "Documentation created"
    
    # Step 12: Create archive
    print_header "Step 12: Creating Archive"
    
    cd "$PROJECT_ROOT"
    print_info "Compressing bundle (this may take a while)..."
    tar -czf "${BUNDLE_NAME}.tar.gz" -C "offline-bundles" "$BUNDLE_NAME"
    
    BUNDLE_SIZE=$(du -h "${BUNDLE_NAME}.tar.gz" | cut -f1)
    print_success "Bundle created: ${BUNDLE_NAME}.tar.gz (${BUNDLE_SIZE})"
    
    # Step 13: Calculate checksum
    print_header "Step 13: Generating Checksum"
    
    if command -v sha256sum &> /dev/null; then
        sha256sum "${BUNDLE_NAME}.tar.gz" > "${BUNDLE_NAME}.tar.gz.sha256"
        print_success "SHA256 checksum created"
    elif command -v shasum &> /dev/null; then
        shasum -a 256 "${BUNDLE_NAME}.tar.gz" > "${BUNDLE_NAME}.tar.gz.sha256"
        print_success "SHA256 checksum created"
    fi
    
    # Final summary
    print_header "BUNDLE PREPARATION COMPLETE!"
    
    echo -e "${GREEN}Bundle successfully created!${NC}\n"
    echo -e "${BLUE}Bundle Information:${NC}"
    echo -e "  Location: ${YELLOW}${BUNDLE_NAME}.tar.gz${NC}"
    echo -e "  Size: ${YELLOW}${BUNDLE_SIZE}${NC}"
    echo -e "  Directory: ${YELLOW}${BUNDLE_DIR}${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo -e "  1. Transfer the bundle to your air-gapped environment:"
    echo -e "     ${YELLOW}${BUNDLE_NAME}.tar.gz${NC}"
    echo -e "     ${YELLOW}${BUNDLE_NAME}.tar.gz.sha256${NC} (for verification)"
    echo ""
    echo -e "  2. On the air-gapped machine, extract and install:"
    echo -e "     ${YELLOW}tar -xzf ${BUNDLE_NAME}.tar.gz${NC}"
    echo -e "     ${YELLOW}cd ${BUNDLE_NAME}${NC}"
    echo -e "     ${YELLOW}./install-offline.sh${NC} (or install-offline.bat on Windows)"
    echo ""
    echo -e "  3. See ${YELLOW}${BUNDLE_DIR}/README.md${NC} for detailed instructions"
    echo ""
    echo -e "${GREEN}Happy deploying! 🚀${NC}\n"
}

# Run main function
main
