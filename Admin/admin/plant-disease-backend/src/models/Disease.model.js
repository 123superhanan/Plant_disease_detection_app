const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Disease name is required'],
    unique: true,
    trim: true
  },
  scientificName: String,
  description: String,
  symptoms: [String],
  causes: [String],
  treatment: [String],
  prevention: [String],
  affectedPlants: [String],
  images: [String],
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'severe'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Disease', diseaseSchema);