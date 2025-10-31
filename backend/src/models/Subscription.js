import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planType: {
    type: String,
    enum: ['basic', 'standard', 'premium', 'enterprise'],
    required: true
  },
  postsPerDay: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  amount: {
    type: Number,
    required: true
  },
  currencyCode: {
    type: String,
    required: true,
    default: 'USD'
  },
  currencySymbol: {
    type: String,
    required: true,
    default: '$'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'qr_code', 'paypal', 'manual'],
    default: 'upi'
  },
  transactionId: {
    type: String
  },
  transactionScreenshot: {
    type: String // URL to uploaded screenshot
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  paymentVerifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  paymentVerifiedAt: {
    type: Date
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

subscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;

