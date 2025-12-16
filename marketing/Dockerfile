# * Multi-stage build for Marketing SvelteKit app
# * Based on: https://gist.github.com/aradalvand/04b2cad14b00e5ffe8ec96a3afbb34fb
FROM node:20-alpine AS builder

WORKDIR /app

# * Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# * Install all dependencies (including dev dependencies needed for build)
RUN if [ -f package-lock.json ]; then npm ci --ignore-scripts; \
    else npm install --ignore-scripts; fi

# * Build arguments for public environment variables
ARG PUBLIC_ALUMNAE_FORM="#"
ARG PUBLIC_FINSEC_NUMBER=""
ENV PUBLIC_ALUMNAE_FORM=${PUBLIC_ALUMNAE_FORM}
ENV PUBLIC_FINSEC_NUMBER=${PUBLIC_FINSEC_NUMBER}

# * Copy source files
COPY . .

# * Switch to adapter-node for Docker builds
# * adapter-vercel won't work in Docker, we need adapter-node
RUN node -e "\
const fs = require('fs'); \
const config = fs.readFileSync('svelte.config.js', 'utf8'); \
const updated = config \
  .replace(/@sveltejs\/adapter-vercel/g, '@sveltejs/adapter-node') \
  .replace(/adapter: adapter\({[\s\S]*?runtime:[^}]*?[\s\S]*?}\),/g, 'adapter: adapter(),'); \
fs.writeFileSync('svelte.config.js', updated); \
"

# * Build the SvelteKit app
# * adapter-node creates build/index.js, build/client/, and build/server/
RUN npm run build

# * Remove dev dependencies (now using --omit=dev instead of deprecated --production)
RUN npm prune --omit=dev

# * Production stage
FROM node:20-alpine

WORKDIR /app

# * Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 sveltekit

# * Copy only what's needed to run the application
# * According to adapter-node docs: need build/, node_modules/, and package.json
COPY --from=builder --chown=sveltekit:nodejs /app/build ./build
COPY --from=builder --chown=sveltekit:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=sveltekit:nodejs /app/package.json ./package.json

# * Switch to non-root user
USER sveltekit

# * Expose port (adapter-node defaults to 3000)
EXPOSE 3000

# * Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# * Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# * Start the server
# * adapter-node creates build/index.js as the entry point
# * "node build" is equivalent to "node build/index.js"
CMD ["node", "build"]

