# 🚀 Deploy DayFlow Backend to Railway

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Backend code ready (you have this!)
- ✅ 15-20 minutes of time

---

## 🎯 Step-by-Step Deployment Guide

### Step 1: Create Railway Account (2 minutes)

1. **Go to Railway**: https://railway.app/
2. **Click "Login"**
3. **Choose "Login with GitHub"**
4. **Authorize Railway** to access your GitHub account
5. Done! You're logged in ✅

---

### Step 2: Push Code to GitHub (5 minutes)

**If you don't have a GitHub repository yet:**

```bash
# Navigate to your backend folder
cd taskmanager1/backend

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - DayFlow backend ready for deployment"

# Create repository on GitHub.com
# Then link it:
git remote add origin https://github.com/YOUR_USERNAME/dayflow-backend.git
git branch -M main
git push -u origin main
```

**Important files to check before pushing:**
- ✅ `.gitignore` includes `.env` and `node_modules`
- ✅ `package.json` exists
- ✅ All source code is committed

---

### Step 3: Create Railway Project (3 minutes)

1. **In Railway Dashboard**, click **"+ New Project"**

2. **Choose** "Deploy from GitHub repo"

3. **Select** your repository: `dayflow-backend`

4. **Railway will:**
   - Detect it's a Node.js project ✅
   - Start building automatically ✅
   - May fail first time (expected - we need database!)

---

### Step 4: Add PostgreSQL Database (2 minutes)

1. **In your Railway project**, click **"+ New"**

2. **Choose "Database"**

3. **Select "PostgreSQL"**

4. **Railway creates database automatically**
   - Database Name: `railway`
   - Connection string generated
   - Automatically linked to your app ✅

5. **DATABASE_URL** is now available as environment variable ✅

---

### Step 5: Configure Environment Variables (5 minutes)

1. **Click on your backend service** (not the database)

2. **Go to "Variables" tab**

3. **Add these variables:**

**Required Variables:**

| Variable | Value | How to Get |
|----------|-------|------------|
| `DATABASE_URL` | (auto-filled by Railway) | Already set ✅ |
| `JWT_SECRET` | Generate random string | See below ⬇️ |
| `NODE_ENV` | `production` | Type this |
| `PORT` | (auto-filled by Railway) | Already set ✅ |

**Generate JWT_SECRET:**

**Option A: PowerShell (Windows)**
```powershell
# Run this command:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Option B: Online Generator**
- Go to: https://generate-random.org/api-token-generator
- Generate a 32+ character random string
- Copy and paste as JWT_SECRET

**Option C: Use This (for testing)**
```
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c3e7e9e47efed4bff64f4f8e84b2d8d3
```

4. **Save Variables** - Railway will restart the app automatically

---

### Step 6: Update Prisma for PostgreSQL (in your code)

**Option A: Replace schema.prisma** (Easy)
```bash
# In your backend folder
cd taskmanager1/backend/prisma

# Backup current schema
cp schema.prisma schema.sqlite.backup

