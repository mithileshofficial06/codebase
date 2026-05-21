# Railway Monorepo Deployment - Critical Fix

## Problem
Railway deployment failing with:
```
npm ERR! 404 '@codemap/shared@*' is not in this registry
```

## Root Cause
Railway was trying to deploy from `apps/api` subdirectory instead of monorepo root, causing workspace package resolution to fail.

## Solution Applied

### ✅ 1. Updated `nixpacks.toml`
```toml
[start]
cmd = "node apps/api/dist/index.js"  # Changed from: cd apps/api && node dist/index.js
```
**Why:** Start command must run from monorepo root to access workspace packages

### ✅ 2. Updated `railway.toml`
```toml
[deploy]
startCommand = "node apps/api/dist/index.js"  # Changed from: cd apps/api && node dist/index.js
```
**Why:** Consistent with nixpacks configuration

### ✅ 3. Updated `RAILWAY_DEPLOY.md`
- Added monorepo-specific instructions
- Emphasized ROOT directory must be EMPTY
- Added troubleshooting for workspace errors
- Explained how monorepo deployment works

## Railway Configuration Checklist

### ⚠️ CRITICAL: Root Directory
- [ ] Go to Railway project settings
- [ ] Find "Root Directory" field
- [ ] **ENSURE IT IS EMPTY** (not `apps/api`)
- [ ] If it has a value, DELETE it
- [ ] Save and redeploy

### Build Configuration
- [x] `nixpacks.toml` at repository root
- [x] `railway.toml` at repository root
- [x] Install command: `npm install` (from root)
- [x] Build command: `npx turbo run build --filter=@codemap/api`
- [x] Start command: `node apps/api/dist/index.js` (from root)

### Workspace Structure
- [x] Root `package.json` has workspaces configured
- [x] `packages/shared/package.json` exists with name `@codemap/shared`
- [x] `apps/api/package.json` depends on `@codemap/shared: "*"`
- [x] TypeScript outputs to `apps/api/dist/`

### Environment Variables
- [ ] `GITHUB_TOKEN` - Set in Railway
- [ ] `GEMINI_API_KEY` - Set in Railway
- [ ] `UPSTASH_REDIS_REST_URL` - Set in Railway
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Set in Railway
- [ ] `PORT` - Optional (Railway sets automatically)
- [ ] `FRONTEND_URL` - Set to Vercel URL
- [ ] `NODE_ENV=production` - Set in Railway

## Deployment Flow

```
┌─────────────────────────────────────────┐
│ Railway clones repository               │
│ Working directory: /app (monorepo root) │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Phase: Install                          │
│ Command: npm install                    │
│ Result: All workspace packages resolved │
│   ├── apps/api/node_modules             │
│   ├── apps/web/node_modules             │
│   └── packages/shared (workspace link)  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Phase: Build                            │
│ Command: npx turbo run build            │
│         --filter=@codemap/api           │
│ Result:                                 │
│   1. Builds @codemap/shared first       │
│   2. Builds @codemap/api                │
│   3. Output: apps/api/dist/index.js     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Phase: Start                            │
│ Command: node apps/api/dist/index.js    │
│ Working dir: /app (still at root)       │
│ Result: Express server starts on $PORT  │
└─────────────────────────────────────────┘
```

## Testing Locally

Before deploying to Railway, test the build process locally:

```bash
# From monorepo root
cd /path/to/codemap

# Clean install
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install

# Build API only
npx turbo run build --filter=@codemap/api

# Verify output exists
ls -la apps/api/dist/index.js

# Test start command
node apps/api/dist/index.js

# Should see: 🚀 CodeMap API running on http://localhost:4000
```

## Common Errors & Fixes

### Error: `404 '@codemap/shared@*' is not in this registry`
**Fix:** Root Directory in Railway must be EMPTY (monorepo root)

### Error: `Cannot find module '@codemap/shared'`
**Fix:** Ensure `npm install` runs from root, not from `apps/api`

### Error: `Cannot find module './dist/index.js'`
**Fix:** Start command should be `node apps/api/dist/index.js` (from root)

### Error: `turbo: command not found`
**Fix:** Ensure turbo is in root `package.json` devDependencies

### Error: `ENOENT: no such file or directory, open 'apps/api/dist/index.js'`
**Fix:** Build command didn't run or failed. Check build logs.

## Verification Steps

After deployment:

1. **Check Railway Logs**
   - Look for: "🚀 CodeMap API running on..."
   - No workspace resolution errors
   - No module not found errors

2. **Test Health Endpoint**
   ```bash
   curl https://your-railway-url.railway.app/health
   # Should return: {"status":"ok"}
   ```

3. **Test from Frontend**
   - Update Vercel `NEXT_PUBLIC_API_URL`
   - Redeploy frontend
   - Try analyzing a repository

## Next Steps

1. Commit and push these changes:
   ```bash
   git add nixpacks.toml railway.toml RAILWAY_DEPLOY.md RAILWAY_MONOREPO_FIX.md
   git commit -m "Fix Railway monorepo deployment configuration"
   git push origin main
   ```

2. In Railway:
   - Verify Root Directory is EMPTY
   - Trigger redeploy
   - Monitor build logs

3. After successful deployment:
   - Copy Railway URL
   - Update Vercel environment variable
   - Test full application

---

**Status:** Configuration fixed, ready to deploy ✅  
**Last Updated:** May 21, 2026
