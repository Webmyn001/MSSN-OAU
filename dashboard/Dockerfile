# * Multi-stage build for Dashboard SvelteKit app
FROM node:20-alpine AS base

# * Set working directory
WORKDIR /app

# * Install dependencies stage
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# * Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# * Production stage
FROM base AS runner
WORKDIR /app

# * Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 sveltekit

# * Copy built application
COPY --from=builder --chown=sveltekit:nodejs /app/build ./build
COPY --from=builder --chown=sveltekit:nodejs /app/package.json ./package.json
COPY --from=builder --chown=sveltekit:nodejs /app/node_modules ./node_modules

# * Switch to non-root user
USER sveltekit

# * Expose port
EXPOSE 3000

# * Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# * Start server
# * adapter-node serves on port 3000 by default
ENV PORT=3000
ENV HOST=0.0.0.0
CMD ["node", "build"]

