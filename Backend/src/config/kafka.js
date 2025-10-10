const { Kafka } = require('kafkajs');
const fs = require('fs');
const path = require('path');

// Create Kafka instance
const kafka = new Kafka({
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

// Producer for sending messages to Kafka
const producer = kafka.producer({
  allowAutoTopicCreation: true,
  transactionTimeout: 30000
});

// Consumer for processing messages from Kafka
const consumer = kafka.consumer({
  groupId: process.env.KAFKA_CONSUMER_GROUP_ID || 'mayacode-chat-group',
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

// Topic names
const TOPICS = {
  CHAT_MESSAGES: process.env.KAFKA_TOPIC_CHAT_MESSAGES || 'chat-messages',
  MESSAGE_PERSISTENCE: process.env.KAFKA_TOPIC_MESSAGE_PERSISTENCE || 'message-persistence'
};

// Initialize producer
const initializeProducer = async () => {
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
  try {
    await producer.disconnect();
    console.log('✅ Kafka producer disconnected');
  } catch (error) {
    console.error('❌ Failed to disconnect Kafka producer:', error);
  }
};

// Disconnect consumer
const disconnectConsumer = async () => {
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