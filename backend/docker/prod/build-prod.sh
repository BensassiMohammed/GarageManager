#!/bin/bash
# =============================================================================
# Build & Deploy - Production Environment
# =============================================================================
# Usage: chmod +x build-prod.sh && ./build-prod.sh
# =============================================================================

set -e  # Exit on error

echo "=========================================="
echo "🔧 Building Production Environment"
echo "=========================================="

# Variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.prod exists
if [ ! -f "$SCRIPT_DIR/.env.prod" ]; then
    echo -e "${RED}❌ Error: .env.prod file not found!${NC}"
    echo "Please create .env.prod from .env.example template"
    exit 1
fi

# Check for default password warning
if grep -q "CHANGE_THIS_STRONG_PASSWORD" "$SCRIPT_DIR/.env.prod"; then
    echo -e "${RED}❌ Error: Default password detected in .env.prod!${NC}"
    echo "Please change POSTGRES_PASSWORD before deploying to production"
    exit 1
fi

echo -e "${BLUE}📦 Building Backend image...${NC}"
cd "$BACKEND_DIR"
sudo docker build -t garage-backend:latest .

echo -e "${BLUE}📦 Building Frontend image (production profile)...${NC}"
cd "$FRONTEND_DIR"
sudo docker build --build-arg PROFILE=production -t garage-frontend:latest .

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo ""
echo "=========================================="
echo "🚀 Starting Production Environment"
echo "=========================================="

cd "$SCRIPT_DIR"
sudo docker-compose --env-file .env.prod -f docker-compose.yml down 2>/dev/null || true
sudo docker-compose --env-file .env.prod -f docker-compose.yml up -d

echo ""
echo -e "${GREEN}✅ Production environment is running!${NC}"
echo ""
echo "📍 Frontend: http://localhost:8050"
echo "📍 Backend:  http://localhost:8090"
echo "📍 Database: localhost:5432"
echo ""
echo -e "${YELLOW}⚠️  Assurez-vous que les ports sont correctement exposés sur votre serveur${NC}"

