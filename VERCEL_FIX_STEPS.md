# 🚀 VERCEL DEPLOYMENT - MANUAL STEPS REQUIRED

## Critical: Fix API URL on Vercel Dashboard

The frontend is still using the wrong API URL. You must manually update this on Vercel.

### Steps:

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Select your project**
   - Click "aetheris" or your frontend project name

3. **Go to Settings**
   - Click "Settings" tab in the top menu

4. **Find Environment Variables**
   - In left sidebar, click "Environment Variables"

5. **Update NEXT_PUBLIC_API_URL**
   - Look for `NEXT_PUBLIC_API_URL` variable
   - **Change from:** `https://aetheris-mjvx.onrender.com`
   - **Change to:** `https://aetheris-mjvx.onrender.com/api`
   - Click "Save"

6. **Redeploy**
   - Go back to "Deployments" tab
   - Find the most recent deployment
   - Click the "..." menu next to it
   - Click "Redeploy" (NOT "Promote to Production")
   - Wait for deployment to finish

### Verification:

After redeployment, the browser console should show:
```
Signin API URL: https://aetheris-mjvx.onrender.com/api/auth/signin
```

---

## Backend Changes Made (Already Pushed to Git):

1. ✅ Created `backend/build.sh` - Explicit build script
2. ✅ Updated `render.yaml` - Uses build.sh and sets NODE_ENV=production
3. ✅ All TypeScript packages already in devDependencies

### What happens next:

- Render will download the new render.yaml
- It will run the build.sh script (npm install + npm run build)
- Backend will start in production mode with proper TypeScript compilation
- Next.js will generate optimized production build

---

## Why These Changes Matter:

| Issue | Was Happening | Now Fixed |
|-------|---|---|
| Build incomplete | Only `npm install` ran | Full `build.sh` runs with both install and build |
| Dev mode on production | Backend used Turbopack dev server | Backend uses optimized production server |
| TypeScript compilation on startup | Failed at runtime | Compiled during build phase |
| Missing /api in URL | Frontend called wrong endpoints | Environment variable now includes /api |

---

## Quick Checklist:

- [ ] Update `NEXT_PUBLIC_API_URL` on Vercel to include `/api`
- [ ] Redeploy frontend on Vercel
- [ ] Verify in browser console that API URL shows `/api`
- [ ] Test sign-in/sign-up on production
- [ ] Check that it works within seconds (not timing out)

