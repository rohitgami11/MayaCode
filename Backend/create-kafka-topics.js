const { Kafka } = require('kafkajs');
require('dotenv').config();

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

const admin = kafka.admin();

async function createTopics() {
  try {
    console.log('🔗 Connecting to Kafka...');
    await admin.connect();
    console.log('✅ Connected to Kafka');

    const topics = [
      {
        topic: 'chat-messages',
        numPartitions: 3,
        replicationFactor: 3
      },
      {
        topic: 'message-persistence',
        numPartitions: 3,
        replicationFactor: 3
      }
    ];

    console.log('📝 Creating topics...');
    await admin.createTopics({
      topics: topics,
      waitForLeaders: true
    });

    console.log('✅ Topics created successfully!');
    console.log('📋 Created topics:');
    topics.forEach(topic => {
      console.log(`   - ${topic.topic} (${topic.numPartitions} partitions, ${topic.replicationFactor} replicas)`);
    });

  } catch (error) {
    console.error('❌ Error creating topics:', error);
  } finally {
    await admin.disconnect();
    console.log('🔌 Disconnected from Kafka');
  }
}

createTopics();
