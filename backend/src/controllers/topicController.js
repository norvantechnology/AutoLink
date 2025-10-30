import Topic from '../models/Topic.js';

// @desc    Create new topic
// @route   POST /api/topics
// @access  Private
export const createTopic = async (req, res) => {
  try {
    const { name, description, keywords, tone } = req.body;

    // Check if topic already exists for this user
    const existingTopic = await Topic.findOne({ 
      userId: req.user._id,
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingTopic) {
      return res.status(400).json({
        success: false,
        message: 'Topic with this name already exists'
      });
    }

    const topic = await Topic.create({
      userId: req.user._id,
      name,
      description,
      keywords,
      tone
    });

    res.status(201).json({
      success: true,
      topic
    });
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create topic'
    });
  }
};

// @desc    Get all topics for user
// @route   GET /api/topics
// @access  Private
export const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: topics.length,
      topics
    });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get topics'
    });
  }
};

// @desc    Get single topic
// @route   GET /api/topics/:id
// @access  Private
export const getTopic = async (req, res) => {
  try {
    const topic = await Topic.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    res.status(200).json({
      success: true,
      topic
    });
  } catch (error) {
    console.error('Get topic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get topic'
    });
  }
};

// @desc    Update topic
// @route   PUT /api/topics/:id
// @access  Private
export const updateTopic = async (req, res) => {
  try {
    const { name, description, keywords, tone } = req.body;

    const topic = await Topic.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Update fields
    if (name) topic.name = name;
    if (description !== undefined) topic.description = description;
    if (keywords) topic.keywords = keywords;
    if (tone) topic.tone = tone;

    await topic.save();

    res.status(200).json({
      success: true,
      topic
    });
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update topic'
    });
  }
};

// @desc    Delete topic
// @route   DELETE /api/topics/:id
// @access  Private
export const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    await topic.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    console.error('Delete topic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete topic'
    });
  }
};

export default { createTopic, getTopics, getTopic, updateTopic, deleteTopic };

