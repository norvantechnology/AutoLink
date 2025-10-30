import mongoose from 'mongoose';

const aiThreadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  threadId: {
    type: String,
    required: true
  },
  assistantId: {
    type: String
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  messagesCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AIThread = mongoose.model('AIThread', aiThreadSchema);

export default AIThread;

