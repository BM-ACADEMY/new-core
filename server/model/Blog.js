const mongoose = require('mongoose');

// Sub-schema for each content block
const contentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'heading',
      'paragraph',
      'image',
      'list',
      'quote',      
      'button',   
      'accordion',  
      'feature'
    ]
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Flexible object to store block-specific data
    required: true
  }
});

// Main Blog Schema
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  tags: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  coverImage: {
    url: {
      type: String,
      required: true
    },
    altText: {
      type: String
    }
  },
  contentBlocks: [contentBlockSchema], // Array of blocks with validated types

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for better performance
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('BlogPost', blogSchema);