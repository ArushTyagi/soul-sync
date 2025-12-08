const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  content: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 5000
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Diary', diarySchema);