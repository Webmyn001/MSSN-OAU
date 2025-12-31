# Docker Production Debugging Guide

## Current Issue
- ✅ Works locally with Docker
- ❌ Doesn't work in production Docker
- ❌ Doesn't work on Vercel

## What to Check

### 1. Build Logs
Check the Docker build logs for:
- Adapter switching success message
- Build errors
- Missing files

### 2. Runtime Logs
When the container starts, check:
```bash
docker logs <container-id>
```

Look for:
- "Starting server..." message
- Build contents listing
- Any error messages

### 3. Environment Variables
Ensure these are set during build:
- `PUBLIC_ALUMNAE_FORM`
- `PUBLIC_FINSEC_NUMBER`

### 4. Build Output Verification
The Dockerfile now verifies:
- `build/index.js` exists
- `build/client/` directory exists
- Adapter was switched correctly

### 5. Common Issues

#### Issue: Components not showing
**Possible causes:**
- Static assets not being served (check `build/client/`)
- JavaScript not loading (check browser console)
- CSP blocking scripts (check browser console for CSP errors)
- Environment variables missing at build time

#### Issue: 404 errors
**Possible causes:**
- Static files not copied
- Incorrect adapter configuration
- Missing routes

#### Issue: Build fails
**Check:**
- Adapter switching logs
- Build error messages
- Missing dependencies

## Debugging Commands

### Test the Docker build locally:
```bash
cd marketing
docker build \
  --build-arg PUBLIC_ALUMNAE_FORM="https://mssnoau.org" \
  --build-arg PUBLIC_FINSEC_NUMBER="+2348146851394" \
  -t mssnoau-marketing:debug .
```

### Run and check logs:
```bash
docker run -p 3000:3000 mssnoau-marketing:debug
# In another terminal:
docker logs <container-id>
```

### Check build contents:
```bash
docker run --rm --entrypoint sh mssnoau-marketing:debug -c "ls -la build/"
```

### Check adapter was switched:
```bash
docker run --rm --entrypoint sh mssnoau-marketing:debug -c "cat svelte.config.js | grep adapter"
```

## For Vercel

Vercel should use `adapter-vercel` (not adapter-node). Check:
1. Vercel build logs
2. Environment variables in Vercel dashboard
3. Vercel-specific configuration in `vercel.json`

## Next Steps

1. **Get the actual error message** from production logs
2. **Check browser console** for JavaScript errors
3. **Verify environment variables** are set correctly
4. **Compare build output** between local and production


