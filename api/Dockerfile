# * Multi-stage build for API service
FROM oven/bun:1 AS base

# * Set working directory
WORKDIR /app

# * Install dependencies stage
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# * Build stage (if needed)
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# * No build step needed for Hono, but keeping stage for consistency

# * Production stage
FROM base AS runner
WORKDIR /app

# * Create non-root user
RUN addgroup --system --gid 1001 bunuser && \
    adduser --system --uid 1001 bunuser

# * Copy dependencies and source
COPY --from=deps --chown=bunuser:bunuser /app/node_modules ./node_modules
COPY --chown=bunuser:bunuser . .

# * Switch to non-root user
USER bunuser

# * Expose port
EXPOSE 3000

# * Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD bun run --bun -e "fetch('http://localhost:3000').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# * Start server
# * Bun will execute the server code in index.ts
CMD ["bun", "run", "src/index.ts"]

