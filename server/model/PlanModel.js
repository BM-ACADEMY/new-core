const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Pro Plan"
  price: { type: Number, required: true }, // e.g., 499
  resumeLimit: { type: Number, required: true }, // e.g., 10 or 100
  durationInDays: { type: Number, default: 30 }, // Validity
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
