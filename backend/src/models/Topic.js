import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Topic name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  tone: {
    type: String,
    enum: ['professional', 'casual', 'inspirational', 'educational', 'humorous'],
    default: 'professional'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
topicSchema.index({ userId: 1, name: 1 });

const Topic = mongoose.model('Topic', topicSchema);

export default Topic;

