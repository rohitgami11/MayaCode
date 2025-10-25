const http = require("http");
const app = require("./app.js");
const { setupSocket } = require("./sockets/index.js");
const { initializeProducer, initializeConsumer } = require("./config/kafka");
const kafkaConsumerService = require("./services/kafkaConsumer");
require("dotenv").config()

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

// Initialize Kafka and start services
async function initializeServices() {
  try {
    console.log("🚀 Initializing MayaCode Chat Services...");
    
    // Initialize Kafka producer
    await initializeProducer();
    
    // Initialize Kafka consumer
    await initializeConsumer();
    
    // Start Kafka consumer service
    await kafkaConsumerService.startConsuming();
    
    // Start message service buffer flushing
    const messageService = require("./services/messageService");
    messageService.startBufferFlushing();
    
    console.log("✅ All services initialized successfully");
    console.log("📧 Email OTP Authentication is ready!");
    console.log("🔗 Test endpoints:");
    console.log("   POST /auth/request-otp");
    console.log("   POST /auth/verify-otp");
    console.log("   GET /auth/verify-token");
    
    // Setup socket after services are ready
    setupSocket(server);
    
  } catch (error) {
    console.error("❌ Failed to initialize services:", error);
    process.exit(1);
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
