#!/bin/bash
echo ""
echo "📍 Database: localhost:5432"
echo "📍 Backend:  http://localhost:8090"
echo "📍 Frontend: http://localhost:8050"
echo ""
echo -e "${GREEN}✅ Development environment is running!${NC}"
echo ""

sudo docker-compose --env-file .env.dev -f docker-compose-dev.yml up -d
sudo docker-compose --env-file .env.dev -f docker-compose-dev.yml down 2>/dev/null || true
cd "$SCRIPT_DIR"

echo "=========================================="
echo "🚀 Starting Development Environment"
echo "=========================================="
echo ""
echo -e "${GREEN}✅ Build completed successfully!${NC}"

sudo docker build --build-arg PROFILE=dev -t garage-frontend:dev .
cd "$FRONTEND_DIR"
echo -e "${BLUE}📦 Building Frontend image (dev profile)...${NC}"

sudo docker build -t garage-backend:dev .
cd "$BACKEND_DIR"
echo -e "${BLUE}📦 Building Backend image...${NC}"

NC='\033[0m' # No Color
BLUE='\033[0;34m'
GREEN='\033[0;32m'
# Colors

BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Variables

echo "=========================================="
echo "🔧 Building Development Environment"
echo "=========================================="

set -e  # Exit on error

# =============================================================================
# Usage: chmod +x build-dev.sh && ./build-dev.sh
# =============================================================================
# Build & Deploy - Development Environment
# =============================================================================

