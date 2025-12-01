# Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests passing (`npm run test`)
- [ ] Type checking passing (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables configured
- [ ] API keys secured in platform settings
- [ ] Domain/URL configured
- [ ] Error monitoring (Sentry) configured
- [ ] Analytics configured (optional)

## Build for Production

```bash
# Type check and build
npm run build

# This creates an optimized build in the `dist/` folder
```

## Environment Variables

Set these in your deployment platform's environment settings:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
SMS_API_KEY=your-sms-token
VITE_API_URL=https://your-api.com
```

**IMPORTANT**: Never commit secrets to git. Use platform environment variables only.

## Deployment Platforms

### Netlify

1. **Connect Repository**
   - Go to netlify.com
   - Click "New site from Git"
   - Select your repository
   - Authorize access

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Set Environment Variables**
   - Go to Site settings → Build & deploy → Environment
   - Add all required variables

4. **Deploy**
   - Push to main branch
   - Netlify automatically builds and deploys

### Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   - In Vercel dashboard: Settings → Environment Variables
   - Add all required variables

### Railway (Docker)

1. **Create Railway Account**
   - Go to railway.app
   - Create new project

2. **Connect Repository**
   - Select GitHub repository
   - Authorize Railway

3. **Configure**
   - Add environment variables in Railway dashboard
   - Railway auto-detects Node.js project

4. **Deploy**
   - Push to connected branch
   - Railway automatically deploys

### Fly.io (Docker)

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Create fly.toml**
   ```bash
   fly launch
   ```

3. **Set Secrets**
   ```bash
   fly secrets set VITE_SUPABASE_URL=https://...
   fly secrets set VITE_SUPABASE_ANON_KEY=...
   # ... other secrets
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

## Optimization Tips

### 1. Enable Compression
All platforms automatically gzip assets. Verify in headers:
```bash
curl -I https://your-domain.com
# Check for: content-encoding: gzip
```

### 2. Configure Caching
Set cache headers for static assets (handled by most platforms):
- HTML: No cache (revalidate frequently)
- JS/CSS: 1 year cache (versioned via build)
- Images: 30 days cache

### 3. Monitor Performance
- Use platform's performance monitoring
- Enable error tracking (Sentry)
- Monitor API response times

### 4. CDN Configuration
Most platforms include CDN by default:
- Netlify: Global CDN included
- Vercel: Edge functions available
- Railway/Fly: Use Cloudflare for CDN

## Monitoring & Maintenance

### Error Tracking
Set up Sentry for production monitoring:
```typescript
// In future update
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring
Monitor Core Web Vitals:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

### Logs & Debugging
- Check platform logs for build errors
- Monitor error tracking service
- Review analytics for user issues

## Rollback Procedure

### Netlify
1. Go to Deploys
2. Find previous successful deploy
3. Click "Publish deploy"

### Vercel
1. Go to Deployments
2. Find previous successful deployment
3. Click "Promote to Production"

### Railway/Fly
1. Use platform's deployment history
2. Re-deploy previous commit

## Post-Deployment

1. **Test in Production**
   - Visit domain
   - Test key workflows
   - Check error logs

2. **Monitor for Issues**
   - Watch error tracking
   - Monitor API response times
   - Check server logs

3. **Update DNS** (if needed)
   - Point domain to deployment URL
   - Wait for DNS propagation (up to 48 hours)

## Troubleshooting

### Build Fails
```bash
# Check locally first
npm run build

# Check for TypeScript errors
npm run typecheck

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Loaded
- Verify variables set in platform
- Check variable names match code
- Rebuild/redeploy after changing variables

### Slow Performance
- Check bundle size: `npm run build` shows final size
- Enable browser cache
- Use CDN for assets
- Optimize images

### API Errors
- Check API credentials
- Verify API URLs are correct
- Check CORS headers
- Review error logs

## Security Checklist

- [ ] API keys never in source code
- [ ] HTTPS enabled on domain
- [ ] CORS properly configured
- [ ] Security headers set (CSP, X-Frame-Options)
- [ ] Environment variables secured
- [ ] Error messages don't leak sensitive info
- [ ] Rate limiting configured (if applicable)

## Performance Targets

- Initial load: < 3 seconds
- Time to interactive: < 5 seconds
- Lighthouse score: > 80
- Bundle size: < 200KB (gzipped)

## Support & Resources

- [Netlify Docs](https://docs.netlify.com/)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)
- [Fly.io Docs](https://fly.io/docs/)
