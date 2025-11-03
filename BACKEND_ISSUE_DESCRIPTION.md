# Azure App Service Node.js Backend 500 Internal Server Error

## Problem Summary
Deployed Node.js/Express backend on Azure App Service returns **500 Internal Server Error** on all requests. The server is accessible (no connection refused), but fails to process requests.

## Technical Details

### Environment
- **Platform**: Azure App Service (Windows/Linux - need to verify)
- **URL**: https://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/
- **Backend Stack**: Node.js, Express.js, MongoDB (Mongoose)
- **HTTP Status**: 500 Internal Server Error
- **Response Body**: Empty (Content-Length: 0)
- **Server Header**: Microsoft-IIS/10.0 (suggests Windows deployment)

### Application Structure
- Entry Point: `src/index.js`
- Main App: `src/app.js`
- Database: MongoDB (using Mongoose)
- Authentication: JWT-based
- Additional Services: Kafka (optional), Socket.io, Cloudinary

### Current Behavior
1. ✅ Server responds to requests (not connection refused)
2. ✅ HTTP redirects to HTTPS (working)
3. ❌ Returns 500 error on root endpoint `/`
4. ❌ Empty response body (no error details)

### Code Context
- Root endpoint (`/`) in `app.js` checks MongoDB connection status
- Uses `mongoose.connection.readyState` to determine database status
- Has error handlers but not returning error details in production mode

## Suspected Causes

### 1. Missing Environment Variables
**Critical Variables:**
- `MONGODB_URI` - Required for database connection
- `JWT_SECRET_VERIFY` - Required for JWT authentication

**Code Evidence:**
```javascript
// app.js line 68-69
const mongoose = require('mongoose');
const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
```

### 2. Database Connection Failure
- MongoDB connection might be failing during startup
- Connection string might be incorrect or missing
- Network/firewall issues preventing MongoDB Atlas access

### 3. Application Startup Issues
- Node.js process might be crashing during initialization
- Missing dependencies in production
- Port configuration issues
- web.config (iisnode) configuration problems

### 4. Error Handling
- Errors are being caught but not logged properly
- Production mode hides error details
- No error response body being returned

## What We've Verified
- ✅ URL is accessible (DNS resolves correctly)
- ✅ HTTPS is working (SSL certificate valid)
- ✅ Server is responding (not down)
- ✅ HTTP → HTTPS redirect working
- ❌ Application logic not executing properly

## Search Keywords for Internet Research

### Primary Searches
1. **"Azure App Service Node.js 500 Internal Server Error empty response"**
2. **"Azure App Service Express.js 500 error no response body"**
3. **"iisnode 500 Internal Server Error Node.js Azure"**
4. **"Mongoose connection Azure App Service 500 error"**
5. **"Azure App Service Node.js environment variables not working"**

### Specific Issue Searches
6. **"Azure App Service Node.js returns 500 Content-Length 0"**
7. **"Azure App Service Node.js application crashes on startup"**
8. **"MongoDB connection Azure App Service Node.js fails"**
9. **"Azure App Service web.config iisnode Node.js not working"**
10. **"Azure App Service Express.js health check endpoint 500"**

### Diagnostic Searches
11. **"How to check Azure App Service Node.js logs"**
12. **"Azure App Service Application Insights Node.js errors"**
13. **"Azure App Service Kudu console Node.js debugging"**
14. **"Azure App Service Node.js environment variables not loading"**
15. **"Azure App Service Node.js dotenv not working production"**

## Potential Solutions to Research

### 1. Check Application Logs
- Azure Portal → App Service → Log stream
- Azure Portal → App Service → Advanced Tools (Kudu) → Debug console
- Application Insights → Failures and exceptions

### 2. Verify Environment Variables
- Azure Portal → Configuration → Application settings
- Verify `MONGODB_URI` and `JWT_SECRET_VERIFY` are set
- Check for typos or extra spaces
- Ensure variables are saved and app restarted

### 3. Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes Azure App Service IPs
- Check MongoDB connection string format
- Test MongoDB connection from Azure App Service Kudu console

### 4. web.config Configuration
- Verify `web.config` is correct for the deployment
- Check if using Windows vs Linux App Service
- Verify `iisnode` configuration if Windows
- Check if `web.config` should be removed for Linux deployment

### 5. Application Initialization
- Check if app crashes during `initializeServices()` in `index.js`
- Verify all dependencies are installed
- Check for missing required modules
- Verify Node.js version compatibility

### 6. Port Configuration
- Azure App Service sets PORT automatically
- Verify app listens on `process.env.PORT`
- Check if PORT environment variable is set correctly

## Files to Check
- `Backend/src/index.js` - Entry point and service initialization
- `Backend/src/app.js` - Express app configuration and root endpoint
- `Backend/src/config/db.js` - MongoDB connection logic
- `Backend/web.config` - IIS/iisnode configuration (if Windows)
- `Backend/package.json` - Dependencies and scripts

## Troubleshooting Chart

### Systematic Diagnosis Table

