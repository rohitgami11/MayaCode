const express = require('express');
const multer = require('multer');
const router = express.Router();
const postController = require('../controllers/postController');

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory for Cloudinary upload
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Add detailed logging middleware
router.use((req, res, next) => {
  console.log(`📨 POST ROUTE: ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
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
router.post('/', upload.array('images', 5), postController.createPost); // Allow up to 5 images
router.get('/', postController.getPosts);
router.get('/:id/images', postController.getPostImages); // Lazy load images endpoint (must be before /:id)
router.get('/:id', postController.getPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

// User posts route
router.get('/phone/:phone', postController.getUserPosts);

module.exports = router; 