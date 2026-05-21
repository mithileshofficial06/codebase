# Quick Deploy to Vercel - 5 Minutes

## Step 1: Push to GitHub (if not already done)

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository: `mithileshofficial06/codemap`
3. Configure:
   - **Root Directory**: Leave empty (monorepo detected automatically)
   - **Framework**: Next.js
   - Click **"Environment Variables"**
   
4. Add these environment variables:
   ```
   NVIDIA_API_KEY = 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
   NVIDIA_MODEL = meta/llama-3.1-70b-instruct
   ```

5. Click **"Deploy"**

## Step 3: Wait for Build

- Build takes ~2-3 minutes
- Vercel will show build logs
- Once complete, you'll get a URL like: `https://codemap-xxx.vercel.app`

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Enter a GitHub repository URL
3. Click "Analyze"
4. Verify the graph loads
5. Test the AI chat

## That's it! 🎉

Your CodeMap is now live on Vercel.

---

## Important Notes

### Backend API

The current deployment only includes the **frontend**. For full functionality, you need to deploy the backend API separately to Railway or another platform.

**Without backend**: 
- ❌ Repository analysis won't work
- ❌ GitHub API integration disabled
- ✅ AI chat works (uses frontend API routes)
- ✅ UI/UX works

**With backend** (recommended):
- ✅ Full repository analysis
- ✅ GitHub API integration
- ✅ Redis caching
- ✅ SSE progress updates

### Deploy Backend (Optional but Recommended)

See `DEPLOYMENT_GUIDE.md` for full backend deployment instructions.

Quick backend deploy to Railway:
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select `codemap` repo
4. Set root directory: `apps/api`
5. Add environment variables (see DEPLOYMENT_GUIDE.md)
6. Deploy
7. Copy Railway URL and add to Vercel as `NEXT_PUBLIC_API_URL`

---

## Troubleshooting

**Build fails**: Check Vercel build logs for errors
**Chat not working**: Verify `NVIDIA_API_KEY` is set
**Graph not loading**: Deploy backend API first

---

## Next Steps

- [ ] Deploy backend to Railway
- [ ] Add custom domain
- [ ] Set up monitoring
- [ ] Configure analytics
