# -------------------------------------------------------------
# TalentFlow 360 - Frontend Production Multi-Stage Dockerfile
# Node 20 Alpine + Nginx Alpine
# -------------------------------------------------------------

# Stage 1: Build the React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications first for optimal layer caching
COPY package*.json ./

# Install project dependencies
RUN npm ci --silent || npm install --silent

# Copy frontend source code
COPY . .

# Build production bundle with Vite
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Serve with High-Performance Nginx
# -------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

# Remove default Nginx welcome configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled SPA production assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
