const { Kafka } = require('kafkajs');
const fs = require('fs');
const path = require('path');

// Create Kafka instance only if KAFKA_BROKERS is configured
let kafka = null;
if (process.env.KAFKA_BROKERS) {
  kafka = new Kafka({
    brokers: [process.env.KAFKA_BROKERS],
    ssl: {
      ca: [process.env.KAFKA_CA_CERTIFICATE],
      rejectUnauthorized: false,
    },
    sasl: {
      mechanism: "plain",
      username: process.env.KAFKA_SASL_USERNAME,
      password: process.env.KAFKA_SASL_PASSWORD
    }
  });
} else {
  console.warn('⚠️ KAFKA_BROKERS not configured. Kafka will not be available.');
}

// Producer for sending messages to Kafka (only if Kafka is configured)
let producer = null;
let consumer = null;

if (kafka) {
  producer = kafka.producer({
    allowAutoTopicCreation: true,
    transactionTimeout: 30000
  });

  // Consumer for processing messages from Kafka
  consumer = kafka.consumer({
    groupId: process.env.KAFKA_CONSUMER_GROUP_ID || 'mayacode-chat-group',
    retry: {
      initialRetryTime: 100,
      retries: 8
    }
  });
}

// Topic names
const TOPICS = {
  CHAT_MESSAGES: process.env.KAFKA_TOPIC_CHAT_MESSAGES || 'chat-messages',
  MESSAGE_PERSISTENCE: process.env.KAFKA_TOPIC_MESSAGE_PERSISTENCE || 'message-persistence'
};

// Initialize producer
const initializeProducer = async () => {
  if (!producer) {
    throw new Error('Kafka producer not configured. Set KAFKA_BROKERS environment variable.');
  }
  try {
    await producer.connect();
    console.log('✅ Kafka producer connected successfully');
    console.log(`📡 Kafka brokers: ${process.env.KAFKA_BROKERS || 'localhost:9092'}`);
    if (process.env.KAFKA_SASL_USERNAME) {
      console.log(`🔐 Kafka authentication: ${process.env.KAFKA_SASL_USERNAME}`);
    }
  } catch (error) {
    console.error('❌ Failed to connect Kafka producer:', error);
    throw error;
  }
};

// Initialize consumer
const initializeConsumer = async () => {
  if (!consumer) {
    throw new Error('Kafka consumer not configured. Set KAFKA_BROKERS environment variable.');
  }
  try {
    await consumer.connect();
    console.log('✅ Kafka consumer connected successfully');
  } catch (error) {
    console.error('❌ Failed to connect Kafka consumer:', error);
    throw error;
  }
};

// Send message to Kafka
const sendMessage = async (topic, message, key = null) => {
  if (!producer) {
    console.warn('⚠️ Kafka producer not configured. Message not sent.');
    return;
  }
  try {
    await producer.send({
      topic,
      messages: [{
        key: key || message.roomId || 'default',
        value: JSON.stringify(message)
      }]
    });
    console.log(`📤 Message sent to Kafka topic: ${topic}`);
  } catch (error) {
    console.error('❌ Failed to send message to Kafka:', error);
    throw error;
  }
};

// Disconnect producer
const disconnectProducer = async () => {
  if (!producer) return;
  try {
    await producer.disconnect();
    console.log('✅ Kafka producer disconnected');
  } catch (error) {
    console.error('❌ Failed to disconnect Kafka producer:', error);
  }
};

// Disconnect consumer
const disconnectConsumer = async () => {
  if (!consumer) return;
  try {
    await consumer.disconnect();
    console.log('✅ Kafka consumer disconnected');
  } catch (error) {
    console.error('❌ Failed to disconnect Kafka consumer:', error);
  }
};

module.exports = {
  kafka,
  producer,
  consumer,
  TOPICS,
  initializeProducer,
  initializeConsumer,
  sendMessage,
  disconnectProducer,
  disconnectConsumer
}; 