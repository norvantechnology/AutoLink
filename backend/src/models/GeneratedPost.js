import mongoose from 'mongoose';

const generatedPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required']
  },
  imageUrl: {
    type: String
  },
  hashtags: [{
    type: String,
    trim: true
  }],
  scheduledPublishTime: {
    type: String, // Format: "09:00" - When this post should be published
    required: true
  },
  status: {
    type: String,
    enum: ['generated', 'published', 'failed'],
    default: 'generated'
  },
  linkedInPostId: {
    type: String
  },
  linkedInPostUrl: {
    type: String
  },
  engagement: {
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    impressions: {
      type: Number,
      default: 0
    }
  },
  postedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
generatedPostSchema.index({ userId: 1, createdAt: -1 });
generatedPostSchema.index({ topicId: 1 });

const GeneratedPost = mongoose.model('GeneratedPost', generatedPostSchema);

export default GeneratedPost;
