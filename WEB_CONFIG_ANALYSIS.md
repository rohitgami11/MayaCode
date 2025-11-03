# web.config Analysis for MayaCode Backend

## ✅ Current Configuration Status

### What's Correct:
1. **Entry Point Path**: `path="src/index.js"` ✅ Matches actual file
2. **Rewrite Rules**: Correctly routes all requests to `src/index.js` ✅
3. **iisnode Handler**: Properly configured ✅
4. **Logging**: Enabled ✅

### Current web.config:
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="src/index.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^src/index.js\/debug[\/]?" />
        </rule>
        <rule name="DynamicContent">
          <match url=".*" />
          <action type="Rewrite" url="src/index.js"/>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    <iisnode
      nodeProcessCommandLine="%node_cmd%"
      node_env="%node_env%"
      loggingEnabled="true"
      logDirectory="iisnode"/>
  </system.webServer>
</configuration>
```

---

## ⚠️ Potential Issues & Improvements

### 1. **Missing Error Handling**
Current config doesn't specify error pages or error handling behavior.

### 2. **Missing Timeout Settings**
No timeout configuration for long-running requests or startup.

### 3. **Missing Environment Variable Handling**
Could add explicit environment variable configuration.

### 4. **Missing Static File Handling**
Could add better handling for static files in `/public` directory.

### 5. **Missing WebSocket Support**
Socket.io might need explicit WebSocket support configuration.

---

## 🔧 Recommended Improved web.config

Here's an enhanced version with better error handling and configuration:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <!-- Configure handlers -->
    <handlers>
      <add name="iisnode" path="src/index.js" verb="*" modules="iisnode"/>
    </handlers>
    
    <!-- URL Rewrite rules -->
    <rewrite>
      <rules>
        <!-- Node Inspector rule (for debugging) -->
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^src/index.js\/debug[\/]?" />
        </rule>
        
        <!-- Static files - serve directly without rewriting -->
        <rule name="StaticContent" stopProcessing="true">
          <match url="^(public|uploads)/.*" />
          <action type="None" />
        </rule>
        
        <!-- All other requests go to Node.js -->
        <rule name="DynamicContent">
          <match url=".*" />
          <action type="Rewrite" url="src/index.js"/>
        </rule>
      </rules>
    </rewrite>
    
    <!-- Security settings -->
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    
    <!-- iisnode configuration -->
    <iisnode
      nodeProcessCommandLine="%node_cmd%"
      node_env="%node_env%"
      loggingEnabled="true"
      logDirectory="iisnode"
      debuggingEnabled="false"
      debuggingPort="5858"
      maxConcurrentRequestsPerProcess="1024"
      maxNamedPipeConnectionRetry="100"
      namedPipeConnectionRetryDelay="250"
      maxNamedPipeConnectionRetryDelay="3000"
      asyncCompletionThreadCount="0"
      initialRequestBufferSize="4096"
      maxRequestBufferSize="65536"
      watchedFiles="*.js"
      uncFileChangesPollingInterval="5000"
      gracefulShutdownTimeout="60000"
      loggingRotateFilesAfterSize="10485760"
      maxLogFileSize="10485760"
      maxTotalLogFileSize="52428800"
      maxLogFiles="20"
      devErrorsEnabled="false"
      flushResponse="false"
      enableXFF="false"
      promoteServerVars=""
      configOverrides="iisnode.yml"
      />
    
    <!-- Error pages -->
    <httpErrors existingResponse="PassThrough" />
    
    <!-- Static content (for public folder) -->
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
    </staticContent>
  </system.webServer>
</configuration>
```

---

## ✅ Verification Checklist

### Current web.config:
- [x] Entry point path is correct (`src/index.js`)
- [x] Rewrite rules are configured
- [x] iisnode handler is set up
- [x] Logging is enabled
- [ ] Error handling could be improved
- [ ] Timeout settings missing
- [ ] Static file handling could be better
- [ ] WebSocket support not explicitly configured

---

## 🎯 Critical Issues to Check

### 1. **Path Verification**
✅ **CORRECT**: `path="src/index.js"` matches your actual file structure
- File exists at: `Backend/src/index.js` ✅
- Package.json script: `"start": "node src/index.js"` ✅

### 2. **Azure Deployment**
⚠️ **CHECK**: Your GitHub Actions workflow excludes `web.config`:
```yaml
zip -r deploy.zip . -q -x "node_modules/*" "*.git*" "*.log" "*.DS_Store" "web.config"
```

**ISSUE**: If your Azure App Service is **Windows**, you NEED `web.config`!

**Solution**: Either:
- Remove `web.config` from exclusion list, OR
- Add step to copy `web.config` back after creating zip

### 3. **Environment Variables**
✅ `node_env="%node_env%"` is correct - Azure will set this automatically

---

## 📋 Recommended Action

### Option 1: Keep Current (Minimal) Config
If your current setup works, keep it. The current config is **functionally correct**.

### Option 2: Enhanced Config (Recommended)
Use the enhanced version above for:
- Better error handling
- Improved logging
- Static file optimization
- WebSocket support
- Better timeout handling

### Option 3: Fix Deployment Issue
**CRITICAL**: Fix your GitHub Actions workflow to include `web.config` if deploying to Windows:

```yaml
# In .github/workflows/dev_maya.yml, line 153
# Change from:
zip -r deploy.zip . -q -x "node_modules/*" "*.git*" "*.log" "*.DS_Store" "web.config"

# To (if Windows):
zip -r deploy.zip . -q -x "node_modules/*" "*.git*" "*.log" "*.DS_Store"
# OR (if Linux):
# Remove web.config entirely, use startup command instead
```

---

## ✅ Final Verdict

**Current web.config is CORRECTLY configured** for the file structure.

**However**, the deployment workflow might be excluding it, which could cause 500 errors if:
- Azure App Service is Windows-based
- web.config is not deployed
- IIS doesn't know how to handle Node.js requests

**Next Steps**:
1. ✅ Verify web.config is being deployed (check GitHub Actions)
2. ✅ Verify Azure App Service OS (Windows vs Linux)
3. ✅ If Windows: Ensure web.config is included in deployment
4. ✅ If Linux: Remove web.config, use startup command instead

