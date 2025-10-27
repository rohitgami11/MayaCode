const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// Get image by category and number
router.get('/:category/:number', imageController.getImage);

// List all images for a category
router.get('/:category', imageController.listImages);

module.exports = router;

