# Azure App Service Environment Variables Configuration

## 🔴 **CRITICAL - REQUIRED for Basic Functionality**

These must be set for the backend to work properly:

### 1. **MONGODB_URI** ⚠️ MOST IMPORTANT
- **Purpose**: MongoDB database connection string
- **Format**: `mongodb+srv://username:password@cluster.mongodb.net/mayacode?retryWrites=true&w=majority`
- **Example**: `mongodb+srv://mayacode:password123@cluster0.abc123.mongodb.net/mayacode?retryWrites=true&w=majority`
- **Where to get**: MongoDB Atlas dashboard → Connect → Connection string
- **Status**: ✅ REQUIRED - Without this, database operations will fail

### 2. **JWT_SECRET_VERIFY**
- **Purpose**: Secret key for signing and verifying JWT tokens
- **Format**: Any secure random string (at least 32 characters recommended)
- **Example**: `your-super-secret-jwt-key-here-minimum-32-chars`
- **How to generate**: Use a secure random string generator
- **Status**: ✅ REQUIRED - Authentication will fail without this

---

## 🟡 **RECOMMENDED - For Production**

### 3. **NODE_ENV**
- **Purpose**: Environment mode (development/production)
- **Value**: `production`
- **Status**: 🟡 RECOMMENDED

### 4. **PORT**
- **Purpose**: Server port (usually auto-set by Azure)
- **Value**: `8000` (or leave Azure to set automatically)
- **Status**: 🟡 Usually auto-configured by Azure

---

## 🟢 **OPTIONAL - For Additional Features**

### Email/SMTP Configuration (for OTP functionality)

### 5. **SMTP_USER**
- **Purpose**: Email address for sending OTP emails
- **Example**: `your-email@gmail.com`
- **Status**: 🟢 OPTIONAL (if not set, email OTP won't work)

### 6. **SMTP_PASS**
- **Purpose**: Email password or app password
- **Example**: `your-app-password`
- **Status**: 🟢 OPTIONAL (if not set, email OTP won't work)

### Cloudinary (for image uploads)

### 7. **CLOUDINARY_NAME**
- **Purpose**: Cloudinary cloud name
- **Example**: `your-cloud-name`
- **Status**: 🟢 OPTIONAL

### 8. **CLOUDINARY_API_KEY**
- **Purpose**: Cloudinary API key
- **Example**: `123456789012345`
- **Status**: 🟢 OPTIONAL

### 9. **CLOUDINARY_API_SECRET**
- **Purpose**: Cloudinary API secret
- **Example**: `abcdefghijklmnopqrstuvwxyz`
- **Status**: 🟢 OPTIONAL

### Google OAuth (if using Google login)

### 10. **GOOGLE_CLIENT_ID**
- **Purpose**: Google OAuth client ID
- **Status**: 🟢 OPTIONAL

### 11. **GOOGLE_CLIENT_SECRET**
- **Purpose**: Google OAuth client secret
- **Status**: 🟢 OPTIONAL

### 12. **BACKEND_URI**
- **Purpose**: Full backend URL for OAuth callbacks
- **Example**: `https://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net`
- **Status**: 🟢 OPTIONAL

### Kafka (for message queuing - advanced feature)

### 13. **KAFKA_BROKERS**
- **Purpose**: Kafka broker addresses
- **Example**: `broker1:9092,broker2:9092`
- **Status**: 🟢 OPTIONAL (app works without Kafka)

### 14. **KAFKA_SASL_USERNAME**
- **Purpose**: Kafka SASL username
- **Status**: 🟢 OPTIONAL

### 15. **KAFKA_SASL_PASSWORD**
- **Purpose**: Kafka SASL password
- **Status**: 🟢 OPTIONAL

### Valkey/Redis (for real-time features)

### 16. **VALKEY_HOST**
- **Purpose**: Valkey/Redis host
- **Status**: 🟢 OPTIONAL

### 17. **VALKEY_PORT**
- **Purpose**: Valkey/Redis port
- **Status**: 🟢 OPTIONAL

### 18. **VALKEY_USERNAME**
- **Purpose**: Valkey/Redis username
- **Status**: 🟢 OPTIONAL

### 19. **VALKEY_PASSWORD**
- **Purpose**: Valkey/Redis password
- **Status**: 🟢 OPTIONAL

### Session Configuration

### 20. **SESSION_SECRET**
- **Purpose**: Secret for session encryption
- **Example**: `your-session-secret-here`
- **Default**: `"secret"` (not secure for production!)
- **Status**: 🟢 OPTIONAL but recommended

---

## 📋 **Quick Setup Checklist**

### Minimum Setup (Backend will start, basic functionality):
- [ ] `MONGODB_URI`
- [ ] `JWT_SECRET_VERIFY`

### Recommended Setup (Production-ready):
- [ ] `MONGODB_URI`
- [ ] `JWT_SECRET_VERIFY`
- [ ] `NODE_ENV` = `production`
- [ ] `SESSION_SECRET` (change from default)

### Full Setup (All features enabled):
- [ ] All minimum variables
- [ ] All recommended variables
- [ ] SMTP credentials (for email)
- [ ] Cloudinary credentials (for images)
- [ ] Optional services (Kafka, Valkey) if needed

---

## 🔧 **How to Configure in Azure Portal**

1. **Navigate to App Service**:
   - Go to [Azure Portal](https://portal.azure.com)
   - Search for "Maya" in the search bar
   - Click on your App Service "Maya"

2. **Open Configuration**:
   - In the left sidebar, find "Configuration" under "Settings"
   - Click on "Configuration"

3. **Add Environment Variables**:
   - Click "New application setting"
   - Enter the **Name** (e.g., `MONGODB_URI`)
   - Enter the **Value** (e.g., your MongoDB connection string)
   - Click "OK"
   - Repeat for each variable

4. **Save Configuration**:
   - Click "Save" at the top
   - Azure will restart your app (takes ~1-2 minutes)

5. **Verify**:
   - Test the health endpoint: `GET https://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/`
   - Check the response - it should show `"database": "connected"` if MongoDB is configured correctly

---

## 🧪 **Testing Your Configuration**

After setting up the variables, test with:

```bash
# Health check (should return database status)
GET https://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/

# Expected response if MongoDB is connected:
{
  "message": "MayaCode Backend is running!",
  "status": "healthy",
  "database": "connected",
  "environment": {
    "mongodb_configured": true,
    "node_env": "production"
  }
}
```

---

## ⚠️ **Important Notes**

1. **Never commit** these values to Git - they're already in `.gitignore`
2. **Rotate secrets** periodically for security
3. **Use Key Vault** for sensitive values in production (Azure Key Vault integration)
4. **After changes**, Azure automatically restarts the app
5. **Check logs** if issues persist: Azure Portal → App Service → Log stream

