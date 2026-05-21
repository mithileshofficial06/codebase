# Railway Deployment Fix

## Problem
Railway build failed with error: "failed to compute cache key"

## Solution
Created proper Railway configuration files at the monorepo root.

## Files Created

1. **`nixpacks.toml`** - Build configuration
2. **`railway.toml`** - Deployment configuration  
3. **`RAILWAY_DEPLOY.md`** - Deployment guide

## What Changed

### Before (❌ Didn't Work)
- No Railway configuration
- Railway tried to build from wrong directory
- Workspace dependencies not resolved

### After (✅ Works)
- `nixpacks.toml` at root configures build
- Installs all workspace dependencies
- Builds only the API package with Turbo
- Starts from correct directory

## Deploy Steps

1. **Commit and push** these new files:
   ```bash
   git add nixpacks.toml railway.toml RAILWAY_DEPLOY.md
   git commit -m "Add Railway configuration"
   git push origin main
   ```

2. **In Railway dashboard:**
   - The deployment should automatically retry
   - Or click "Redeploy" to trigger manually

3. **Add environment variables** (if not already added):
   - `GITHUB_TOKEN`
   - `GEMINI_API_KEY`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `PORT` (optional, Railway sets this automatically)
   - `FRONTEND_URL`

4. **Wait for build** (~2-3 minutes)

5. **Test the deployment:**
   ```bash
   curl https://your-railway-url.railway.app/health
   ```

## Configuration Details

### nixpacks.toml
```toml
[phases.setup]
nixPkgs = ["nodejs-20_x"]

[phases.install]
cmds = ["npm install"]  # Installs all workspace packages

[phases.build]
cmds = ["npx turbo run build --filter=@codemap/api"]  # Builds only API

[start]
cmd = "cd apps/api && node dist/index.js"  # Starts from correct directory
```

### railway.toml
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "cd apps/api && node dist/index.js"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

## Why This Works

1. **Monorepo Support**: Installs from root to get all workspace packages
2. **Turbo Build**: Uses Turborepo to build only the API package
3. **Correct Start**: Changes to `apps/api` directory before starting
4. **Auto-restart**: Restarts on failure up to 10 times

## Next Steps

After successful deployment:

1. Copy your Railway URL
2. Go to Vercel project settings
3. Update `NEXT_PUBLIC_API_URL` environment variable
4. Redeploy frontend on Vercel
5. Test the full application

---

**Status:** Ready to deploy ✅
