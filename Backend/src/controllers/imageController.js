const path = require('path');
const fs = require('fs');

// Serve images by category and number
exports.getImage = async (req, res) => {
  try {
    const { category, number } = req.params;
    
    // Define image categories and their file paths
    const imageCategories = {
      'help-posts': 'help-posts',
      'stories': 'stories',
      'unity': 'unity',
      'inspirational': 'help-posts' // Can use help-posts placements
    };
    
    // Get the category folder
    const categoryFolder = imageCategories[category];
    if (!categoryFolder) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Construct the image path - assuming files are named like help-posts2.png for number 2
    let imagePath;
    if (number === 1) {
      imagePath = path.join(__dirname, '..', '..', 'public', 'images', `${categoryFolder}.png`);
    } else {
      imagePath = path.join(__dirname, '..', '..', 'public', 'images', `${categoryFolder}${number}.png`);
    }
    
    // Check if image exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: 'Image not found', path: imagePath });
    }
    
    // Send the image without any transformation
    res.type('image/png');
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ message: 'Error serving image' });
  }
};

// List available images for a category
exports.listImages = async (req, res) => {
  try {
    const { category } = req.params;
    
    const imageCategories = {
      'help-posts': 'help-posts',
      'stories': 'stories',
      'unity': 'unity',
      'inspirational': 'help-posts'
    };
    
    const categoryFolder = imageCategories[category];
    if (!categoryFolder) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const categoryPath = path.join(__dirname, '..', '..', 'public', 'images', categoryFolder);
    
    if (!fs.existsSync(categoryPath)) {
      return res.json({ images: [], category, count: 0 });
    }
    
    // Read directory and filter for images
    const files = fs.readdirSync(categoryPath);
    const images = files
      .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
      .map(file => ({
        filename: file,
        url: `/api/images/${category}/${file.replace(/\.(png|jpg|jpeg)$/i, '')}`
      }));
    
    res.json({ images, category, count: images.length });
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({ message: 'Error listing images' });
  }
};

