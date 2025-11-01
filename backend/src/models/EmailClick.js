import mongoose from 'mongoose';

const emailClickSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  source: {
    type: String,
    default: 'email'
  },
  campaign: {
    type: String,
    default: 'automation'
  },
  clickedAt: {
    type: Date,
    default: Date.now
  },
  emailSentTimestamp: {
    type: Number // Timestamp from email tracking param
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  browser: {
    type: String
  },
  device: {
    type: String // mobile, desktop, tablet
  },
  os: {
    type: String
  },
  country: {
    type: String
  },
  city: {
    type: String
  },
  referrer: {
    type: String
  },
  landingPage: {
    type: String,
    default: 'home'
  },
  // Track if user signed up after clicking
  convertedToUser: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Additional metadata
  metadata: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
emailClickSchema.index({ email: 1, clickedAt: -1 });
emailClickSchema.index({ campaign: 1, clickedAt: -1 });
emailClickSchema.index({ createdAt: -1 });

const EmailClick = mongoose.model('EmailClick', emailClickSchema);

export default EmailClick;

