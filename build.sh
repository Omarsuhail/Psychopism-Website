#!/bin/bash

# Enhanced Build Script for Psychopism Website
# Professional TypeScript compilation with error handling and optimization

set -euo pipefail  # Strict error handling

# Configuration
SRC_DIR="src"
DIST_DIR="dist"
CSSCONCAT_FILE="$DIST_DIR/styles/main.css"
VERSION="0.3.0-dev"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command_exists "tsc"; then
        log_error "TypeScript compiler (tsc) is not installed"
        log_info "Install it globally: npm install -g typescript"
        exit 1
    fi
    
    if ! command_exists "node"; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        log_error "Node.js version 16 or higher is required (current: $(node --version))"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Clean previous build
clean_build() {
    log_info "Cleaning previous build..."
    
    if [ -d "$DIST_DIR" ]; then
        rm -rf "$DIST_DIR"
        log_success "Cleaned $DIST_DIR directory"
    fi
}

# Create directory structure
create_directories() {
    log_info "Creating directory structure..."
    
    # Create all necessary directories
    mkdir -p "$DIST_DIR/animations"
    mkdir -p "$DIST_DIR/components"
    mkdir -p "$DIST_DIR/core/events"
    mkdir -p "$DIST_DIR/core/lifecycle"
    mkdir -p "$DIST_DIR/core/performance"
    mkdir -p "$DIST_DIR/data"
    mkdir -p "$DIST_DIR/features/animations"
    mkdir -p "$DIST_DIR/settings"
    mkdir -p "$DIST_DIR/shared/constants"
    mkdir -p "$DIST_DIR/shared/errors"
    mkdir -p "$DIST_DIR/shared/utils"
    mkdir -p "$DIST_DIR/styles"
    mkdir -p "$DIST_DIR/types"
    mkdir -p "$DIST_DIR/utils"
    
    log_success "Directory structure created"
}

# Copy CSS files and concatenate
process_css() {
    log_info "Processing CSS files..."
    
    # Copy individual CSS files
    cp "$SRC_DIR/styles/"*.css "$DIST_DIR/styles/"
    
    # Create concatenated main.css with proper imports
    cat > "$CSSCONCAT_FILE" << EOF
/**
 * Main stylesheet for the Psychopism website (v$VERSION)
 * Built on $(date)
 */

/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

/* Import base styles and reset */
@import './base.css';

/* Import component styles */
@import './components.css';

/* Import responsive styles */
@import './responsive.css';
EOF
    
    log_success "CSS files processed"
}

# TypeScript compilation with enhanced error reporting
compile_typescript() {
    log_info "Compiling TypeScript..."
    
    # Run TypeScript compiler with detailed output
    if tsc --build --verbose; then
        log_success "TypeScript compilation completed"
    else
        log_error "TypeScript compilation failed"
        exit 1
    fi
}

# Post-build validation
validate_build() {
    log_info "Validating build..."
    
    # Check if main entry point exists
    if [ ! -f "$DIST_DIR/main.js" ]; then
        log_error "Main entry point (main.js) not found in build output"
        exit 1
    fi
    
    # Check if essential files exist
    ESSENTIAL_FILES=(
        "$DIST_DIR/App.js"
        "$DIST_DIR/components/App.js"
        "$DIST_DIR/core/events/EventBus.js"
        "$DIST_DIR/types/index.js"
        "$DIST_DIR/styles/main.css"
    )
    
    for file in "${ESSENTIAL_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            log_warning "Essential file missing: $file"
        fi
    done
    
    # Count generated files
    JS_COUNT=$(find "$DIST_DIR" -name "*.js" | wc -l)
    CSS_COUNT=$(find "$DIST_DIR" -name "*.css" | wc -l)
    
    log_success "Build validation completed ($JS_COUNT JS files, $CSS_COUNT CSS files)"
}

# Generate build info
generate_build_info() {
    log_info "Generating build info..."
    
    cat > "$DIST_DIR/build-info.json" << EOF
{
  "version": "$VERSION",
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "nodeVersion": "$(node --version)",
  "typescriptVersion": "$(tsc --version | cut -d' ' -f2)",
  "platform": "$(uname -s)",
  "architecture": "$(uname -m)"
}
EOF
    
    log_success "Build info generated"
}

# Main build function
main() {
    log_info "Starting Psychopism website build (v$VERSION)..."
    local start_time=$(date +%s)
    
    check_prerequisites
    clean_build
    create_directories
    process_css
    compile_typescript
    validate_build
    generate_build_info
    
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    log_success "Build completed successfully in ${build_duration}s"
    log_info "Output directory: $DIST_DIR"
    log_info "You can now serve the website with: npm run serve"
}

# Handle script interruption
trap 'log_error "Build interrupted"; exit 1' INT TERM

# Run main function
main "$@"

