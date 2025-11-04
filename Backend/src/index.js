// Add error handling for missing dependencies
// Check if node_modules exists (warn but don't exit - actual requires will fail if missing)
try {
  const fs = require("fs");
  const path = require("path");
  
  // Check both possible locations (../node_modules for Azure deployment, ../../node_modules for local)
  const nodeModulesPath1 = path.join(__dirname, "../node_modules");
  const nodeModulesPath2 = path.join(__dirname, "../../node_modules");
  const cwdNodeModules = path.join(process.cwd(), "node_modules");
  
  const nodeModulesExists = fs.existsSync(nodeModulesPath1) || 
                           fs.existsSync(nodeModulesPath2) || 
                           fs.existsSync(cwdNodeModules);
  
  if (!nodeModulesExists) {
    console.warn("⚠️ WARNING: node_modules directory not found in expected locations!");
    console.warn("Checked paths:");
    console.warn("  - " + nodeModulesPath1);
    console.warn("  - " + nodeModulesPath2);
    console.warn("  - " + cwdNodeModules);
    console.warn("Current working directory: " + process.cwd());
    console.warn("__dirname: " + __dirname);
    console.warn("⚠️ Continuing anyway - Azure may install dependencies during deployment");
    console.warn("If modules are missing, require() calls will fail with clear error messages");
  } else {
    console.log("✅ node_modules found");
  }
} catch (checkError) {
  console.warn("⚠️ Warning: Error checking for node_modules:", checkError.message);
  console.warn("Continuing anyway...");
}

// Add global error handlers BEFORE loading modules
process.on('uncaughtException', (error) => {
  console.error("=".repeat(50));
  console.error("❌ UNCAUGHT EXCEPTION - Application will exit");
  console.error("=".repeat(50));
  console.error("Error:", error.message);
  console.error("Stack:", error.stack);
  console.error("=".repeat(50));
  // Give time for logs to flush
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error("=".repeat(50));
  console.error("❌ UNHANDLED PROMISE REJECTION");
  console.error("=".repeat(50));
  console.error("Reason:", reason);
  console.error("Promise:", promise);
  if (reason && reason.stack) {
    console.error("Stack:", reason.stack);
  }
  console.error("=".repeat(50));
  // Don't exit on unhandled rejection - log and continue
});

const http = require("http");
let app, setupSocket, initializeProducer, initializeConsumer, kafkaConsumerService;

try {
  console.log("📦 Loading application modules...");
  app = require("./app.js");
  console.log("✅ app.js loaded");
  
  setupSocket = require("./sockets/index.js").setupSocket;
  console.log("✅ sockets/index.js loaded");
  
  initializeProducer = require("./config/kafka").initializeProducer;
  initializeConsumer = require("./config/kafka").initializeConsumer;
  console.log("✅ kafka config loaded");
  
  kafkaConsumerService = require("./services/kafkaConsumer");
  console.log("✅ kafkaConsumer service loaded");
  
  require("dotenv").config();
  console.log("✅ dotenv configured");
  
  // Initialize Cloudinary
  require("./config/cloudinary");
  console.log("✅ cloudinary config loaded");
  
  console.log("✅ All modules loaded successfully");
} catch (requireError) {
  console.error("=".repeat(50));
  console.error("❌ ERROR: Failed to load required modules!");
  console.error("=".repeat(50));
  console.error("Error message:", requireError.message);
  console.error("Error name:", requireError.name);
  console.error("Error code:", requireError.code);
  console.error("");
  console.error("Stack trace:");
  console.error(requireError.stack);
  console.error("");
  console.error("This usually means:");
  console.error("1. node_modules is missing - run 'npm install --production'");
  console.error("2. A dependency is missing from package.json");
  console.error("3. There's a syntax error in the code");
  console.error("4. Environment variables are missing (check Azure App Settings)");
  console.error("=".repeat(50));
  // Give time for logs to flush before exiting
  setTimeout(() => process.exit(1), 2000);
}

// For iisnode, PORT is automatically set by Azure/IIS via environment variable
// Use default 8000 only for local development (should never happen in Azure)
const PORT = process.env.PORT || process.env.IISNODE_HTTP_PORT || 8000;

// Log startup information for debugging
console.log("=".repeat(50));
console.log("🚀 Starting MayaCode Backend Server");
console.log("=".repeat(50));
console.log(`📋 PORT: ${PORT}`);
console.log(`📋 NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`📋 Working Directory: ${process.cwd()}`);
console.log(`📋 __dirname: ${__dirname}`);
console.log(`📋 Node.js Version: ${process.version}`);
console.log(`📋 Process PID: ${process.pid}`);
console.log("=".repeat(50));

const server = http.createServer(app);

// Add error handling for server startup
server.on('error', (error) => {
  console.error("❌ Server error:", error);
  if (error.code === 'EADDRINUSE') {
    console.error("Port", PORT, "is already in use");
  }
});

// Initialize services with fallback for Kafka/Redis
async function initializeServices() {
  try {
    console.log("🚀 Initializing MayaCode Services...");
    
    // Try to initialize Kafka (with fallback)
    if (initializeProducer && initializeConsumer && kafkaConsumerService) {
      try {
        await initializeProducer();
        await initializeConsumer();
        await kafkaConsumerService.startConsuming();
        
        const messageService = require("./services/messageService");
        messageService.startBufferFlushing();
        
        console.log("✅ Kafka services initialized successfully");
      } catch (kafkaError) {
        console.log("⚠️ Kafka services unavailable, continuing without them...");
        console.log("💡 To enable Kafka: Create topics 'chat-messages' and 'message-persistence'");
      }
    } else {
      console.log("⚠️ Kafka modules not available, skipping Kafka initialization");
    }
    
    console.log("✅ Core services initialized");
    console.log("📧 Email OTP Authentication is ready!");
    console.log("🔗 Test endpoints:");
    console.log("   POST /auth/request-otp");
    console.log("   POST /auth/verify-otp");
    console.log("   GET /auth/verify-token");
    
    // Setup socket (will work even without Redis)
    if (setupSocket) {
      setupSocket(server);
    }
    
  } catch (error) {
    console.error("❌ Failed to initialize services:", error);
    // Don't exit, let authentication work
    console.log("⚠️ Continuing with limited functionality...");
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log("\n🛑 Shutting down gracefully...");
  
  try {
    // Stop Kafka consumer if available
    if (kafkaConsumerService && typeof kafkaConsumerService.stopConsuming === 'function') {
      await kafkaConsumerService.stopConsuming();
    }
    
    // Flush any remaining messages if available
    try {
      const messageService = require("./services/messageService");
      if (messageService && typeof messageService.flushBuffer === 'function') {
        await messageService.flushBuffer();
      }
    } catch (msgError) {
      console.warn("⚠️ Could not flush messages:", msgError.message);
    }
    
    console.log("✅ Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

// Start the server
// For iisnode, listen on the PORT provided by IIS (no host binding needed)
server.listen(PORT, () => {
  console.log(`🌐 Server running on PORT: ${PORT}`);
  console.log(`✅ Node.js process started successfully`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Working directory: ${process.cwd()}`);
}).on('error', (error) => {
  console.error("❌ Failed to start server:", error);
  console.error("Error code:", error.code);
  console.error("Error message:", error.message);
  process.exit(1);
});

// Initialize all services
initializeServices();
