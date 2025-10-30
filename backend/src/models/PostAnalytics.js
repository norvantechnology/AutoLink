import mongoose from 'mongoose';

const postAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GeneratedPost',
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  },
  // Content metrics
  contentLength: {
    type: Number
  },
  sentenceCount: {
    type: Number
  },
  emojiCount: {
    type: Number
  },
  tone: {
    type: String,
    enum: ['professional', 'casual', 'inspirational', 'educational', 'humorous']
  },
  // Image metrics
  imageStyle: {
    type: String
  },
  hasImage: {
    type: Boolean,
    default: false
  },
  // Hashtags
  hashtags: [{
    type: String
  }],
  hashtagCount: {
    type: Number
  },
  // Engagement (updated periodically)
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  // Performance score (calculated)
  engagementRate: {
    type: Number,
    default: 0
  },
  performanceScore: {
    type: Number,
    default: 0
  },
  // Timing
  publishTime: {
    type: String
  },
  dayOfWeek: {
    type: Number // 0-6 (Sunday-Saturday)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate performance score
postAnalyticsSchema.methods.calculatePerformanceScore = function() {
  const totalEngagement = this.likes + (this.comments * 3) + (this.shares * 5);
  this.engagementRate = this.impressions > 0 ? (totalEngagement / this.impressions) * 100 : 0;
  this.performanceScore = totalEngagement;
  return this.performanceScore;
};

// Indexes for fast queries
postAnalyticsSchema.index({ userId: 1, performanceScore: -1 });
postAnalyticsSchema.index({ userId: 1, topicId: 1 });
postAnalyticsSchema.index({ userId: 1, createdAt: -1 });

const PostAnalytics = mongoose.model('PostAnalytics', postAnalyticsSchema);

export default PostAnalytics;

