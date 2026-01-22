# Docker Patterns

Best practices for containerization, multi-stage builds, and container orchestration.

---

## Dockerfile Best Practices

### Multi-Stage Builds
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Runner (minimal production image)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy only necessary files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

USER appuser
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Layer Optimization
```dockerfile
# Bad: Cache invalidated on any file change
COPY . .
RUN npm install

# Good: Dependencies cached unless package.json changes
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

### Security Hardening
```dockerfile
FROM node:20-alpine

# Don't run as root
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Remove unnecessary packages
RUN apk --no-cache add dumb-init && \
    rm -rf /var/cache/apk/*

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Set proper permissions
WORKDIR /app
COPY --chown=appuser:appgroup . .

USER appuser
CMD ["node", "index.js"]
```

### .dockerignore
```
# Dependencies
node_modules
npm-debug.log

# Build outputs
dist
build
.next

# Development files
.git
.gitignore
*.md
Dockerfile*
docker-compose*

# Environment files
.env*
!.env.example

# Test files
tests
__tests__
*.test.ts
coverage

# IDE/Editor
.vscode
.idea
*.swp
```

---

## Common Patterns

### Node.js Application
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

### Python Application
```dockerfile
FROM python:3.11-slim AS base

# Build stage
FROM base AS builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM base AS runner
WORKDIR /app

# Copy virtual environment
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Create non-root user
RUN useradd --create-home appuser
USER appuser

COPY --chown=appuser:appuser . .

EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
```

### Go Application
```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server

# Production stage (distroless for minimal attack surface)
FROM gcr.io/distroless/static-debian11
COPY --from=builder /app/server /
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/server"]
```

---

## Docker Compose

### Development Setup
```yaml
# docker-compose.yml
version: "3.9"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
      - /app/node_modules  # Preserve node_modules from container
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgres://user:pass@db:5432/myapp
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=myapp
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Production Setup
```yaml
# docker-compose.prod.yml
version: "3.9"

services:
  app:
    image: myapp:${VERSION:-latest}
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 256M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Override Files
```yaml
# docker-compose.override.yml (for local development)
version: "3.9"

services:
  app:
    build:
      context: .
      target: development
    volumes:
      - .:/app:delegated
    command: npm run dev
```

---

## Health Checks

### Application Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
```

### Health Endpoint
```typescript
// Express health endpoint
app.get('/health', async (req, res) => {
  const healthcheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
    },
  };

  const isHealthy = Object.values(healthcheck.checks)
    .every(check => check.status === 'ok');

  res.status(isHealthy ? 200 : 503).json(healthcheck);
});

async function checkDatabase() {
  try {
    await db.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}
```

---

## Image Optimization

### Reducing Image Size
```dockerfile
# Use specific slim/alpine versions
FROM node:20-alpine  # ~180MB vs ~1GB for full
FROM python:3.11-slim  # ~150MB vs ~1GB for full

# Remove unnecessary files after installation
RUN apt-get update && apt-get install -y \
    package1 \
    package2 \
    && rm -rf /var/lib/apt/lists/*

# Clean npm cache
RUN npm ci --only=production && npm cache clean --force

# Use multi-stage builds to exclude build tools
```

### Size Comparison
| Base Image | Size |
|------------|------|
| node:20 | ~1GB |
| node:20-slim | ~250MB |
| node:20-alpine | ~180MB |
| distroless/nodejs20 | ~130MB |

---

## Container Networking

### Bridge Network (Default)
```yaml
services:
  app:
    networks:
      - app-network

  db:
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### External Network
```yaml
networks:
  shared-network:
    external: true

services:
  app:
    networks:
      - shared-network
```

### Network Aliases
```yaml
services:
  primary-db:
    image: postgres:15
    networks:
      app-network:
        aliases:
          - database
          - postgres
```

---

## Volume Management

### Named Volumes
```yaml
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

services:
  db:
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### Bind Mounts (Development)
```yaml
services:
  app:
    volumes:
      # Source code (for hot reload)
      - ./src:/app/src:delegated
      # Exclude node_modules
      - /app/node_modules
```

### tmpfs (In-Memory)
```yaml
services:
  app:
    tmpfs:
      - /tmp
      - /app/cache
```

---

## Security Best Practices

### Run as Non-Root
```dockerfile
# Create user during build
RUN addgroup --system --gid 1001 appgroup \
    && adduser --system --uid 1001 --ingroup appgroup appuser

# Switch to non-root user
USER appuser
```

### Read-Only Filesystem
```yaml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /app/logs
```

### Capabilities
```yaml
services:
  app:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # Only if needed
```

### Security Scanning
```bash
# Scan image for vulnerabilities
docker scout cves myapp:latest

# Scan with Trivy
trivy image myapp:latest

# Scan during build
docker build --secret id=npm,src=$HOME/.npmrc .
```

---

## CI/CD Integration

### GitHub Actions Build
```yaml
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: |
      ghcr.io/${{ github.repository }}:${{ github.sha }}
      ghcr.io/${{ github.repository }}:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Build Cache
```dockerfile
# Use BuildKit cache mounts
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt
```

---

## Debugging

### Interactive Shell
```bash
# Run shell in running container
docker exec -it container_name sh

# Run shell in new container
docker run -it --rm myimage sh
```

### View Logs
```bash
# Follow logs
docker logs -f container_name

# Last 100 lines
docker logs --tail 100 container_name

# With timestamps
docker logs -t container_name
```

### Inspect
```bash
# Container details
docker inspect container_name

# Image layers
docker history myimage

# Network
docker network inspect bridge
```

---

## Resources

- Docker Best Practices: https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
- Dockerfile Reference: https://docs.docker.com/engine/reference/builder/
- Docker Compose: https://docs.docker.com/compose/
- Distroless Images: https://github.com/GoogleContainerTools/distroless
