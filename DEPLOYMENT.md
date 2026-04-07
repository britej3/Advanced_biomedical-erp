# Deployment Guide - Biomedical ERP System

Complete instructions for deploying the Biomedical Department ERP System to production environments.

## Table of Contents

1. [Vercel Deployment](#vercel-deployment)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Pre-Deployment Checklist](#pre-deployment-checklist)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Alternative Hosting](#alternative-hosting)

---

## Vercel Deployment

Vercel is the recommended hosting platform for this application due to its seamless integration with Next.js and Node.js backends.

### Step 1: Prepare Your Repository

1. **Ensure code is committed**

   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Verify `.gitignore` includes sensitive files**

   ```
   .env.local
   .env.production.local
   node_modules/
   dist/
   .manus-logs/
   ```

3. **Create production branch** (optional but recommended)
   ```bash
   git checkout -b production
   git push origin production
   ```

### Step 2: Connect to Vercel

1. **Go to [vercel.com](https://vercel.com)**
   - Sign in with GitHub account
   - Click "New Project"

2. **Import Repository**
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**
   - Project Name: `biomedical-erp` (or your preference)
   - Framework: Select "Other" (custom Node.js)
   - Root Directory: `./` (or leave default)

### Step 3: Set Environment Variables

In Vercel project settings, add all variables from `.env.local`:

| Variable                      | Value                               | Notes                                    |
| ----------------------------- | ----------------------------------- | ---------------------------------------- |
| `DATABASE_URL`                | Your production database URL        | Must be MySQL-compatible                 |
| `VITE_APP_ID`                 | Your Manus OAuth app ID             | From Manus console                       |
| `OAUTH_SERVER_URL`            | https://api.manus.im                | Provided by Manus                        |
| `VITE_OAUTH_PORTAL_URL`       | https://auth.manus.im               | Provided by Manus                        |
| `JWT_SECRET`                  | Strong random string (min 32 chars) | Generate with: `openssl rand -base64 32` |
| `OWNER_OPEN_ID`               | Your Manus OpenID                   | Your account ID                          |
| `OWNER_NAME`                  | Your name                           | Display name                             |
| `BUILT_IN_FORGE_API_URL`      | https://api.manus.im/forge          | Provided by Manus                        |
| `BUILT_IN_FORGE_API_KEY`      | Your server API key                 | From Manus console                       |
| `VITE_FRONTEND_FORGE_API_KEY` | Your frontend API key               | From Manus console                       |
| `VITE_ANALYTICS_ENDPOINT`     | https://analytics.manus.im          | Provided by Manus                        |
| `VITE_ANALYTICS_WEBSITE_ID`   | Your website ID                     | From analytics setup                     |
| `VITE_APP_TITLE`              | Biomedical ERP                      | Application title                        |
| `VITE_APP_LOGO`               | Your logo URL                       | CDN URL for logo                         |
| `NODE_ENV`                    | production                          | Always use "production"                  |

**Adding Environment Variables in Vercel:**

1. Go to Project Settings → Environment Variables
2. Add each variable individually
3. Select which environments (Production, Preview, Development)
4. Click "Save"

### Step 4: Configure Build Settings

In Vercel project settings:

1. **Build Command**

   ```
   pnpm build
   ```

2. **Output Directory**

   ```
   dist
   ```

3. **Install Command**
   ```
   pnpm install
   ```

### Step 5: Deploy

1. **Trigger Deployment**
   - Vercel automatically deploys on push to connected branch
   - Or click "Deploy" button manually

2. **Monitor Build**
   - Watch build logs in Vercel dashboard
   - Check for any build errors

3. **Verify Deployment**
   - Visit your deployment URL
   - Test login and basic functionality

---

## Environment Setup

### Production Database

**Recommended Providers:**

- AWS RDS (MySQL)
- Google Cloud SQL
- Azure Database for MySQL
- DigitalOcean Managed Databases
- Supabase (PostgreSQL - requires adapter)

**Database Configuration:**

1. **Create Database**

   ```sql
   CREATE DATABASE biomedical_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'erp_user'@'%' IDENTIFIED BY 'strong_password_here';
   GRANT ALL PRIVILEGES ON biomedical_erp.* TO 'erp_user'@'%';
   FLUSH PRIVILEGES;
   ```

2. **Connection String Format**

   ```
   mysql://erp_user:strong_password_here@host:3306/biomedical_erp
   ```

3. **Enable SSL/TLS**
   ```
   mysql://erp_user:password@host:3306/biomedical_erp?ssl=true
   ```

### OAuth Configuration

1. **Register Application with Manus**
   - Go to Manus Developer Console
   - Create new OAuth application
   - Set redirect URI to: `https://your-domain.com/api/oauth/callback`
   - Get Client ID and Client Secret

2. **Configure Callback URL**
   - Add production domain to allowed redirects
   - Format: `https://yourdomain.com/api/oauth/callback`

### SSL/TLS Certificate

Vercel automatically provides SSL certificates via Let's Encrypt. No additional configuration needed.

---

## Database Configuration

### Initial Setup

1. **Apply Migrations**

   ```bash
   # Run migrations on production database
   pnpm drizzle-kit migrate
   ```

2. **Verify Tables**
   ```sql
   SHOW TABLES;
   DESCRIBE users;
   DESCRIBE equipment;
   DESCRIBE maintenance;
   DESCRIBE inventory;
   DESCRIBE workOrders;
   ```

### Backup Strategy

**Automated Backups:**

- Enable automatic backups in your database provider
- Set retention to minimum 30 days
- Test restore procedures regularly

**Manual Backups:**

```bash
# Backup database
mysqldump -u erp_user -p biomedical_erp > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u erp_user -p biomedical_erp < backup_20260401.sql
```

### Connection Pooling

For production, configure connection pooling:

```javascript
// In server/db.ts
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

---

## Pre-Deployment Checklist

Before deploying to production:

### Code Quality

- [ ] All tests passing: `pnpm test`
- [ ] No TypeScript errors: `pnpm check`
- [ ] Code formatted: `pnpm format`
- [ ] No console.log statements in production code
- [ ] Error handling implemented

### Security

- [ ] All secrets in environment variables
- [ ] No hardcoded credentials
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Input validation on all forms
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled

### Performance

- [ ] Database indexes created
- [ ] Lazy loading implemented
- [ ] Images optimized
- [ ] Bundle size acceptable
- [ ] API response times < 500ms

### Documentation

- [ ] README.md updated
- [ ] DATABASE_SCHEMA.md complete
- [ ] .env.local.example provided
- [ ] API documentation current
- [ ] Deployment guide reviewed

### Testing

- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Cross-browser testing done
- [ ] Mobile responsiveness verified

---

## Post-Deployment Verification

### Immediate Checks (First 30 minutes)

1. **Application Accessibility**

   ```bash
   curl https://your-domain.com
   ```

2. **Authentication Flow**
   - Visit application
   - Click login
   - Complete OAuth flow
   - Verify redirect to dashboard

3. **Database Connectivity**
   - Create test equipment
   - Verify data appears in database
   - Check timestamps are correct

4. **Error Monitoring**
   - Check error logs in Vercel
   - Monitor application errors
   - Review database errors

### Functional Testing (First 24 hours)

1. **Equipment Module**
   - [ ] Create equipment
   - [ ] Edit equipment
   - [ ] Delete equipment
   - [ ] Filter by status

2. **Maintenance Module**
   - [ ] Schedule maintenance
   - [ ] Update status
   - [ ] Assign technician
   - [ ] View history

3. **Inventory Module**
   - [ ] Add items
   - [ ] Update quantities
   - [ ] Check low-stock alerts
   - [ ] View categories

4. **Work Orders Module**
   - [ ] Create work order
   - [ ] Assign to staff
   - [ ] Update status
   - [ ] Set priority

5. **Dashboard**
   - [ ] View summary cards
   - [ ] Check charts load
   - [ ] Verify statistics
   - [ ] Test filters

### Performance Monitoring

1. **Response Times**
   - Dashboard load: < 2 seconds
   - List pages load: < 1 second
   - API calls: < 500ms

2. **Error Rates**
   - Target: < 0.1% error rate
   - Monitor 500 errors
   - Track 4xx errors

3. **Database Performance**
   - Query times < 100ms
   - Connection pool health
   - Slow query log review

---

## Monitoring & Maintenance

### Continuous Monitoring

**Vercel Analytics:**

- Monitor Web Vitals
- Track page load times
- Review error rates
- Check deployment frequency

**Database Monitoring:**

- Monitor query performance
- Track connection count
- Review slow query log
- Monitor disk usage

**Application Monitoring:**

- Set up error tracking (Sentry, Rollbar)
- Monitor API response times
- Track user activity
- Review access logs

### Regular Maintenance Tasks

**Daily:**

- Review error logs
- Check database health
- Monitor uptime

**Weekly:**

- Review performance metrics
- Check backup integrity
- Update dependencies (if needed)

**Monthly:**

- Full security audit
- Performance optimization
- Capacity planning
- User feedback review

**Quarterly:**

- Major version updates
- Security patches
- Database optimization
- Disaster recovery drill

### Scaling Considerations

As usage grows:

1. **Database Scaling**
   - Read replicas for reporting
   - Connection pooling optimization
   - Query optimization
   - Caching layer (Redis)

2. **Application Scaling**
   - Multiple instances on Vercel
   - CDN for static assets
   - API rate limiting
   - Load balancing

3. **Infrastructure**
   - Separate read/write databases
   - Message queue for async tasks
   - Scheduled jobs for maintenance
   - Backup automation

---

## Troubleshooting

### Common Deployment Issues

**Build Fails**

```bash
# Clear cache and rebuild
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

**Database Connection Error**

- Verify DATABASE_URL format
- Check firewall rules allow connection
- Confirm database is running
- Test connection string locally

**OAuth Not Working**

- Verify VITE_APP_ID is correct
- Check redirect URI matches
- Confirm OAuth server URL
- Review Manus console settings

**Environment Variables Not Loading**

- Verify all variables set in Vercel
- Check variable names exactly match
- Redeploy after adding variables
- Check for typos in names

### Performance Issues

**Slow Dashboard Load**

- Check database query times
- Verify indexes are created
- Consider caching stats
- Optimize chart rendering

**High Memory Usage**

- Check for memory leaks
- Review connection pool size
- Monitor active connections
- Optimize query results

**Database Timeout**

- Increase timeout values
- Check query performance
- Verify connection pooling
- Review slow query log

---

## Alternative Hosting

### Railway

1. Connect GitHub repository
2. Set environment variables
3. Deploy with `railway up`
4. Configure custom domain

### Render

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `pnpm build`
4. Set start command: `pnpm start`
5. Add environment variables

### DigitalOcean App Platform

1. Create new app
2. Connect GitHub repository
3. Configure build settings
4. Set environment variables
5. Deploy

### Self-Hosted (VPS)

1. **Install Dependencies**

   ```bash
   curl -fsSL https://get.pnpm.io/install.sh | sh -
   ```

2. **Clone Repository**

   ```bash
   git clone <repository-url>
   cd biomedical-erp
   ```

3. **Install & Build**

   ```bash
   pnpm install
   pnpm build
   ```

4. **Run with PM2**

   ```bash
   npm install -g pm2
   pm2 start "pnpm start" --name biomedical-erp
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Node.js Best Practices**: https://nodejs.org/en/docs/
- **MySQL Documentation**: https://dev.mysql.com/doc/
- **Manus OAuth**: https://manus.im/docs/oauth
- **tRPC Documentation**: https://trpc.io/docs

---

**Last Updated**: April 2026  
**Version**: 1.0.0
