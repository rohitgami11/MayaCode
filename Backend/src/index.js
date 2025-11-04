// CRITICAL: Wrap entire file execution to catch ANY errors
// This ensures we can log errors even if something fails before error handlers are set up
(function() {
  try {
    // IMMEDIATE STARTUP LOGGING - Write to stderr immediately to ensure iisnode captures it
    // Use process.stderr.write for immediate output that iisnode can capture
    process.stderr.write("==================================================\n");
    process.stderr.write("🚀 MayaCode Backend - Starting...\n");
    process.stderr.write("==================================================\n");
    process.stderr.write("📋 Node.js Version: " + process.version + "\n");
    process.stderr.write("📋 Process PID: " + process.pid + "\n");
    process.stderr.write("📋 Working Directory: " + process.cwd() + "\n");
    process.stderr.write("📋 __dirname: " + __dirname + "\n");
    process.stderr.write("==================================================\n");
    
    // Also write to console
    console.log("==================================================");
    console.log("🚀 MayaCode Backend - Starting...");
    console.log("==================================================");
    console.log("📋 Node.js Version:", process.version);
    console.log("📋 Process PID:", process.pid);
    console.log("📋 Working Directory:", process.cwd());
    console.log("📋 __dirname:", __dirname);
    console.log("==================================================");
    
    // Check Node.js version (using basic syntax for compatibility)
    var nodeVersion = process.version;
    var majorVersion = parseInt(nodeVersion.split('.')[0].substring(1), 10);
    
    if (majorVersion < 18) {
      console.error("==========================================");
      console.error("❌ FATAL ERROR: Node.js version too old!");
      console.error("Current version: " + nodeVersion);
      console.error("Required version: Node.js 18+ or 20+");
      console.error("");
      console.error("This application requires modern Node.js features.");
      console.error("Please set WEBSITE_NODE_DEFAULT_VERSION=20.11.1");
      console.error("And ensure Stack Settings use Node.js 20.x");
      console.error("==========================================");
      process.exit(1);
    }
  } catch (e) {
    // Last resort - try to write error to a file or use basic console
    try {
      const fs = require("fs");
      const path = require("path");
      const errorLogPath = path.join(__dirname, "../startup-error.log");
      fs.writeFileSync(errorLogPath, "Failed to write startup logs: " + e.toString() + "\n" + e.stack);
    } catch (fileError) {
      // If even file writing fails, we're in deep trouble
      // This should never happen, but it's a safety net
    }
  }
})();

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
// Use stderr.write for immediate output
process.on('uncaughtException', (error) => {
  process.stderr.write("=".repeat(50) + "\n");
  process.stderr.write("❌ UNCAUGHT EXCEPTION - Application will exit\n");
  process.stderr.write("=".repeat(50) + "\n");
  process.stderr.write(`Error: ${error.message}\n`);
  process.stderr.write(`Stack: ${error.stack}\n`);
  process.stderr.write("=".repeat(50) + "\n");
  // Also log to console
  console.error("=".repeat(50));
  console.error("❌ UNCAUGHT EXCEPTION - Application will exit");
  console.error("=".repeat(50));
  console.error("Error:", error.message);
  console.error("Stack:", error.stack);
  console.error("=".repeat(50));
  // Give time for logs to flush
  setTimeout(() => process.exit(1), 2000);
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
  process.stderr.write("📦 Loading application modules...\n");
  console.log("📦 Loading application modules...");
  
  app = require("./app.js");
  process.stderr.write("✅ app.js loaded\n");
  console.log("✅ app.js loaded");
  
  setupSocket = require("./sockets/index.js").setupSocket;
  process.stderr.write("✅ sockets/index.js loaded\n");
  console.log("✅ sockets/index.js loaded");
  
  initializeProducer = require("./config/kafka").initializeProducer;
  initializeConsumer = require("./config/kafka").initializeConsumer;
  process.stderr.write("✅ kafka config loaded\n");
  console.log("✅ kafka config loaded");
  
  kafkaConsumerService = require("./services/kafkaConsumer");
  process.stderr.write("✅ kafkaConsumer service loaded\n");
  console.log("✅ kafkaConsumer service loaded");
  
  require("dotenv").config();
  process.stderr.write("✅ dotenv configured\n");
  console.log("✅ dotenv configured");
  
  // Initialize Cloudinary
  require("./config/cloudinary");
  process.stderr.write("✅ cloudinary config loaded\n");
  console.log("✅ cloudinary config loaded");
  
  process.stderr.write("✅ All modules loaded successfully\n");
  console.log("✅ All modules loaded successfully");
} catch (requireError) {
  // Write to stderr immediately so iisnode captures it
  process.stderr.write("=".repeat(50) + "\n");
  process.stderr.write("❌ ERROR: Failed to load required modules!\n");
  process.stderr.write("=".repeat(50) + "\n");
  process.stderr.write(`Error message: ${requireError.message}\n`);
  process.stderr.write(`Error name: ${requireError.name}\n`);
  process.stderr.write(`Error code: ${requireError.code}\n`);
  process.stderr.write(`\nStack trace:\n${requireError.stack}\n`);
  process.stderr.write("=".repeat(50) + "\n");
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
let PORT = process.env.PORT || process.env.IISNODE_HTTP_PORT || 8000;

// Validate PORT is a number
PORT = parseInt(PORT, 10);
if (isNaN(PORT) || PORT <= 0 || PORT > 65535) {
  process.stderr.write("❌ ERROR: Invalid PORT value: " + (process.env.PORT || process.env.IISNODE_HTTP_PORT || "8000") + "\n");
  process.stderr.write("PORT must be a number between 1 and 65535\n");
  console.error("❌ ERROR: Invalid PORT value:", process.env.PORT || process.env.IISNODE_HTTP_PORT || "8000");
  console.error("PORT must be a number between 1 and 65535");
  process.exit(1);
}

process.stderr.write("📋 Using PORT: " + PORT + "\n");
console.log("📋 Using PORT:", PORT);

// Log startup information for debugging
// Use both stderr and console for maximum visibility
const startupInfo = [
  "=".repeat(50),
  "🚀 Starting MayaCode Backend Server",
  "=".repeat(50),
  `📋 PORT: ${PORT}`,
  `📋 NODE_ENV: ${process.env.NODE_ENV || 'not set'}`,
  `📋 Working Directory: ${process.cwd()}`,
  `📋 __dirname: ${__dirname}`,
  `📋 Node.js Version: ${process.version}`,
  `📋 Process PID: ${process.pid}`,
  "=".repeat(50)
].join("\n");

process.stderr.write(startupInfo + "\n");
console.log(startupInfo);

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
  const successMsg = [
    `🌐 Server running on PORT: ${PORT}`,
    `✅ Node.js process started successfully`,
    `📋 Environment: ${process.env.NODE_ENV || 'development'}`,
    `📁 Working directory: ${process.cwd()}`
  ].join("\n");
  
  process.stderr.write(successMsg + "\n");
  console.log(successMsg);
}).on('error', (error) => {
  const errorMsg = [
    "❌ Failed to start server:",
    `Error code: ${error.code}`,
    `Error message: ${error.message}`,
    `Stack: ${error.stack}`
  ].join("\n");
  
  process.stderr.write(errorMsg + "\n");
  console.error(errorMsg);
  process.exit(1);
});

// Initialize all services
initializeServices();
