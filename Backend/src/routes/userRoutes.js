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
router.get('/phone/:phone', userController.getUserByPhone);
router.put('/phone/:phone', userController.createOrUpdateUser);
router.delete('/phone/:phone', userController.deleteUser);

// Profile routes (using JWT token)
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// User stats routes
router.put('/phone/:phone/stats', userController.updateUserStats);

// User posts routes
router.post('/phone/:phone/posts', userController.addCreatedPost);

// Preferences routes
router.put('/phone/:phone/preferences', userController.updatePreferences);
router.get('/phone/:phone/preferences', userController.getPreferences);

// Get all users
router.get('/', userController.getAllUsers);

module.exports = router; 