#!/usr/bin/env bash
# =============================================================================
# TalentFlow 360 - 1-Click Production Update Script
# Updates live application code with zero database data loss
# =============================================================================

set -e

# Color definitions
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}====================================================================${NC}"
echo -e "${CYAN}🔄 TALENTFLOW 360 - ZERO-DOWNTIME LIVE UPDATE                      ${NC}"
echo -e "${CYAN}====================================================================${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Pull latest code changes from Git repository
echo -e "\n${BLUE}[1/4] Pulling latest code changes from Git repository...${NC}"
git pull

# 2. Detect docker compose command
if docker compose version &> /dev/null; then
  COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
  COMPOSE="docker-compose"
else
  echo -e "${YELLOW}Docker compose not found. Please install docker-compose.${NC}"
  exit 1
fi

# 3. Rebuild and gracefully reload updated containers
echo -e "\n${BLUE}[2/4] Rebuilding updated services (Backend / Frontend)...${NC}"
echo -e "${YELLOW}  Note: MySQL and MongoDB data volumes will remain 100% intact.${NC}"
$COMPOSE up -d --build

# 4. Clean up old/dangling container images to free disk space
echo -e "\n${BLUE}[3/4] Cleaning up unused intermediate build images...${NC}"
docker image prune -f

# 5. Check live health status
echo -e "\n${BLUE}[4/4] Verifying updated services...${NC}"
sleep 3
$COMPOSE ps

echo -e "\n${GREEN}====================================================================${NC}"
echo -e "${GREEN}✅ TALENTFLOW 360 UPDATED SUCCESSFULLY!                             ${NC}"
echo -e "${GREEN}====================================================================${NC}"
