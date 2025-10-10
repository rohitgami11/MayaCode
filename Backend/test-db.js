const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import Message model
const Message = require('./src/models/Message');

async function testDatabase() {
  try {
    console.log('🧪 Testing database...');
    
    // Get all messages
    const allMessages = await Message.find({}).lean();
    console.log(`📊 Total messages in database: ${allMessages.length}`);
    
    if (allMessages.length > 0) {
      console.log('📝 Sample message:', JSON.stringify(allMessages[0], null, 2));
    }
    
    // Get messages for test-room-1
    const roomMessages = await Message.find({ roomId: 'test-room-1' }).lean();
    console.log(`📊 Messages in test-room-1: ${roomMessages.length}`);
    
    if (roomMessages.length > 0) {
      console.log('📝 Room message:', JSON.stringify(roomMessages[0], null, 2));
    }
    
    // Check for any messages with different roomId
    const otherRooms = await Message.distinct('roomId');
    console.log('🏠 All room IDs in database:', otherRooms);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testDatabase(); 