| Category | Potential Issue/Cause | Recommended Search Terms | Initial Checklist/Action in Azure Portal |
|----------|----------------------|-------------------------|------------------------------------------|
| **Application Logic** | Unhandled exceptions or code crashes during startup or request processing | "Azure App Service Node.js 500 Internal Server Error empty response", "Azure App Service Express.js 500 error no response body", "Azure App Service Node.js crashes on startup" | 1. Check Azure Portal → App Service → Log stream (real-time errors)<br>2. Enable and review Application Logs (Filesystem) in Monitoring → Diagnostics Logs page<br>3. Use Kudu console (yoursitename.scm.azurewebsites.net) to run the app from the command line and check for errors |
| **Configuration** | Missing or incorrect environment variables (e.g., database connection strings) required by the app | "Azure App Service Node.js environment variables not loading", "web.config configuration is not correct" | 1. Verify environment variables in Configuration → Application settings<br>2. Check if web.config is correct and present for your deployment type (it might be auto-generated) |
| **Database Connectivity** | Failure to connect to the MongoDB database (e.g., firewall, incorrect credentials) | "MongoDB connection Azure App Service Node.js 500 error", "MongoDB Atlas allows Azure App Service IPs" | 1. Check if MongoDB Atlas allows Azure App Service IPs (allow connections from Azure services)<br>2. Ensure the database is running and connection strings are accurate |
| **Deployment/Platform** | Incorrect file paths, missing main script file, or application taking too long to start (iisnode timeout) | "iisnode 500 Internal Server Error Node.js Azure", "Node.exe is not present at the correct location" | 1. Verify the main script file name in web.config matches the deployed file<br>2. Increase the maxNamedPipeConnectionRetry and namedPipeConnectionRetryDelay settings if it's a cold start/timeout issue |

## Action Plan - Step by Step

### Step 1: Check Application Logs (HIGHEST PRIORITY)
**Action Items:**
1. Go to Azure Portal → App Service "Maya" → **Log stream**
   - Look for error messages, stack traces, or initialization failures
   - Check for "Cannot find module" errors
   - Look for MongoDB connection errors
   - Note any "PORT" or environment variable issues

2. Enable Application Logs:
   - Azure Portal → App Service → **Monitoring** → **Diagnostics Logs**
   - Enable **Application Logging (Filesystem)**
   - Set Level to **Verbose**
   - Save and wait 2-3 minutes, then check logs again

3. Access Kudu Console:
   - Navigate to: `https://maya-b6d7g0ephnhhe4ay.scm.canadacentral-01.azurewebsites.net`
   - Or: Azure Portal → App Service → **Advanced Tools** → **Go** → **Debug console** → **CMD**
   - Check file structure: `site/wwwroot/`
   - Verify `src/index.js` exists
   - Check `node_modules` folder exists and has dependencies

### Step 2: Verify Environment Variables
**Action Items:**
1. Azure Portal → App Service "Maya" → **Configuration** → **Application settings**
2. Verify these exist:
   - ✅ `MONGODB_URI` (should start with `mongodb+srv://...`)
   - ✅ `JWT_SECRET_VERIFY` (should be a long random string)
   - ✅ `PORT` (usually auto-set by Azure, but verify it exists)
   - ✅ `NODE_ENV` (should be `production`)
3. Check for typos, extra spaces, or missing quotes
4. **Save** configuration (app will restart automatically)
5. Wait 2-3 minutes for restart, then test again

### Step 3: Database Connection Check
**Action Items:**
1. MongoDB Atlas Dashboard:
   - Go to **Network Access** → **IP Access List**
   - Ensure **"Allow access from anywhere"** (0.0.0.0/0) is enabled
   - OR add Azure App Service IP ranges (search for "Azure App Service IP ranges")
   
2. Verify MongoDB Connection String:
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/mayacode?retryWrites=true&w=majority`
   - Check username/password are correct
   - Verify cluster name matches your Atlas cluster

3. Test from Kudu Console:
   - In Kudu → **Debug console** → **CMD**
   - Navigate to: `cd D:\home\site\wwwroot`
   - Try: `node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI ? 'MONGODB_URI exists' : 'MONGODB_URI missing')"`

### Step 4: Check web.config and Deployment
**Action Items:**
1. Verify Deployment Type:
   - Azure Portal → App Service → **Configuration** → **General settings**
   - Check if **Stack** is "Node.js" and correct version
   - Note if it's Windows or Linux

2. Check web.config (if Windows):
   - In Kudu console, check: `D:\home\site\wwwroot\web.config`
   - Verify `path="src/index.js"` matches your actual file location
   - Check if `web.config` exists and is readable

3. Verify File Structure:
   - `site/wwwroot/src/index.js` should exist
   - `site/wwwroot/src/app.js` should exist
   - `site/wwwroot/package.json` should exist
   - `site/wwwroot/node_modules` should exist with dependencies

4. Check Startup Command (if Linux):
   - Azure Portal → **Configuration** → **General settings** → **Startup Command**
   - Should be: `node src/index.js` or `npm start`
   - Verify this matches your `package.json` start script

### Step 5: Test Application Startup
**Action Items:**
1. In Kudu Console → **Debug console** → **CMD**:
   ```bash
   cd D:\home\site\wwwroot
   node src/index.js
   ```
   - Watch for errors during startup
   - Check if MongoDB connection is attempted
   - Note any missing module errors

2. Check Node.js Version:
   - Kudu console: `node --version`
   - Verify it matches your local development version
   - Azure Portal → Configuration → General settings → Stack settings

## Next Steps
By following this chart systematically, you can diagnose and address the root cause of the 500 error. Start with Step 1 (Application Logs) as it will most likely reveal the exact error causing the 500 response.

