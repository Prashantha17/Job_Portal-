#!/usr/bin/env bash
# =============================================================================
# TalentFlow 360 - Automated Oracle Cloud (OCI) & Linux Server Deployment Script
# Supports: Oracle Linux 8/9, Ubuntu 20.04/22.04/24.04, Debian 11/12
# =============================================================================
set -e
# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
echo -e "${CYAN}====================================================================${NC}"
echo -e "${CYAN}🚀 TALENTFLOW 360 - ZERO-TOUCH OCI CLOUD DEPLOYMENT AUTOMATOR      ${NC}"
echo -e "${CYAN}====================================================================${NC}"
# Check for root / sudo access
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Please run this deployment script as root or with sudo:${NC}"
  echo "  sudo ./deploy-oci.sh"
  exit 1
fi
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
# -----------------------------------------------------------------------------
# Step 1: Detect Operating System & Package Manager
# -----------------------------------------------------------------------------
echo -e "\n${BLUE}[1/6] Detecting Operating System...${NC}"
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$ID
  VERSION=$VERSION_ID
  echo -e "${GREEN}✓ Detected OS: ${NAME} (${VERSION})${NC}"
else
  echo -e "${RED}[ERROR] Could not detect operating system.${NC}"
  exit 1
fi
# -----------------------------------------------------------------------------
# Step 2: Install Docker Engine & Docker Compose Plugin
# -----------------------------------------------------------------------------
echo -e "\n${BLUE}[2/6] Verifying Docker and Docker Compose Plugin...${NC}"
if ! command -v docker &> /dev/null; then
  echo -e "${YELLOW}Docker is not installed. Installing Docker...${NC}"
  if [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg lsb-release
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL "https://download.docker.com/linux/$OS/gpg" | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  elif [[ "$OS" == "ol" || "$OS" == "rhel" || "$OS" == "centos" ]]; then
    dnf install -y dnf-utils
    dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  fi
  systemctl enable --now docker
  echo -e "${GREEN}✓ Docker installed and started.${NC}"
else
  echo -e "${GREEN}✓ Docker is already installed: $(docker --version)${NC}"
fi

# Ensure docker compose is available
if docker compose version &> /dev/null; then
  DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE_CMD="docker-compose"
else
  echo -e "${RED}[ERROR] Docker Compose plugin is missing.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Using compose command: ${DOCKER_COMPOSE_CMD}${NC}"

# -----------------------------------------------------------------------------
# Step 3: Configure Host Firewall (OCI / iptables / firewalld / ufw)
# -----------------------------------------------------------------------------
echo -e "\n${BLUE}[3/6] Opening Host Firewall Ports for HTTP (80) & HTTPS (443)...${NC}"

if command -v ufw &> /dev/null && ufw status | grep -q "Status: active"; then
  ufw allow 80/tcp comment 'TalentFlow HTTP'
  ufw allow 443/tcp comment 'TalentFlow HTTPS'
  ufw reload
  echo -e "${GREEN}✓ UFW rules updated.${NC}"
elif command -v firewall-cmd &> /dev/null && systemctl is-active --quiet firewalld; then
  firewall-cmd --permanent --add-service=http
  firewall-cmd --permanent --add-service=https
  firewall-cmd --reload
  echo -e "${GREEN}✓ Firewalld rules updated.${NC}"
else
  # Default iptables rules on Oracle Linux Cloud Instances
  iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT 2>/dev/null || true
  iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT 2>/dev/null || true
  echo -e "${GREEN}✓ Firewall rules applied.${NC}"
fi

# -----------------------------------------------------------------------------
# Step 4: Validate Production .env Configuration
# -----------------------------------------------------------------------------
echo -e "\n${BLUE}[4/6] Checking Environment Variables (.env)...${NC}"
if [ ! -f .env ]; then
  echo -e "${YELLOW}No .env file found. Generating from .env.example with secure secrets...${NC}"
  cp .env.example .env
  # Auto-generate secure random secrets
  RANDOM_DB_PASS=$(openssl rand -hex 12)
  RANDOM_JWT_SECRET=$(openssl rand -hex 32)
  sed -i "s/ChangeThisToStrongPassword123!/${RANDOM_DB_PASS}/g" .env
  sed -i "s/404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970/${RANDOM_JWT_SECRET}/g" .env
  echo -e "${GREEN}✓ .env created with auto-generated secure credentials.${NC}"
  echo -e "${YELLOW}  (Edit .env to update MAIL_USERNAME / MAIL_PASSWORD for Gmail notifications)${NC}"
else
  echo -e "${GREEN}✓ Existing .env file found.${NC}"
fi

# -----------------------------------------------------------------------------
# Step 5: Build and Start Application Containers
# -----------------------------------------------------------------------------
echo -e "\n${BLUE}[5/6] Building & Launching TalentFlow 360 Stack...${NC}"
echo "  - MySQL 8.0 (Relational Database)"
echo "  - MongoDB 6.0 (Document Store)"
echo "  - Spring Boot 3.4.2 (Backend API)"
echo "  - React + Nginx (Frontend & Reverse Proxy)"

$DOCKER_COMPOSE_CMD down --remove-orphans 2>/dev/null || true
$DOCKER_COMPOSE_CMD build --pull
$DOCKER_COMPOSE_CMD up -d

# -----------------------------------------------------------------------------
# Step 6: Automated Health Check & Readiness Verification
# -----------------------------------------------------------------------------
echo -e "\n${BLUE}[6/6] Validating System Health and Availability...${NC}"
echo "Waiting for services to initialize (health probes running)..."

MAX_RETRIES=15
COUNTER=0
SUCCESS=false

while [ $COUNTER -lt $MAX_RETRIES ]; do
  sleep 4
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/healthz || true)
  if [ "$HTTP_STATUS" == "200" ]; then
    SUCCESS=true
    break
  fi
  COUNTER=$((COUNTER + 1))
  echo -n "."
done
echo ""

# Get Server Public IP
PUBLIC_IP=$(curl -s -4 ifconfig.me || curl -s icanhazip.com || echo "your-server-ip")

if [ "$SUCCESS" = true ]; then
  echo -e "\n${GREEN}====================================================================${NC}"
  echo -e "${GREEN}🎉 TALENTFLOW 360 IS SUCCESSFULLY DEPLOYED AND LIVE!                ${NC}"
  echo -e "${GREEN}====================================================================${NC}"
  echo -e "  🌐 Web Application : ${CYAN}http://${PUBLIC_IP}/${NC}"
  echo -e "  📡 REST API Base   : ${CYAN}http://${PUBLIC_IP}/api/v1/health${NC}"
  echo -e "  📑 Swagger Docs    : ${CYAN}http://${PUBLIC_IP}/swagger-ui.html${NC}"
  echo -e "  📊 Actuator Health : ${CYAN}http://${PUBLIC_IP}/actuator/health${NC}"
  echo -e "${GREEN}====================================================================${NC}"
  echo -e "Management Commands:"
  echo -e "  View Logs    : ${YELLOW}$DOCKER_COMPOSE_CMD logs -f${NC}"
  echo -e "  Check Status : ${YELLOW}$DOCKER_COMPOSE_CMD ps${NC}"
  echo -e "  Restart      : ${YELLOW}$DOCKER_COMPOSE_CMD restart${NC}"
  echo -e "  Stop         : ${YELLOW}$DOCKER_COMPOSE_CMD down${NC}"
else
  echo -e "${YELLOW}[WARNING] Frontend is still warming up. Inspect status with:${NC}"
  echo "  $DOCKER_COMPOSE_CMD ps"
  echo "  $DOCKER_COMPOSE_CMD logs -f"
fi
