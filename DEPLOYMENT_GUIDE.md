# CodeMap Deployment Guide - Vercel

This guide will help you deploy CodeMap to Vercel.

## Prerequisites

- GitHub account with your CodeMap repository
- Vercel account (free tier works)
- NVIDIA NIM API key or Google Gemini API key
- GitHub Personal Access Token

---

## Step 1: Push Your Code to GitHub

Make sure all your changes are committed and pushed:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## Step 2: Deploy Frontend to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. **Click "Add New Project"**
4. **Import your GitHub repository**: `mithileshofficial06/codemap`
5. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

6. **Add Environment Variables** (click "Environment Variables"):
   ```
   NVIDIA_API_KEY=your_nvidia_api_key_here
   NVIDIA_MODEL=meta/llama-3.1-70b-instruct
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
   
   OR if using Gemini:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```

7. **Click "Deploy"**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd apps/web
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? codemap
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add NVIDIA_API_KEY
vercel env add NVIDIA_MODEL
vercel env add NEXT_PUBLIC_API_URL

# Deploy to production
vercel --prod
```

---

## Step 3: Deploy Backend to Railway

The backend API needs to be deployed separately.

1. **Go to Railway**: https://railway.app
2. **Sign in** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**: `mithileshofficial06/codemap`
6. **Configure**:
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`

7. **Add Environment Variables**:
   ```
   GITHUB_TOKEN=your_github_token_here
   GEMINI_API_KEY=your_gemini_api_key_here
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   PORT=4000
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

8. **Deploy**
9. **Copy the Railway URL** (e.g., `https://codemap-api.railway.app`)

---

## Step 4: Update Frontend Environment Variables

Go back to Vercel and update the `NEXT_PUBLIC_API_URL`:

1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_API_URL` to your Railway backend URL
4. Click **Save**
5. **Redeploy** the frontend

---

## Step 5: Configure CORS (Backend)

The backend needs to allow requests from your Vercel domain.

Update `apps/api/src/index.ts` CORS configuration:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app',
    'https://your-vercel-app-*.vercel.app' // Preview deployments
  ],
  credentials: true
}));
```

Commit and push to trigger Railway redeploy.

---

## Environment Variables Summary

### Frontend (Vercel)
```bash
NVIDIA_API_KEY=nvapi-xxxxx
NVIDIA_MODEL=meta/llama-3.1-70b-instruct
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Backend (Railway)
```bash
GITHUB_TOKEN=github_pat_xxxxx
GEMINI_API_KEY=AIzaSyxxxxx (optional, for backend AI features)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
PORT=4000
FRONTEND_URL=https://your-app.vercel.app
```

---

## Troubleshooting

### Build Fails on Vercel

**Error**: `Property 'setFocusedNode' does not exist`
- **Fix**: Make sure you've pushed the latest code with focus mode removed

**Error**: `Module not found`
- **Fix**: Check that all dependencies are in `package.json`
- Run `npm install` locally to verify

### API Not Working

**Error**: CORS errors in browser console
- **Fix**: Update CORS configuration in backend to include your Vercel domain

**Error**: 500 errors from API
- **Fix**: Check Railway logs for errors
- Verify all environment variables are set

### Chat Not Loading

**Error**: "Something went wrong"
- **Fix**: Verify `NVIDIA_API_KEY` or `GEMINI_API_KEY` is set in Vercel
- Check browser console for errors

---

## Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Go to your Vercel project
2. Click **Settings** → **Domains**
3. Add your domain (e.g., `codemap.yourdomain.com`)
4. Follow DNS configuration instructions
5. Update `FRONTEND_URL` in Railway backend

---

## Monitoring

### Vercel Analytics
- Automatically enabled for all deployments
- View at: Project → Analytics

### Railway Logs
- View at: Project → Deployments → Logs
- Monitor API errors and performance

---

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Environment variables configured (both)
- [ ] CORS updated with Vercel domain
- [ ] Frontend redeployed with correct API URL
- [ ] Test the deployed app
- [ ] Check browser console for errors
- [ ] Verify chat works
- [ ] Verify graph visualization works

---

## Useful Commands

```bash
# Redeploy frontend
vercel --prod

# View Vercel logs
vercel logs

# View Railway logs
railway logs

# Test API endpoint
curl https://your-backend.railway.app/health

# Check environment variables
vercel env ls
```

---

## Cost Estimate

### Free Tier Limits

**Vercel (Free)**:
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Preview deployments

**Railway (Free Trial)**:
- $5 credit/month
- ~500 hours runtime
- Automatic HTTPS

**Upstash Redis (Free)**:
- 10,000 commands/day
- 256 MB storage

**NVIDIA NIM (Free)**:
- Check current limits at https://build.nvidia.com

---

## Next Steps

1. Set up custom domain
2. Configure analytics
3. Set up error monitoring (Sentry)
4. Add GitHub OAuth for private repos
5. Implement rate limiting
6. Add caching headers

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Railway deployment logs
3. Check browser console
4. Verify all environment variables
5. Test API endpoints directly

---

**Deployment Date**: 2026-05-21  
**Version**: 1.0.0
