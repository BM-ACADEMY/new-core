const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  orderId: { type: String, required: true }, // Razorpay Order ID
  paymentId: { type: String }, // Razorpay Payment ID (filled after success)
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['created', 'active', 'failed', 'expired'],
    default: 'created'
  },
  startDate: { type: Date },
  endDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
