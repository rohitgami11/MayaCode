# Troubleshooting iisnode 500.1000 Error

## Quick Diagnosis Steps

### 1. Check if node_modules exists
**Via Kudu Console:**
```
https://maya-b6d7g0ephnhhe4ay.scm.canadacentral-01.azurewebsites.net
→ Debug Console → CMD
→ cd D:\home\site\wwwroot
→ dir node_modules
```

**If missing:**
```cmd
npm install --production
```

### 2. Check iisnode logs
**Location:** `D:\home\LogFiles\iisnode\`
- Look for files named `src-index.js-*.log`
- These contain the actual Node.js error messages

### 3. Run test script
**Via Kudu Console:**
```cmd
cd D:\home\site\wwwroot
node test-startup.js
```

This will verify:
- Required files exist
- node_modules exists
- Basic dependencies are available

### 4. Test the app manually
**Via Kudu Console:**
```cmd
cd D:\home\site\wwwroot
node src/index.js
```

Watch for error messages. If it crashes immediately, the logs will show why.

### 5. Verify web.config
**Check that web.config exists and points to:**
```xml
<add name="iisnode" path="src/index.js" verb="*" modules="iisnode"/>
```

### 6. Check Application Settings
**Azure Portal → App Service → Configuration → Application Settings**

Required:
- `PORT` (auto-set by Azure, but verify it exists)
- `MONGODB_URI` (your MongoDB connection string)
- `JWT_SECRET_VERIFY` (for authentication)
- `NODE_ENV` (should be `production`)

### 7. Check file permissions
All files in `D:\home\site\wwwroot` should be readable by IIS_IUSRS.

## Common Issues

### Issue: "Cannot find module"
**Solution:** Run `npm install --production` in wwwroot

### Issue: "PORT is not defined"
**Solution:** Azure should set this automatically. If missing, add it in App Settings.

### Issue: App crashes on startup
**Check:** iisnode logs for the actual error message

### Issue: MongoDB connection fails
**Check:** 
- MongoDB Atlas Network Access allows Azure IPs (0.0.0.0/0)
- Connection string is correct in App Settings

## Viewing Logs

### Real-time logs
**Azure Portal → App Service → Log stream**

### iisnode logs
**Kudu → D:\home\LogFiles\iisnode\**

### Application logs
**Kudu → D:\home\LogFiles\Application\**

