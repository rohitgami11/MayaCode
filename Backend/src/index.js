// Add error handling for missing dependencies
try {
  // Check if node_modules exists
  const fs = require("fs");
  const path = require("path");
  if (!fs.existsSync(path.join(__dirname, "../../node_modules"))) {
    console.error("❌ ERROR: node_modules directory not found!");
    console.error("Please run 'npm install --production' in the deployment directory");
    console.error("Expected location: " + path.join(__dirname, "../../node_modules"));
    process.exit(1);
  }
} catch (checkError) {
  console.error("❌ Error checking for node_modules:", checkError.message);
}

const http = require("http");
let app, setupSocket, initializeProducer, initializeConsumer, kafkaConsumerService;

try {
  app = require("./app.js");
  setupSocket = require("./sockets/index.js").setupSocket;
  initializeProducer = require("./config/kafka").initializeProducer;
  initializeConsumer = require("./config/kafka").initializeConsumer;
  kafkaConsumerService = require("./services/kafkaConsumer");
  require("dotenv").config();
  
  // Initialize Cloudinary
  require("./config/cloudinary");
} catch (requireError) {
  console.error("❌ ERROR: Failed to load required modules!");
  console.error("Error:", requireError.message);
  console.error("Stack:", requireError.stack);
  console.error("");
  console.error("This usually means:");
  console.error("1. node_modules is missing - run 'npm install --production'");
  console.error("2. A dependency is missing from package.json");
  console.error("3. There's a syntax error in the code");
  process.exit(1);
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
console.log(`📋 Node.js Version: ${process.version}`);
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
    // Stop Kafka consumer
    await kafkaConsumerService.stopConsuming();
    
    // Flush any remaining messages
    const messageService = require("./services/messageService");
    await messageService.flushBuffer();
    
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
