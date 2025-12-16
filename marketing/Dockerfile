# * Multi-stage build for Marketing SvelteKit app
FROM node:20-alpine AS base

# * Set working directory
WORKDIR /app

# * Install dependencies stage
FROM base AS deps
COPY package.json package-lock.json* ./
# * Use npm for dependency installation (Node.js build environment)
# * npm will work with package.json even if bun.lock exists
RUN if [ -f package-lock.json ]; then npm ci --ignore-scripts; \
    else npm install --ignore-scripts; fi

# * Build stage
FROM base AS builder
# * Build arguments for public environment variables
# * Set defaults if not provided (will be handled in code)
ARG PUBLIC_ALUMNAE_FORM="#"
ARG PUBLIC_FINSEC_NUMBER=""
ENV PUBLIC_ALUMNAE_FORM=${PUBLIC_ALUMNAE_FORM}
ENV PUBLIC_FINSEC_NUMBER=${PUBLIC_FINSEC_NUMBER}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# * Build the SvelteKit app
# * Note: This requires adapter-node for Docker deployment
RUN npm run build
# * Prune dev dependencies to reduce image size
RUN npm prune --production

# * Production stage
FROM base AS runner
WORKDIR /app

# * Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 sveltekit

# * Copy built application and production dependencies
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
# * adapter-node creates build/index.js as the server entry point
# * With "type": "module" in package.json, we need to specify the .js extension
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production
CMD ["node", "build/index.js"]

