const Post = require('../models/Post');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { uploadImagesToCloudinary } = require('../utils/cloudinaryUploader');

// Create a new post
exports.createPost = async (req, res) => {
  // IMMEDIATE LOGGING - This should always appear if request reaches controller
  console.log('🚀 CREATE POST CONTROLLER CALLED');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers content-type:', req.headers['content-type']);
  console.log('Request body keys:', Object.keys(req.body || {}));
  console.log('Request body size:', req.body ? JSON.stringify(req.body).length : 'no body');
  
  if (req.body.images) {
    console.log('Images field exists, count:', Array.isArray(req.body.images) ? req.body.images.length : 'not array');
    if (Array.isArray(req.body.images) && req.body.images.length > 0) {
      console.log('First image preview:', req.body.images[0] ? req.body.images[0].substring(0, 100) + '...' : 'empty');
    }
  }
  
  console.log(`HTTP ${req.method} ${req.url} - Create Post`);
  console.log('Request body:', req.body);
  console.log('Uploaded files:', req.files ? req.files.length : 'none');
  
  try {
    let body = { ...req.body };
    console.log('Post body before processing:', JSON.stringify({
      ...body,
      images: body.images ? `[${body.images.length} image(s)]` : 'none'
    }));
    
    // Handle images - either from base64 (current frontend) or file uploads (multer)
    if (req.files && req.files.length > 0) {
      console.log('🖼️ Processing uploaded files...');
      console.log('Number of files:', req.files.length);
      
      // Convert uploaded files to base64 for Cloudinary
      const base64Images = req.files.map(file => {
        const base64 = file.buffer.toString('base64');
        return `data:${file.mimetype};base64,${base64}`;
      });
      
      try {
        body.images = await uploadImagesToCloudinary(base64Images);
        console.log('✅ Images uploaded successfully to Cloudinary');
        console.log('Cloudinary URLs:', body.images);
      } catch (uploadError) {
        console.error('❌ Error uploading to Cloudinary:', uploadError);
        throw uploadError;
      }
    } else if (body.images && Array.isArray(body.images) && body.images.length > 0) {
      console.log('🖼️ Processing base64 images...');
      console.log('Number of images:', body.images.length);
      
      try {
        body.images = await uploadImagesToCloudinary(body.images);
        console.log('✅ Images uploaded successfully to Cloudinary');
        console.log('Cloudinary URLs:', body.images);
      } catch (uploadError) {
        console.error('❌ Error uploading to Cloudinary:', uploadError);
        throw uploadError;
      }
    } else {
      console.log('ℹ️ No images to upload');
    }
    
    console.log('📝 Creating post in MongoDB...');
    const post = new Post(body);
    await post.save();
    console.log('✅ Post created successfully in MongoDB');
    res.status(201).json(post);
  } catch (error) {
    console.error('❌ Error creating post:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      errors: error.errors
    });
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message || 'Something went wrong!' });
    }
  }
};

// Get all posts
exports.getPosts = async (req, res) => {
  console.log(`HTTP ${req.method} ${req.url} - Get Posts`, req.query);
  try {
    const { type } = req.query; // Get the type from query parameters
    let query = {};

    if (type) {
      // Add type filter to the query if type is provided
      query.type = type;
    }

    const posts = await Post.find(query).sort({ createdAt: -1 }); // Apply the query
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single post
exports.getPost = async (req, res) => {
  console.log(`HTTP ${req.method} ${req.url} - Get Post`, req.params);
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  console.log(`HTTP ${req.method} ${req.url} - Update Post`, req.params, req.body);
  try {
    const { id } = req.params;
    
    const post = await Post.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  console.log(`HTTP ${req.method} ${req.url} - Delete Post`, req.params);
  try {
    const { id } = req.params;
    
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get posts by phone
exports.getUserPosts = async (req, res) => {
  console.log(`HTTP ${req.method} ${req.url} - Get User Posts`, req.params);
  try {
    const { phone } = req.params;
    
    const posts = await Post.find({ phone }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get post images (lazy loading support)
exports.getPostImages = async (req, res) => {
  console.log(`HTTP ${req.method} ${req.url} - Get Post Images`, req.params);
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json({ images: post.images || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 