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
RUN echo "=== Switching adapter from vercel to node ===" && \
    echo "Original config (first 10 lines):" && \
    head -10 svelte.config.js && \
    # Replace the import statement
    sed -i "s|import adapter from '@sveltejs/adapter-vercel';|import adapter from '@sveltejs/adapter-node';|g" svelte.config.js && \
    # Replace the adapter configuration using Node.js for multiline matching
    node -e "const fs=require('fs'); const c=fs.readFileSync('svelte.config.js','utf8'); const r=c.replace(/adapter: adapter\(\s*\{[\s\S]*?\}\s*\),?/m, 'adapter: adapter(),'); fs.writeFileSync('svelte.config.js', r);" && \
    echo "=== Verification ===" && \
    echo "Updated config (first 15 lines):" && \
    head -15 svelte.config.js && \
    grep -q "adapter-node" svelte.config.js || (echo "ERROR: adapter-node not found in config!" && cat svelte.config.js && exit 1) && \
    grep -q "adapter: adapter()" svelte.config.js || (echo "ERROR: adapter config not simplified!" && cat svelte.config.js && exit 1) && \
    echo "✓ Successfully switched to adapter-node"

# * Verify adapter-node is installed
RUN npm list @sveltejs/adapter-node 2>/dev/null || (echo "ERROR: adapter-node not installed!" && npm list | grep adapter && exit 1)

# * Build the SvelteKit app with verbose output
# * adapter-node creates build/index.js, build/client/, and build/server/
RUN npm run build 2>&1 | tee build.log || (echo "BUILD FAILED!" && cat build.log && exit 1)

# * Verify build output exists
RUN test -f build/index.js || (echo "ERROR: build/index.js not found!" && ls -la build/ && exit 1)
RUN test -d build/client || (echo "ERROR: build/client directory not found!" && ls -la build/ && exit 1)

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

# * Debug: List build contents before starting
RUN echo "=== Build contents ===" && \
    ls -la build/ && \
    echo "=== Build/index.js exists ===" && \
    test -f build/index.js && echo "✓ build/index.js found" || echo "✗ build/index.js MISSING!" && \
    echo "=== Build/client exists ===" && \
    test -d build/client && echo "✓ build/client found" || echo "✗ build/client MISSING!" && \
    echo "=== Node modules ===" && \
    ls node_modules | head -10

# * Start the server with error handling
# * adapter-node creates build/index.js as the entry point
# * "node build" is equivalent to "node build/index.js"
CMD ["sh", "-c", "echo 'Starting server...' && node build"]

