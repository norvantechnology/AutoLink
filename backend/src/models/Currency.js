import mongoose from 'mongoose';

const currencySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  symbol: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  conversionRate: {
    type: Number,
    required: true,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Payment details per currency
  paymentMethod: {
    type: String,
    enum: ['upi', 'paypal', 'manual'],
    default: 'manual'
  },
  upiId: {
    type: String // For INR/UPI payments
  },
  paypalEmail: {
    type: String // For USD and other currencies - email for display/manual payments
  },
  paypalUsername: {
    type: String // PayPal.me username (without @ symbol)
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

currencySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Currency = mongoose.model('Currency', currencySchema);

export default Currency;
