# Azure Deployment Checklist - MayaCode Backend

## ✅ Critical Fixes Applied (Must Deploy)

The following fixes were made to prevent 500 errors when optional services are missing:

### 1. **Redis/Valkey Connection** ✅ FIXED
- **Files**: `Backend/src/sockets/index.js`, `Backend/src/services/socket.js`
- **Fix**: Now only creates Redis clients if `VALKEY_HOST` is set
- **Impact**: Prevents crash when Redis/Valkey is not configured

### 2. **Kafka Configuration** ✅ FIXED  
- **File**: `Backend/src/config/kafka.js`
- **Fix**: Now only creates Kafka instance if `KAFKA_BROKERS` is set
- **Impact**: Prevents crash when Kafka is not configured

### 3. **Passport Google OAuth** ✅ FIXED
- **File**: `Backend/src/config/passport.js`
- **Fix**: Now only configures GoogleStrategy if credentials are provided
- **Impact**: Prevents crash when Google OAuth is not configured

### 4. **MongoDB Connection** ✅ IMPROVED
- **File**: `Backend/src/config/db.js`
- **Fix**: Added early validation for `MONGODB_URI`
- **Impact**: Better error handling when MongoDB URI is missing

### 5. **Kafka Consumer** ✅ IMPROVED
- **File**: `Backend/src/services/kafkaConsumer.js`
- **Fix**: Added null check before using consumer
- **Impact**: Prevents crash when Kafka consumer is not available

---

## 🚀 Deployment Steps

### Step 1: Commit and Push Fixes
```bash
git add Backend/src/
git commit -m "Fix: Handle missing optional services gracefully (Redis, Kafka, OAuth)"
git push origin main
```

### Step 2: Verify Azure Environment Variables

Go to **Azure Portal → App Service "Maya" → Configuration → Application Settings**

#### 🔴 REQUIRED (Must Have):
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `JWT_SECRET_VERIFY` - JWT secret key

#### 🟡 RECOMMENDED:
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` - Usually auto-set by Azure (verify it exists)
- [ ] `SESSION_SECRET` - Change from default "secret"

#### 🟢 OPTIONAL (Only if using these features):
- [ ] `KAFKA_BROKERS` - Only if using Kafka
- [ ] `VALKEY_HOST`, `VALKEY_PORT`, etc. - Only if using Redis/Valkey
- [ ] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BACKEND_URI` - Only if using Google OAuth
- [ ] `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Only if using Cloudinary
- [ ] `SMTP_USER`, `SMTP_PASS` - Only if using email OTP

### Step 3: Check Azure App Service Configuration

**Azure Portal → App Service "Maya" → Configuration → General Settings**

- [ ] **Stack**: Node.js (verify version matches - check GitHub Actions workflow)
- [ ] **Startup Command**: Should be `node src/index.js` or `npm start`
- [ ] **Always On**: Enable to prevent cold starts
- [ ] **HTTPS Only**: Enable for production

### Step 4: Verify Deployment Type (Windows vs Linux)

**Check**: Azure Portal → App Service → Overview → OS

- **If Windows**: Ensure `web.config` is deployed (currently it's excluded in GitHub Actions!)
- **If Linux**: `web.config` should NOT be deployed (current workflow is correct)

**⚠️ IMPORTANT**: Your workflow excludes `web.config` (line 153), but if your App Service is Windows, you need `web.config`. If it's Linux, you need a startup command instead.

### Step 5: Check MongoDB Atlas Network Access

1. Go to **MongoDB Atlas Dashboard**
2. **Network Access** → **IP Access List**
3. Ensure **"Allow access from anywhere"** (0.0.0.0/0) is enabled
   - OR add Azure App Service IP ranges
   - OR add specific Azure IPs if needed

### Step 6: Enable Application Logging

**Azure Portal → App Service → Monitoring → Diagnostic Logs**

- [ ] Enable **Application Logging (Filesystem)**
- [ ] Set Level to **Verbose**
- [ ] Enable **Detailed error messages**
- [ ] Save and wait 2-3 minutes

### Step 7: Test After Deployment

1. **Health Check**:
   ```bash
   curl https://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/
   ```
   Expected: JSON response with `"status": "healthy"`

2. **Check Logs**:
   - Azure Portal → App Service → Log stream
   - Look for startup errors or missing environment variables

3. **Kudu Console** (if needed):
   - Navigate to: `https://maya-b6d7g0ephnhhe4ay.scm.canadacentral-01.azurewebsites.net`
   - Or: Azure Portal → Advanced Tools → Go → Debug console
   - Check file structure: `site/wwwroot/`
   - Verify `src/index.js` exists

---

## 🔍 Troubleshooting If Still Getting 500 Error

### 1. Check Application Logs
- Azure Portal → App Service → Log stream
- Look for:
  - "Cannot find module" errors
  - MongoDB connection errors
  - Missing environment variable errors
  - Startup crashes

### 2. Check Kudu Console
- Verify files are deployed correctly
- Check if `node_modules` exists
- Try running: `node src/index.js` manually

### 3. Verify Environment Variables
- Azure Portal → Configuration → Application Settings
- Check for typos
- Ensure no extra spaces
- Verify values are correct

### 4. Check web.config (Windows Only)
- If Windows deployment, ensure `web.config` is in root
- Verify `path="src/index.js"` matches your file structure
- Check iisnode configuration

### 5. Check Startup Command (Linux Only)
- If Linux deployment, verify startup command
- Should be: `node src/index.js` or `npm start`

---

## 📝 GitHub Actions Workflow Issue

**Current Issue**: Line 153 excludes `web.config` from deployment:
```yaml
zip -r deploy.zip . -q -x "node_modules/*" "*.git*" "*.log" "*.DS_Store" "web.config"
```

**If your App Service is Windows**:
- You NEED `web.config`
- Either remove it from the exclusion list, OR
- Add a step to copy `web.config` back after creating the zip

**If your App Service is Linux**:
- Current workflow is correct
- Ensure startup command is set in Azure Portal

---

## ✅ Expected Behavior After Fixes

With the fixes applied, the backend should:
1. ✅ Start successfully even if Redis/Valkey is not configured
2. ✅ Start successfully even if Kafka is not configured
3. ✅ Start successfully even if Google OAuth is not configured
4. ✅ Only require `MONGODB_URI` and `JWT_SECRET_VERIFY` for basic functionality
5. ✅ Show helpful warnings instead of crashing

---

## 🎯 Next Steps

1. **Deploy the fixes** (commit and push)
2. **Verify environment variables** in Azure Portal
3. **Check deployment type** (Windows vs Linux)
4. **Enable application logging** for debugging
5. **Test the health endpoint** after deployment
6. **Check logs** if still getting 500 errors

---

## 📞 Quick Verification

After deployment, test:
```bash
curl https://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/
```

**Expected Response**:
```json
{
  "message": "MayaCode Backend is running!",
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-03T...",
  "endpoints": {...},
  "environment": {
    "mongodb_configured": true,
    "node_env": "production"
  }
}
```

If you get this response, the backend is working! 🎉

