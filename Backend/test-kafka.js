const { producer, consumer, TOPICS, initializeProducer, initializeConsumer } = require('./src/config/kafka');

async function testKafka() {
  try {
    console.log('🧪 Testing Kafka connection...');
    
    // Initialize producer and consumer
    await initializeProducer();
    await initializeConsumer();
    
    // Subscribe to topic
    await consumer.subscribe({ 
      topic: TOPICS.CHAT_MESSAGES,
      fromBeginning: false
    });
    
    console.log(`📥 Subscribed to topic: ${TOPICS.CHAT_MESSAGES}`);
    
    // Start consuming
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(`📥 Received message:`, message.value.toString());
      }
    });
    
    console.log('✅ Consumer started');
    
    // Send a test message
    const testMessage = {
      id: 'test_msg_123',
      roomId: 'test-room',
      senderId: 'test-user',
      content: 'Test message from Kafka test',
      messageType: 'text',
      status: 'pending',
      recipients: ['user1'],
      metadata: { requiresDelivery: true, priority: 'normal' },
      timestamp: new Date().toISOString()
    };
    
    await producer.send({
      topic: TOPICS.CHAT_MESSAGES,
      messages: [{
        key: 'test-key',
        value: JSON.stringify(testMessage)
      }]
    });
    
    console.log('📤 Test message sent');
    
    // Wait a bit for the message to be consumed
    setTimeout(async () => {
      console.log('🛑 Stopping test...');
      await consumer.disconnect();
      await producer.disconnect();
      process.exit(0);
    }, 3000);
    
  } catch (error) {
    console.error('❌ Kafka test failed:', error);
    process.exit(1);
  }
}

testKafka(); 