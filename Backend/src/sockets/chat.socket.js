const messageService = require('../services/messageService');

module.exports = (io, socket, pub) => {
  socket.on("chat:send", async (data) => {
    try {
      console.log("📨 Received chat message:", data);
      
      // Create message data with additional context
      const messageData = {
        message: data.message,
        roomId: data.roomId || 'general',
        senderId: data.senderId || socket.id,
        messageType: data.messageType || 'text',
        recipients: data.recipients || [],
        priority: data.priority || 'normal'
      };

      // Send to Kafka for persistence (async, non-blocking)
      const kafkaMessage = await messageService.sendMessageToKafka(messageData);
      
      // Send to Redis for immediate delivery to online users (only if Redis is configured)
      if (pub) {
        pub.publish("CHAT_MESSAGES", JSON.stringify({
          ...data,
          id: kafkaMessage.id,
          timestamp: kafkaMessage.timestamp
        }));
      }

      // Send delivery confirmation to sender
      console.log("Message processed and sent to Kafka:", kafkaMessage.id);
      socket.emit("message:delivered", {
        id: kafkaMessage.id,
        message: data.message,
        timestamp: kafkaMessage.timestamp,
        status: 'sent'
      });

    } catch (error) {
      console.error("Error processing chat message:", error);
      
      // Send error notification to sender
      socket.emit("message:error", {
        message: "Failed to send message",
        error: error.message
      });
    }
  });

  // Handle message status updates
  socket.on("message:status", async (data) => {
    try {
      const { messageId, status } = data;
      await messageService.updateMessageStatus(messageId, status);
      console.log(`Updated message status: ${messageId} -> ${status}`);
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  });

  // Handle user joining a room
  socket.on("room:join", async (data) => {
    try {
      const { roomId, userId } = data;
      
      // Join the socket room
      socket.join(roomId);
      
      // Store user's room info in socket
      socket.roomId = roomId;
      socket.userId = userId;
      
      console.log(`User ${userId} joined room ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit("user:joined", {
        userId,
        roomId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("Error joining room:", error);
    }
  });

  // Handle user leaving a room
  socket.on("room:leave", async (data) => {
    try {
      const { roomId, userId } = data;
      
      // Leave the socket room
      socket.leave(roomId);
      
      console.log(`User ${userId} left room ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit("user:left", {
        userId,
        roomId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("Error leaving room:", error);
    }
  });

  // Handle user coming online
  socket.on("user:online", async (data) => {
    try {
      const { userId } = data;
      
      // Store user's online status
      socket.userId = userId;
      
      console.log(`User ${userId} is online`);
      
      // Get unread messages for this user
      const unreadMessages = await messageService.getUnreadMessages(userId);
      
      if (unreadMessages.length > 0) {
        console.log(`Sending ${unreadMessages.length} unread messages to user ${userId}`);
        
        // Send unread messages to user
        unreadMessages.forEach(msg => {
          socket.emit("chat:receive", {
            id: msg._id,
            message: msg.content,
            senderId: msg.senderId,
            roomId: msg.roomId,
            timestamp: msg.createdAt,
            status: 'delivered'
          });
        });

        // Mark messages as delivered
        const messageIds = unreadMessages.map(msg => msg._id);
        await messageService.markMessagesAsDelivered(userId, messageIds);
      }

    } catch (error) {
      console.error("Error handling user online:", error);
    }
  });
};
