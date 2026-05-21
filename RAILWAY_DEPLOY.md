# Railway Deployment Guide for CodeMap API

## Quick Deploy Steps

### Step 1: Configure Railway Project

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `mithileshofficial06/codemap`
5. Railway will detect the configuration automatically

### Step 2: Configure Settings

In Railway project settings:

**Root Directory:** Leave empty (use monorepo root)  
**Build Command:** Auto-detected from `nixpacks.toml`  
**Start Command:** Auto-detected from `nixpacks.toml`

### Step 3: Add Environment Variables

Click **"Variables"** and add:

```bash
GITHUB_TOKEN=your_github_personal_access_token_here
GEMINI_API_KEY=your_gemini_api_key_here
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here
PORT=4000
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Railway will provide a URL like: `https://codemap-api-production.up.railway.app`

### Step 5: Update Frontend

Go to Vercel and update the environment variable:

```bash
NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app
```

Then redeploy the frontend.

---

## Troubleshooting

### Error: "failed to compute cache key"

**Cause:** Railway can't find the build configuration

**Fix:** Make sure `nixpacks.toml` and `railway.toml` are in the repository root

### Error: "Cannot find module '@codemap/shared'"

**Cause:** Workspace dependencies not installed

**Fix:** The `nixpacks.toml` should install from root with `npm install`

### Error: "Port already in use"

**Cause:** Railway assigns a dynamic port

**Fix:** Make sure your code uses `process.env.PORT`:
```typescript
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Error: "CORS policy"

**Cause:** Frontend URL not in CORS whitelist

**Fix:** Update `apps/api/src/index.ts`:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true
}));
```

---

## Verify Deployment

Test your API:

```bash
# Health check
curl https://your-railway-url.railway.app/health

# Should return: {"status":"ok"}
```

---

## Railway Configuration Files

### `nixpacks.toml` (Root)
```toml
[phases.setup]
nixPkgs = ["nodejs-20_x"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npx turbo run build --filter=@codemap/api"]

[start]
cmd = "cd apps/api && node dist/index.js"
```

### `railway.toml` (Root)
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "cd apps/api && node dist/index.js"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

---

## Alternative: Manual Configuration

If auto-detection doesn't work:

1. **Root Directory:** `/` (monorepo root)
2. **Build Command:** `npm install && npx turbo run build --filter=@codemap/api`
3. **Start Command:** `cd apps/api && node dist/index.js`
4. **Watch Paths:** `apps/api/**`

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
- No credit card required for trial

---

## Next Steps

1. ✅ Deploy API to Railway
2. ✅ Copy Railway URL
3. ✅ Update Vercel environment variable
4. ✅ Redeploy frontend
5. ✅ Test full application

---

**Last Updated:** May 21, 2026
