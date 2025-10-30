import mongoose from 'mongoose';

// Single source of truth for base pricing (in USD)
const pricingSchema = new mongoose.Schema({
  postsPerDay: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 5
  },
  basePriceUSD: {
    type: Number,
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  planType: {
    type: String,
    enum: ['basic', 'standard', 'premium', 'enterprise'],
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

pricingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to calculate price in any currency
pricingSchema.statics.calculatePrice = function(basePriceUSD, conversionRate) {
  return Math.round(basePriceUSD * conversionRate);
};

const Pricing = mongoose.model('Pricing', pricingSchema);

export default Pricing;

