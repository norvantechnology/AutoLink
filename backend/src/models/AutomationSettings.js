import mongoose from 'mongoose';

const automationSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  postsPerDay: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  enabled: {
    type: Boolean,
    default: true
  },
  contentCreationTime: {
    type: String, // Format: "08:00" - When AI generates all posts for the day
    default: "08:00"
  },
  publishTimes: [{
    type: String, // Format: ["09:00", "18:00"] - When posts are published
    required: true
  }],
  lastContentGenerationDate: {
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

// Validation: publishTimes array length should match postsPerDay
automationSettingsSchema.pre('save', function(next) {
  if (this.publishTimes.length !== this.postsPerDay) {
    next(new Error(`Number of publish times (${this.publishTimes.length}) must match posts per day (${this.postsPerDay})`));
  }
  this.updatedAt = Date.now();
  next();
});

const AutomationSettings = mongoose.model('AutomationSettings', automationSettingsSchema);

export default AutomationSettings;

