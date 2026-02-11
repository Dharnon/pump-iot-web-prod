#!/bin/bash

# ============================================
# Script de Inicio Rápido - Pump IoT Web
# ============================================
# Este script verifica requisitos e instala
# la aplicación automáticamente
# ============================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
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

# Verificar Node.js
check_node() {
    print_header "Verificando Node.js"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js instalado: $NODE_VERSION"
        
        # Verificar versión mínima (v18)
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$MAJOR_VERSION" -lt 18 ]; then
            print_error "Node.js versión 18 o superior requerida. Tienes: $NODE_VERSION"
            print_info "Instala Node.js LTS desde: https://nodejs.org/"
            exit 1
        fi
    else
        print_error "Node.js no está instalado"
        print_info "Por favor instala Node.js 18 o superior"
        print_info "Visita: https://nodejs.org/"
        exit 1
    fi
}

# Verificar pnpm
check_pnpm() {
    print_header "Verificando pnpm"
    
    if command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm --version)
        print_success "pnpm instalado: $PNPM_VERSION"
    else
        print_warning "pnpm no está instalado"
        print_info "Instalando pnpm..."
        npm install -g pnpm@9.15.4
        print_success "pnpm instalado correctamente"
    fi
}

# Verificar Git
check_git() {
    print_header "Verificando Git"
    
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        print_success "Git instalado: $GIT_VERSION"
    else
        print_error "Git no está instalado"
        print_info "Instala Git con: sudo apt install git"
        exit 1
    fi
}

# Instalar dependencias
install_dependencies() {
    print_header "Instalando dependencias"
    
    print_info "Esto puede tomar varios minutos..."
    pnpm install
    print_success "Dependencias instaladas correctamente"
}

# Configurar variables de entorno
setup_env() {
    print_header "Configurando variables de entorno"
    
    if [ -f ".env.local" ]; then
        print_warning "Archivo .env.local ya existe"
        read -p "¿Deseas sobrescribirlo? (s/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            print_info "Manteniendo .env.local existente"
            return
        fi
    fi
    
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_success "Archivo .env.local creado desde .env.example"
        print_warning "IMPORTANTE: Edita .env.local y configura NEXT_PUBLIC_API_URL"
        print_info "Ejecuta: nano .env.local"
    else
        print_warning ".env.example no encontrado, creando .env.local básico"
        cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5002
PORT=3000
NODE_ENV=production
EOF
        print_success "Archivo .env.local creado con valores por defecto"
    fi
}

# Construir aplicación
build_app() {
    print_header "Construyendo aplicación"
    
    read -p "¿Deseas construir la aplicación ahora? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        print_info "Construyendo... Esto puede tomar varios minutos"
        pnpm build
        print_success "Aplicación construida correctamente"
    else
        print_info "Construcción omitida. Ejecuta 'pnpm build' cuando estés listo"
    fi
}

# Mostrar siguiente pasos
show_next_steps() {
    print_header "Instalación Completa!"
    
    echo -e "${GREEN}La aplicación está lista para usarse.${NC}\n"
    
    echo -e "${BLUE}Siguientes pasos:${NC}"
    echo -e "  1. Configura las variables de entorno:"
    echo -e "     ${YELLOW}nano .env.local${NC}"
    echo -e ""
    echo -e "  2. Para desarrollo:"
    echo -e "     ${YELLOW}pnpm dev${NC}"
    echo -e ""
    echo -e "  3. Para producción:"
    echo -e "     ${YELLOW}pnpm build${NC}"
    echo -e "     ${YELLOW}cd apps/supervisor && pnpm start${NC}"
    echo -e ""
    echo -e "  4. O usar PM2 (recomendado para producción):"
    echo -e "     ${YELLOW}npm install -g pm2${NC}"
    echo -e "     ${YELLOW}cd apps/supervisor${NC}"
    echo -e "     ${YELLOW}pm2 start 'pnpm start' --name pump-iot${NC}"
    echo -e ""
    echo -e "${BLUE}Documentación completa:${NC}"
    echo -e "  ${YELLOW}cat DESPLIEGUE.md${NC}"
    echo -e ""
    echo -e "${GREEN}¡Buen trabajo! 🚀${NC}\n"
}

# Función principal
main() {
    clear
    print_header "PUMP IOT WEB - INSTALACIÓN AUTOMATIZADA"
    
    print_info "Este script instalará y configurará la aplicación"
    echo ""
    
    # Ejecutar verificaciones e instalación
    check_node
    check_pnpm
    check_git
    install_dependencies
    setup_env
    build_app
    show_next_steps
}

# Ejecutar
main
