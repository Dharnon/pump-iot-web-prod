#!/bin/bash

# ============================================
# Air-Gapped Deployment Validation Script
# ============================================
# Validates that all necessary files and 
# documentation for air-gapped deployment exist
# ============================================

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_ok() {
    echo -e "${GREEN}✓${NC} $1"
}

print_fail() {
    echo -e "${RED}✗${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "=========================================="
echo "Air-Gapped Deployment Validation"
echo "=========================================="
echo ""

ERRORS=0

# Check documentation files
echo "Checking documentation..."

if [ -f "OFFLINE_DEPLOYMENT.md" ]; then
    print_ok "OFFLINE_DEPLOYMENT.md exists"
else
    print_fail "OFFLINE_DEPLOYMENT.md missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "WINDOWS_SERVICE_SETUP.md" ]; then
    print_ok "WINDOWS_SERVICE_SETUP.md exists"
else
    print_fail "WINDOWS_SERVICE_SETUP.md missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "AIRGAP_QUICKSTART.md" ]; then
    print_ok "AIRGAP_QUICKSTART.md exists"
else
    print_fail "AIRGAP_QUICKSTART.md missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "AIRGAP_TROUBLESHOOTING.md" ]; then
    print_ok "AIRGAP_TROUBLESHOOTING.md exists"
else
    print_fail "AIRGAP_TROUBLESHOOTING.md missing"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "Checking scripts..."

if [ -f "scripts/prepare-offline-bundle.sh" ]; then
    print_ok "prepare-offline-bundle.sh exists"
    if [ -x "scripts/prepare-offline-bundle.sh" ]; then
        print_ok "prepare-offline-bundle.sh is executable"
    else
        print_warn "prepare-offline-bundle.sh is not executable (run: chmod +x scripts/prepare-offline-bundle.sh)"
    fi
else
    print_fail "scripts/prepare-offline-bundle.sh missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "scripts/quick-start.sh" ]; then
    print_ok "quick-start.sh exists"
else
    print_warn "quick-start.sh not found (optional)"
fi

echo ""
echo "Checking project structure..."

if [ -f "package.json" ]; then
    print_ok "package.json exists"
else
    print_fail "package.json missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "pnpm-lock.yaml" ]; then
    print_ok "pnpm-lock.yaml exists"
else
    print_fail "pnpm-lock.yaml missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "pnpm-workspace.yaml" ]; then
    print_ok "pnpm-workspace.yaml exists"
else
    print_fail "pnpm-workspace.yaml missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "apps/supervisor" ]; then
    print_ok "apps/supervisor directory exists"
else
    print_fail "apps/supervisor directory missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "apps/operator" ]; then
    print_ok "apps/operator directory exists"
else
    print_fail "apps/operator directory missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".env.example" ]; then
    print_ok ".env.example exists"
else
    print_warn ".env.example not found (recommended)"
fi

echo ""
echo "Checking README references..."

if grep -q "OFFLINE_DEPLOYMENT.md" README.md; then
    print_ok "README.md references offline deployment"
else
    print_warn "README.md doesn't mention offline deployment"
fi

if grep -q "AIRGAP_QUICKSTART.md" README.md; then
    print_ok "README.md references air-gap quick start"
else
    print_warn "README.md doesn't mention air-gap quick start"
fi

echo ""
echo "=========================================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Validation passed!${NC}"
    echo ""
    echo "All required files for air-gapped deployment are present."
    echo ""
    echo "Next steps:"
    echo "1. Review the documentation:"
    echo "   - OFFLINE_DEPLOYMENT.md"
    echo "   - AIRGAP_QUICKSTART.md"
    echo "2. Test the bundle preparation script:"
    echo "   bash scripts/prepare-offline-bundle.sh"
    echo "3. Follow the deployment guide for your environment"
    exit 0
else
    echo -e "${RED}✗ Validation failed with $ERRORS error(s)${NC}"
    echo ""
    echo "Please ensure all required files are present before proceeding."
    exit 1
fi
