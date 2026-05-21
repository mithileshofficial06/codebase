# Railway Deployment Guide for CodeMap API (Monorepo)

## ⚠️ CRITICAL: Monorepo Configuration

CodeMap is a **Turborepo monorepo** with workspace packages. Railway MUST deploy from the **ROOT**, not from `apps/api`.

### Why?
- `apps/api` depends on `@codemap/shared` (local workspace package)
- Railway needs access to the entire monorepo to resolve workspace dependencies
- Building from `apps/api` alone will fail with: `404 '@codemap/shared@*' is not in this registry`

---

## Quick Deploy Steps

### Step 1: Configure Railway Project

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `mithileshofficial06/codemap`

### Step 2: Configure Settings (CRITICAL)

In Railway project settings:

**Root Directory:** **LEAVE EMPTY** ⚠️ (Must be monorepo root, NOT `apps/api`)  
**Build Command:** Auto-detected from `nixpacks.toml`  
**Start Command:** Auto-detected from `railway.toml`

### Step 3: Verify Configuration Files

Railway will use these files from your repository:

**`nixpacks.toml`** (at root):
```toml
[phases.setup]
nixPkgs = ["nodejs-20_x"]

[phases.install]
cmds = ["npm install"]  # Installs ALL workspace packages

[phases.build]
cmds = ["npx turbo run build --filter=@codemap/api"]  # Builds only API

[start]
cmd = "node apps/api/dist/index.js"  # Starts from root
```

**`railway.toml`** (at root):
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node apps/api/dist/index.js"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Step 4: Add Environment Variables

Click **"Variables"** and add:

```bash
GITHUB_TOKEN=your_github_personal_access_token_here
GEMINI_API_KEY=your_gemini_api_key_here
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here
PORT=4000
FRONTEND_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Railway will provide a URL like: `https://codemap-api-production.up.railway.app`

### Step 6: Update Frontend

Go to Vercel and update the environment variable:

```bash
NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app
```

Then redeploy the frontend.

---

## Troubleshooting

### Error: "404 '@codemap/shared@*' is not in this registry"

**Cause:** Railway Root Directory is set to `apps/api` instead of empty (monorepo root)

**Fix:** 
1. Go to Railway project settings
2. Find "Root Directory"
3. **DELETE** the value (leave it empty)
4. Redeploy

### Error: "Cannot find module '@codemap/shared'"

**Cause:** Workspace dependencies not installed correctly

**Fix:** Ensure `nixpacks.toml` runs `npm install` from root (not from `apps/api`)

### Error: "Cannot find module './dist/index.js'"

**Cause:** Start command is looking in wrong directory

**Fix:** Start command should be `node apps/api/dist/index.js` (from root), not `cd apps/api && node dist/index.js`

### Error: "turbo: command not found"

**Cause:** Turbo not installed

**Fix:** Ensure root `package.json` has turbo in devDependencies and `npm install` runs from root

---

## Verify Deployment

Test your API:

```bash
# Health check
curl https://your-railway-url.railway.app/health

# Should return: {"status":"ok"}
```

---

## How Monorepo Deployment Works

```
1. Railway clones entire repository
   ↓
2. Runs from ROOT (not apps/api)
   ↓
3. npm install (installs all workspace packages)
   ├── apps/api/node_modules
   ├── apps/web/node_modules
   └── packages/shared (resolved as workspace)
   ↓
4. npx turbo run build --filter=@codemap/api
   ├── Builds @codemap/shared first (dependency)
   └── Builds @codemap/api
   ↓
5. node apps/api/dist/index.js
   └── Starts Express server
```

---

## Manual Configuration (If Auto-Detection Fails)

If Railway doesn't detect the configuration:

1. **Root Directory:** Leave empty (monorepo root)
2. **Build Command:** `npm install && npx turbo run build --filter=@codemap/api`
3. **Start Command:** `node apps/api/dist/index.js`
4. **Watch Paths:** `apps/api/**`, `packages/shared/**`

---

## Cost Estimate

**Railway Free Trial:**
- $5 credit/month
- ~500 hours runtime
- Automatic HTTPS
- Custom domains

**After Free Trial:**
- ~$5-10/month for small API
- Pay-as-you-go pricing

---

## Workspace Structure

```
codemap/                          ← Railway deploys from HERE
├── package.json                  ← Workspace configuration
├── nixpacks.toml                 ← Build configuration
├── railway.toml                  ← Deploy configuration
├── turbo.json                    ← Turborepo config
├── apps/
│   └── api/                      ← Backend code
│       ├── package.json          ← Depends on @codemap/shared
│       ├── src/
│       └── dist/                 ← Build output
└── packages/
    └── shared/                   ← Workspace package
        ├── package.json          ← name: "@codemap/shared"
        └── types/
```

---

## Next Steps

1. ✅ Ensure Root Directory is EMPTY in Railway
2. ✅ Deploy from monorepo root
3. ✅ Verify workspace packages resolve
4. ✅ Copy Railway URL
5. ✅ Update Vercel environment variable
6. ✅ Test full application

---

**Last Updated:** May 21, 2026  
**Monorepo:** Turborepo + npm workspaces
