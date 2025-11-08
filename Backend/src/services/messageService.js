const Message = require('../models/Message');
const { sendMessage, TOPICS } = require('../config/kafka');

class MessageService {
  constructor() {
    this.messageBuffer = [];
    this.batchSize = 50;
    this.flushInterval = 2000; // 2 seconds
  }

  // Send message to Kafka for processing
  async sendMessageToKafka(messageData) {
    try {
      const message = {
        id: this.generateMessageId(),
        roomId: messageData.roomId || 'general',
        senderId: messageData.senderId || 'anonymous',
        content: messageData.message,
        messageType: messageData.messageType || 'text',
        status: 'pending',
        recipients: messageData.recipients || [],
        metadata: {
          requiresDelivery: true,
          priority: messageData.priority || 'normal'
        },
        timestamp: new Date().toISOString()
      };

      // Send to Kafka for persistence
      await sendMessage(TOPICS.CHAT_MESSAGES, message, message.roomId);
      
      console.log(`📤 Message sent to Kafka: ${message.id}`);
      return message;
    } catch (error) {
      console.error('❌ Failed to send message to Kafka:', error);
      throw error;
    }
  }

  // Process messages from Kafka and store in MongoDB
  async processMessageFromKafka(messageData) {
    try {
      console.log(`💾 Processing message for MongoDB:`, messageData);
      const message = new Message({
        _id: messageData.id,
        roomId: messageData.roomId,
        senderId: messageData.senderId,
        content: messageData.content,
        messageType: messageData.messageType,
        status: messageData.status,
        recipients: messageData.recipients,
        metadata: messageData.metadata
      });

      await message.save();
      console.log(`💾 Message saved to MongoDB: ${messageData.id}`);
      return message;
    } catch (error) {
      console.error('❌ Failed to save message to MongoDB:', error);
      throw error;
    }
  }

  // Batch process messages for better performance
  async batchProcessMessages(messages) {
    if (messages.length === 0) return;

    try {
      console.log(`💾 Starting batch processing for ${messages.length} messages`);
      console.log(`💾 First message data:`, messages[0]);
      
      const bulkOps = messages.map(msg => ({
        insertOne: {
          document: {
            messageId: msg.id, // Use messageId instead of _id
            roomId: msg.roomId,
            senderId: msg.senderId,
            content: msg.content,
            messageType: msg.messageType,
            status: msg.status,
            recipients: msg.recipients,
            metadata: msg.metadata,
            createdAt: new Date(msg.timestamp),
            updatedAt: new Date(msg.timestamp)
          }
        }
      }));

      console.log(`💾 Bulk operations prepared:`, bulkOps.length);
      
      const result = await Message.bulkWrite(bulkOps, { ordered: false });
      console.log(`💾 Batch write result:`, result);
      
      // Check for validation errors
      if (result.mongoose && result.mongoose.validationErrors) {
        console.error('❌ Validation errors:', result.mongoose.validationErrors);
      }
      
      if (result.insertedCount === 0) {
        console.error('❌ No messages were inserted!');
                 // Try individual save to see the exact error
         try {
           const testMessage = new Message({
             messageId: messages[0].id,
             roomId: messages[0].roomId,
             senderId: messages[0].senderId,
             content: messages[0].content,
             messageType: messages[0].messageType,
             status: messages[0].status,
             recipients: messages[0].recipients,
             metadata: messages[0].metadata
           });
           await testMessage.save();
           console.log('✅ Individual save succeeded');
         } catch (individualError) {
           console.error('❌ Individual save failed:', individualError.message);
         }
      }
      
      console.log(`💾 Batch saved ${messages.length} messages to MongoDB`);
    } catch (error) {
      console.error('❌ Failed to batch save messages:', error);
      console.error('❌ Error details:', error.message);
      if (error.writeErrors) {
        console.error('❌ Write errors:', error.writeErrors);
      }
      throw error;
    }
  }

  // Get messages for a room
  async getMessagesByRoom(roomId, limit = 50, offset = 0) {
    try {
      const messages = await Message.find({ roomId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('❌ Failed to get messages by room:', error);
      throw error;
    }
  }

  // Get unread messages for a user
  async getUnreadMessages(userId, limit = 100) {
    try {
      const messages = await Message.find({
        recipients: userId,
        status: { $ne: 'delivered' }
      })
        .sort({ createdAt: 1 })
        .limit(limit)
        .lean();

      return messages;
    } catch (error) {
      console.error('❌ Failed to get unread messages:', error);
      throw error;
    }
  }

  // Update message status
  async updateMessageStatus(messageId, status) {
    try {
      await Message.findByIdAndUpdate(messageId, { status });
      console.log(`📝 Updated message status: ${messageId} -> ${status}`);
    } catch (error) {
      console.error('❌ Failed to update message status:', error);
      throw error;
    }
  }

  // Mark messages as delivered for a user
  async markMessagesAsDelivered(userId, messageIds) {
    try {
      await Message.updateMany(
        {
          _id: { $in: messageIds },
          recipients: userId
        },
        { status: 'delivered' }
      );
      console.log(`📝 Marked ${messageIds.length} messages as delivered for user: ${userId}`);
    } catch (error) {
      console.error('❌ Failed to mark messages as delivered:', error);
      throw error;
    }
  }

  // Generate unique message ID
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add message to buffer for batch processing
  addToBuffer(message) {
    this.messageBuffer.push(message);
    
    if (this.messageBuffer.length >= this.batchSize) {
      this.flushBuffer();
    }
  }

  // Flush message buffer
  async flushBuffer() {
    if (this.messageBuffer.length === 0) return;

    const messagesToProcess = [...this.messageBuffer];
    this.messageBuffer = [];

    try {
      await this.batchProcessMessages(messagesToProcess);
    } catch (error) {
      console.error('❌ Failed to flush message buffer:', error);
      // Could implement retry logic or dead letter queue here
    }
  }

  // Start periodic buffer flushing
  startBufferFlushing() {
    setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);
  }
}

module.exports = new MessageService(); 