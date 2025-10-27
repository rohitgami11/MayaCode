const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Add detailed logging middleware
router.use((req, res, next) => {
  next();
});

// Error handling middleware
router.use((err, req, res, next) => {
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

// Post routes
router.post('/', postController.createPost);
router.get('/', postController.getPosts);
router.get('/:id/images', postController.getPostImages); // Lazy load images endpoint (must be before /:id)
router.get('/:id', postController.getPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

// User posts route
router.get('/phone/:phone', postController.getUserPosts);

module.exports = router; 