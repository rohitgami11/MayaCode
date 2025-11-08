const express = require('express');
const router = express.Router();
const messageService = require('../services/messageService');

// Get messages for a specific room
router.get('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    console.log(`📥 Getting messages for room: ${roomId}, limit: ${limit}, offset: ${offset}`);
    
    const messages = await messageService.getMessagesByRoom(
      roomId, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.json({
      success: true,
      data: messages,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: messages.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting room messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
});

// Get unread messages for a user
router.get('/unread/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 100 } = req.query;
    
    console.log(`📥 Getting unread messages for user: ${userId}`);
    
    const messages = await messageService.getUnreadMessages(userId, parseInt(limit));
    
    res.json({
      success: true,
      data: messages,
      count: messages.length
    });
    
  } catch (error) {
    console.error('❌ Error getting unread messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread messages',
      error: error.message
    });
  }
});

// Mark messages as delivered for a user
router.post('/delivered', async (req, res) => {
  try {
    const { userId, messageIds } = req.body;
    
    if (!userId || !messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: 'userId and messageIds array are required'
      });
    }
    
    console.log(`📝 Marking ${messageIds.length} messages as delivered for user: ${userId}`);
    
    await messageService.markMessagesAsDelivered(userId, messageIds);
    
    res.json({
      success: true,
      message: `Marked ${messageIds.length} messages as delivered`
    });
    
  } catch (error) {
    console.error('❌ Error marking messages as delivered:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as delivered',
      error: error.message
    });
  }
});

// Update message status
router.put('/:messageId/status', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'status is required'
      });
    }
    
    console.log(`📝 Updating message status: ${messageId} -> ${status}`);
    
    await messageService.updateMessageStatus(messageId, status);
    
    res.json({
      success: true,
      message: 'Message status updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating message status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message status',
      error: error.message
    });
  }
});

// Get message statistics
router.get('/stats/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const Message = require('../models/Message');
    
    const stats = await Message.aggregate([
      { $match: { roomId } },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          totalDelivered: { 
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          totalRead: { 
            $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalMessages: 0,
      totalDelivered: 0,
      totalRead: 0
    };
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('❌ Error getting message stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get message statistics',
      error: error.message
    });
  }
});

module.exports = router; 