# Deployment Configuration Guide

## Vercel (Frontend) - Environment Variables Required

Set these in your Vercel project settings under "Environment Variables":

```
NEXT_PUBLIC_API_URL=https://aetheris-mjvx.onrender.com/api
```

**Important:** Make sure `/api` is included at the end. This is critical for the frontend to reach the correct endpoints.

## Render (Backend) - Environment Variables Required

These should be set in your Render service dashboard:

1. **DATABASE_URL** - Your Neon PostgreSQL connection string
   - Get from: https://console.neon.tech
   - Format: `postgresql://user:password@host.neon.tech/database?sslmode=require`

2. **NEXTAUTH_SECRET** - Auto-generated or provide your own
   - Generate with: `openssl rand -base64 32`

3. **NEXTAUTH_URL** - Set to: `https://aetheris-mjvx.onrender.com`

4. **FRONTEND_URL** - Set to: `https://aetheris-blue.vercel.app`

5. **CORS_ORIGIN** - Set to: `https://aetheris-blue.vercel.app`

6. **PUSHER_APP_ID** - From Pusher dashboard (optional if not using real-time)

7. **NEXT_PUBLIC_PUSHER_KEY** - From Pusher dashboard (optional)

8. **PUSHER_SECRET** - From Pusher dashboard (optional)

9. **NEXT_PUBLIC_PUSHER_CLUSTER** - From Pusher dashboard (default: `mt1`)

10. **NODE_ENV** - Set to: `production`

11. **PORT** - Set to: `3001`

## Deployment Checklist

- [ ] Verify `NEXT_PUBLIC_API_URL` on Vercel includes `/api` 
- [ ] All Database URL is valid and accessible
- [ ] Backend service is running (check Render dashboard)
- [ ] CORS headers are properly configured
- [ ] Both services are deployed to correct domains
- [ ] Test signup/signin endpoints after deployment
- [ ] Monitor backend logs for any database connection errors

## Troubleshooting

### Sign-up/Sign-in stuck in loading:
1. Check Vercel logs for network errors
2. Check Render backend logs for database connection issues
3. Verify `NEXT_PUBLIC_API_URL` ends with `/api`
4. Test API endpoint directly: `curl https://aetheris-mjvx.onrender.com/api/health`

### Database connection errors:
1. Verify DATABASE_URL is correct
2. Check if Neon database is online
3. Check if migrations have been run
4. Look for connection pool exhaustion in logs

### CORS errors:
1. Verify `CORS_ORIGIN` on backend matches frontend URL
2. Check that backend returns proper CORS headers
3. Ensure `Access-Control-Allow-Origin` header is set to frontend URL
