# 🚨 RENDER DEPLOYMENT - CRITICAL FIX GUIDE

## Problem: Backend Crashing with TypeScript Errors

**Current Error on Render:**
```
Unhandled Rejection: Error: It looks like you're trying to use TypeScript 
but do not have the required package(s) installed.
```

**Browser Error:**
```
Failed to load resource: net::ERR_CONNECTION_CLOSED
Signin API URL: https://aetheris-mjvx.onrender.com/api/auth/signin
```

**Why:** Backend build is failing or using dev mode instead of production build.

---

## ✅ ALL FIXES APPLIED TO REPOSITORY

### **1. Fixed Frontend env.example**
```
NEXT_PUBLIC_API_URL="https://aetheris-mjvx.onrender.com/api"
```
✓ Now includes `/api` as required

### **2. Fixed Backend build.sh**
- Added explicit `NODE_ENV=production` during build
- Added error checking to detect build failures
- Ensures full npm install (with devDependencies for TypeScript compilation)

### **3. Fixed Backend package.json**
```json
"start": "next start -p 3001"
```
✓ Removed hardcoded NODE_ENV (let Render set it)
✓ Simplified to use PORT variable

### **4. Updated render.yaml**
```yaml
buildCommand: bash build.sh      # Uses our build script
startCommand: npm start          # Uses production build
NODE_ENV: production             # Explicit production mode
NODE_OPTIONS: --max-old-space-size=512  # More memory
```

---

## 🚀 CRITICAL: Manual Steps on Render Dashboard

Render caches old configurations. You MUST do this:

### **Step 1: Force Redeploy**
1. Go to https://dashboard.render.com
2. Select **aetheris-backend** service
3. Click **"Settings"** tab
4. Click **"Clear build cache"** (if available)
5. Scroll down and click **"Manual Deplo"**
6. Click **"Deploy latest commit"**

### **Step 2: Monitor Build Logs**
After deployment starts, watch for:

✅ **Good Signs:**
```
==> Running build command 'bash build.sh'...
==> Installing all dependencies...
==> Running Next.js build with NODE_ENV=production...
✓ Build completed successfully!
==> Starting service...
✓ Ready in X.XXs
Your service is live 🎉
```

❌ **Bad Signs (if you see these, stop and check logs):**
```
Unhandled Rejection: Error: TypeScript...
Slow filesystem detected...
○ Compiling middleware...
next dev -p 3001  ← Still running dev mode!
```

### **Step 3: If Build Still Fails**
1. Click on **"Logs"** tab
2. Scroll to see full error message
3. Common fixes:
   - Clear browser cache (Cmd+Shift+Delete)
   - Hard refresh Render dashboard
   - Wait 5 minutes and try deploying again
   - Check if all environment variables are set (DATABASE_URL especially)

---

## 🔍 Verification Checklist

After successful deployment, verify:

- [ ] **Render logs show:** `Your service is live 🎉`
- [ ] **Render logs do NOT show:** TypeScript errors or dev mode
- [ ] **Render logs show:** `next start` (not `next dev`)
- [ ] **Frontend console shows:** `Signin API URL: https://aetheris-mjvx.onrender.com/api/auth/signin`
- [ ] **Try signing in:** Should work within 5 seconds
- [ ] **Check Network tab:** API request to `/api/auth/signin` should return 200/401 (not 404)

---

## 📋 Environment Variables Required on Render

All these MUST be set in Render dashboard (Settings → Environment):

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | ✓ Already set in render.yaml |
| `PORT` | `3001` | ✓ Already set in render.yaml |
| `NODE_OPTIONS` | `--max-old-space-size=512` | ✓ Already set in render.yaml |
| `DATABASE_URL` | Your Neon connection | ⚠️ **REQUIRED** - Get from Neon dashboard |
| `NEXTAUTH_SECRET` | Auto-generated | ✓ Already set in render.yaml |
| `NEXTAUTH_URL` | `https://aetheris-mjvx.onrender.com` | ✓ Already set in render.yaml |
| `FRONTEND_URL` | `https://aetheris-blue.vercel.app` | ✓ Already set in render.yaml |
| `CORS_ORIGIN` | `https://aetheris-blue.vercel.app` | ✓ Already set in render.yaml |

**⚠️ MOST CRITICAL:** Check that `DATABASE_URL` is set correctly!

---

## 🎯 Complete Deployment Flow

```
1. Files Updated in Repository
   ├── frontend/env.example (updated API URL)
   ├── backend/build.sh (fixed build process)
   ├── backend/package.json (cleaned up start script)
   └── render.yaml (confirmed configuration)

2. You Push to GitHub
   └── git push origin main

3. Render Auto-Detects Change
   ├── Downloads new render.yaml
   ├── Runs: bash build.sh
   │   ├── npm install (gets TypeScript)
   │   └── NODE_ENV=production npm run build
   └── Runs: npm start (production server)

4. Backend Starts Successfully
   ├── Listening on port 3001
   ├── Ready to accept API calls
   └── Logs show: "Your service is live 🎉"

5. Frontend Connects
   ├── Calls: https://aetheris-mjvx.onrender.com/api/auth/signin
   ├── Backend responds with 200/401
   └── User can sign in!
```

---

## 🆘 Troubleshooting

### **Still Getting "net::ERR_CONNECTION_CLOSED"**
1. Check Render logs - is build failing?
2. Check if backend service is "Live" (green status)
3. Try accessing backend directly: https://aetheris-mjvx.onrender.com/health
4. If 404: Backend is responding (good!)
5. If timeout: Backend not running

### **TypeScript errors in Render logs**
1. Clear Render build cache
2. Re-deploy
3. Check that all packages are in package.json

### **Frontend shows correct API URL but still doesn't work**
1. Check Network tab in DevTools
2. Look at the actual API request URL
3. Check API response (should be 200 or 401, not 404)
4. Check Render backend logs for errors

### **Backend builds but won't start**
1. Check `npm start` script (should use `next start`)
2. Check environment variables, especially DATABASE_URL
3. Look for database connection errors in logs

---

## 📞 Getting Help

If issues persist:

1. **Share Render logs** (full output)
2. **Share browser Network tab** (API request details)
3. **Share Render dashboard status** (screenshot)
4. **Verify DATABASE_URL** is set and valid

---

## Next Steps

1. ✅ Code changes are ready (files updated above)
2. ⏳ **YOU:** Push changes to GitHub
3. ⏳ **YOU:** Force redeploy on Render dashboard
4. ⏳ **YOU:** Watch Render logs for successful build
5. ✅ **YOU:** Test sign-in on https://aetheris-blue.vercel.app

