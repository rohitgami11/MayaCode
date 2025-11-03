const { consumer, TOPICS } = require('../config/kafka');
const messageService = require('./messageService');

class KafkaConsumerService {
  constructor() {
    this.isRunning = false;
    this.messageBuffer = [];
    this.batchSize = 50;
    this.flushInterval = 2000; // 2 seconds
  }

  // Start consuming messages from Kafka
  async startConsuming() {
    if (this.isRunning) {
      console.log('⚠️ Kafka consumer is already running');
      return;
    }

    if (!consumer) {
      throw new Error('Kafka consumer not configured. Set KAFKA_BROKERS environment variable.');
    }

    try {
      // Subscribe to chat messages topic
      await consumer.subscribe({ 
        topic: TOPICS.CHAT_MESSAGES,
        fromBeginning: false // Start from latest messages
      });

      console.log(`📥 Subscribed to Kafka topic: ${TOPICS.CHAT_MESSAGES}`);

      // Start consuming messages
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            console.log(`📥 Raw Kafka message received:`, message.value.toString());
            const messageData = JSON.parse(message.value.toString());
            console.log(`📥 Parsed message from Kafka: ${messageData.id}`);
            
            // Add to buffer for batch processing
            this.addToBuffer(messageData);
          } catch (error) {
            console.error('❌ Error processing Kafka message:', error);
          }
        }
      });

      this.isRunning = true;
      console.log('✅ Kafka consumer started successfully');

      // Start periodic buffer flushing
      this.startBufferFlushing();

    } catch (error) {
      console.error('❌ Failed to start Kafka consumer:', error);
      throw error;
    }
  }

  // Stop consuming messages
  async stopConsuming() {
    if (!this.isRunning) {
      console.log('⚠️ Kafka consumer is not running');
      return;
    }

    try {
      // Flush any remaining messages
      await this.flushBuffer();
      
      // Disconnect consumer
      await consumer.disconnect();
      
      this.isRunning = false;
      console.log('✅ Kafka consumer stopped successfully');
    } catch (error) {
      console.error('❌ Failed to stop Kafka consumer:', error);
      throw error;
    }
  }

  // Add message to buffer
  addToBuffer(messageData) {
    this.messageBuffer.push(messageData);
    
    // Flush if buffer is full
    if (this.messageBuffer.length >= this.batchSize) {
      this.flushBuffer();
    }
  }

  // Flush message buffer to MongoDB
  async flushBuffer() {
    if (this.messageBuffer.length === 0) return;

    const messagesToProcess = [...this.messageBuffer];
    this.messageBuffer = [];

    try {
      console.log(`💾 Processing ${messagesToProcess.length} messages from buffer`);
      
      // Use batch processing for better performance
      await messageService.batchProcessMessages(messagesToProcess);
      
      console.log(`✅ Successfully processed ${messagesToProcess.length} messages`);
    } catch (error) {
      console.error('❌ Failed to process message buffer:', error);
      
      // Could implement retry logic or dead letter queue here
      // For now, we'll log the error and continue
    }
  }

  // Start periodic buffer flushing
  startBufferFlushing() {
    setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);
  }

  // Get consumer status
  getStatus() {
    return {
      isRunning: this.isRunning,
      bufferSize: this.messageBuffer.length,
      batchSize: this.batchSize,
      flushInterval: this.flushInterval
    };
  }
}

module.exports = new KafkaConsumerService(); 