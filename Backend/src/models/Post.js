const mongoose = require('mongoose');

// Location Schema
const locationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  }
});

const postSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Offer Help', 'Ask for Help', 'Story'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  location: {
    type: locationSchema,
    required: function() {
      return this.type !== 'Story';
    }
  },
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  expiresAt: Date
}, {
  timestamps: true
});

// Add validation for required fields based on post type
postSchema.pre('validate', function(next) {
  if (!this.title || !this.content) {
    next(new Error('Title and content are required'));
  }
  if (this.type !== 'Story' && !this.location) {
    next(new Error('Location is required for Offer Help and Ask for Help posts'));
  }
  next();
});

module.exports = mongoose.model('Post', postSchema); 