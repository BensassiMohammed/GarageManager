#!/bin/bash
# =============================================================================
# Build & Deploy - Staging Environment
# =============================================================================
# Usage: chmod +x build-staging.sh && ./build-staging.sh
# =============================================================================

set -e  # Exit on error

echo "=========================================="
echo "🔧 Building Staging Environment"
echo "=========================================="

# Variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# =========================
# Stop and remove existing staging containers
# =========================
echo -e "${YELLOW}🛑 Stopping existing staging containers...${NC}"
cd "$SCRIPT_DIR"
sudo docker compose --env-file .env.staging -f docker-compose-staging.yml down --remove-orphans

# =========================
# Build backend image
# =========================
echo -e "${BLUE}📦 Building Backend image...${NC}"
cd "$BACKEND_DIR"
sudo docker build -t garage-backend:staging .

# =========================
# Build frontend image
# =========================
echo -e "${BLUE}📦 Building Frontend image (staging profile)...${NC}"
cd "$FRONTEND_DIR"
sudo docker build --build-arg PROFILE=staging -t garage-frontend:staging .

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo ""

# =========================
# Start staging environment
# =========================
echo "=========================================="
echo "🚀 Starting Staging Environment"
echo "=========================================="

cd "$SCRIPT_DIR"
sudo docker compose --env-file .env.staging -f docker-compose-staging.yml up -d

echo ""
echo -e "${GREEN}✅ Staging environment is running!${NC}"
echo ""
echo "📍 Frontend: http://localhost:8051"
echo "📍 Backend:  http://localhost:8091"
echo "📍 Database: localhost:5432"
echo ""
echo -e "${YELLOW}⚠️  N'oubliez pas de configurer .env.staging avec les bons credentials${NC}"
