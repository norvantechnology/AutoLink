import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Learned preferences from engagement data
  optimalContentLength: {
    type: Number,
    default: 200 // words
  },
  bestPerformingTone: {
    type: String,
    default: 'professional'
  },
  topHashtags: [{
    tag: String,
    avgEngagement: Number,
    timesUsed: Number
  }],
  bestImageStyles: [{
    style: String,
    avgEngagement: Number,
    description: String
  }],
  // Pattern learning
  successPatterns: {
    avgSentenceLength: { type: Number, default: 12 },
    avgEmojiCount: { type: Number, default: 2 },
    preferredStructure: { type: String, default: 'hook-content-cta' }
  },
  // Last updated
  lastAnalyzed: {
    type: Date
  },
  totalPostsAnalyzed: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);

export default UserPreferences;