# Copy PostgreSQL schema
cp schema.postgresql.prisma schema.prisma
```

**Option B: Manual Edit**
Open `prisma/schema.prisma` and change:
```prisma
datasource db {
  provider = "sqlite"        // CHANGE THIS
  url      = env("DATABASE_URL")
}
```

To:
```prisma
datasource db {
  provider = "postgresql"    // TO THIS
  url      = env("DATABASE_URL")
}
```

**Then commit and push:**
```bash
git add .
git commit -m "Switch to PostgreSQL for production"
git push
```

Railway will automatically redeploy! ✅

---

### Step 7: Run Database Migrations (2 minutes)

**Railway will run migrations automatically**, but if needed manually:

1. **In Railway**, go to your backend service

2. **Click "Deploy Logs"** tab

3. **Look for**:
   ```
   Running migrations...
   ✅ Migration complete
   ```

4. **If you see errors**:
   - Go to "Settings" → "Deploy"
   - Click "Redeploy"

---

### Step 8: Get Your API URL (1 minute)

1. **In Railway**, click your backend service

2. **Go to "Settings" tab**

3. **Scroll to "Networking"**

4. **Click "Generate Domain"**

5. **You'll get a URL like:**
   ```
   https://dayflow-backend-production.up.railway.app
   ```

6. **Copy this URL** - you'll need it for mobile app! 📋

---

### Step 9: Test Your Deployed API (2 minutes)

**Method 1: Browser**
Open in browser:
```
https://your-app.railway.app/health
```

Should see:
```json
{
  "status": "ok",
  "timestamp": "2026-07-07T..."
}
```

**Method 2: PowerShell**
```powershell
Invoke-WebRequest -Uri "https://your-app.railway.app/health"
```

**Method 3: Use TEST_DEPLOYMENT.html** (I'll create this)

---

### Step 10: Update Mobile App (5 minutes)

**Update API URL in mobile app:**

1. **Open**: `mobile-fixed/src/services/api.js`

2. **Find this line:**
   ```javascript
   const API_BASE_URL = 'http://192.168.0.194:3000';
   ```

3. **Change to your Railway URL:**
   ```javascript
   const API_BASE_URL = 'https://your-app.railway.app';
   ```

4. **Save the file**

5. **Restart Expo server:**
   ```bash
   # Stop current server (Ctrl+C)
   # Start again
   npx expo start --clear
   ```

6. **Scan QR code and test!**

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Environment variables set (JWT_SECRET, NODE_ENV)
- [ ] Code pushed to GitHub
- [ ] Railway deployed successfully
- [ ] Database migrations ran
- [ ] API URL generated
- [ ] Health endpoint responds: `/health`
- [ ] Can register new user: `POST /api/auth/register`
- [ ] Can login: `POST /api/auth/login`
- [ ] Mobile app connects to cloud backend
- [ ] All features work on mobile

---

## 🐛 Troubleshooting

### Issue 1: Build Fails

**Error**: "prisma not found"

**Fix**: Make sure `package.json` includes:
```json
"scripts": {
  "build": "prisma generate"
}
```

### Issue 2: Migration Fails

**Error**: "Migration failed"

**Fix**: 
1. Go to Railway → Database
2. Click "Connect"
3. Copy connection string
4. Run locally:
```bash
DATABASE_URL="your-connection-string" npx prisma migrate deploy
```

### Issue 3: App Crashes on Start

**Check Railway Logs:**
1. Go to your service
2. Click "Deploy Logs"
3. Look for errors

**Common fixes:**
- Check `JWT_SECRET` is set
- Check `DATABASE_URL` is correct
- Check `NODE_ENV=production`

### Issue 4: CORS Errors

**Error**: "CORS policy blocked"

**Fix**: Update `src/index.js`:
```javascript
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? ['https://your-app.railway.app']
    : '*',
  credentials: true
};
```

### Issue 5: Database Connection Error

**Error**: "Can't reach database server"

**Fix**:
1. Check DATABASE_URL in Railway variables
2. Make sure PostgreSQL service is running
3. Check Railway logs for connection errors

---

## 📊 Railway Free Tier Limits

**What's Included:**
- ✅ 500 hours/month free ($5 worth)
- ✅ PostgreSQL database (1GB)
- ✅ Automatic HTTPS
- ✅ Custom domain support
- ✅ GitHub auto-deploy

**When You Need to Upgrade:**
- App runs > 500 hours/month (24/7 usage)
- Database > 1GB
- Need more resources

**Cost if exceeded**: ~$5-10/month

---

## 🎉 Success!

Once deployed, your app will be:
- ✅ **Available 24/7**
- ✅ **Accessible worldwide**
- ✅ **Automatic HTTPS**
- ✅ **Auto-deploy on git push**
- ✅ **Professional production setup**

---

## 📝 Next Steps After Deployment

1. **Test thoroughly** with mobile app
2. **Create test user** in production
3. **Monitor Railway logs** for errors
4. **Set up custom domain** (optional)
5. **Enable monitoring/alerts** (optional)
6. **Add staging environment** (optional)

---

## 🔗 Useful Links

- **Railway Dashboard**: https://railway.app/dashboard
- **Railway Docs**: https://docs.railway.app/
- **Prisma Docs**: https://www.prisma.io/docs/
- **Project GitHub**: (your repository)

---

## 💡 Pro Tips

1. **Use Railway CLI** for faster deployments
2. **Set up staging environment** for testing
3. **Enable automatic backups** in Railway
4. **Monitor costs** in Railway dashboard
5. **Use environment-specific configs** for dev/prod

---

**Deployment Time**: 20-30 minutes  
**Difficulty**: Easy  
**Cost**: Free (with Railway free tier)  
**Result**: Production-ready API! 🚀
