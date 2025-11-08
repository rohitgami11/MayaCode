const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Add detailed logging middleware
router.use((req, res, next) => {
  console.log('Request Details:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    headers: req.headers,
    body: req.body
  });
  next();
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Route Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

// User profile routes
router.get('/email/:email', userController.getUserByEmail);
router.put('/email/:email', userController.createOrUpdateUser);
router.delete('/email/:email', userController.deleteUser);

// Profile routes (using JWT token)
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// User stats routes
router.put('/email/:email/stats', userController.updateUserStats);

// User posts routes
router.post('/email/:email/posts', userController.addCreatedPost);

// Preferences routes
router.put('/email/:email/preferences', userController.updatePreferences);
router.get('/email/:email/preferences', userController.getPreferences);

// Get all users
router.get('/', userController.getAllUsers);

module.exports = router; 