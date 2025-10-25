const http = require("http");
const app = require("./app.js");
const { setupSocket } = require("./sockets/index.js");
const { initializeProducer, initializeConsumer } = require("./config/kafka");
const kafkaConsumerService = require("./services/kafkaConsumer");
require("dotenv").config()

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

// Initialize services with fallback for Kafka/Redis
async function initializeServices() {
  try {
    console.log("🚀 Initializing MayaCode Services...");
    
    // Try to initialize Kafka (with fallback)
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
    
    console.log("✅ Core services initialized");
    console.log("📧 Email OTP Authentication is ready!");
    console.log("🔗 Test endpoints:");
    console.log("   POST /auth/request-otp");
    console.log("   POST /auth/verify-otp");
    console.log("   GET /auth/verify-token");
    
    // Setup socket (will work even without Redis)
    setupSocket(server);
    
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
server.listen(PORT, () => {
  console.log(`🌐 Server running on PORT: ${PORT}`);
});

// Initialize all services
initializeServices();
