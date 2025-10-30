import AutomationSettings from '../models/AutomationSettings.js';
import GeneratedPost from '../models/GeneratedPost.js';
import Topic from '../models/Topic.js';

// @desc    Get automation settings
// @route   GET /api/automation/settings
// @access  Private
export const getSettings = async (req, res) => {
  try {
    let settings = await AutomationSettings.findOne({ userId: req.user._id });

    if (!settings) {
      // Create default settings
      settings = await AutomationSettings.create({
        userId: req.user._id,
        postsPerDay: 1,
        enabled: true,
        contentCreationTime: '08:00',
        publishTimes: ['09:00']
      });
    }

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings'
    });
  }
};

// @desc    Update automation settings
// @route   PUT /api/automation/settings
// @access  Private
export const updateSettings = async (req, res) => {
  try {
    const { postsPerDay, enabled, contentCreationTime, publishTimes } = req.body;

    // Validate publishTimes matches postsPerDay
    if (publishTimes && postsPerDay && publishTimes.length !== postsPerDay) {
      return res.status(400).json({
        success: false,
        message: `Number of publish times (${publishTimes.length}) must match posts per day (${postsPerDay})`
      });
    }

    let settings = await AutomationSettings.findOne({ userId: req.user._id });

    if (!settings) {
      settings = await AutomationSettings.create({
        userId: req.user._id,
        postsPerDay: postsPerDay || 1,
        enabled: enabled !== undefined ? enabled : true,
        contentCreationTime: contentCreationTime || '08:00',
        publishTimes: publishTimes || ['09:00']
      });
    } else {
      if (postsPerDay !== undefined) settings.postsPerDay = postsPerDay;
      if (enabled !== undefined) settings.enabled = enabled;
      if (contentCreationTime) settings.contentCreationTime = contentCreationTime;
      if (publishTimes) settings.publishTimes = publishTimes;
      
      await settings.save();
    }

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update settings'
    });
  }
};

// @desc    Get all generated posts (history)
// @route   GET /api/automation/posts
// @access  Private
export const getGeneratedPosts = async (req, res) => {
  try {
    const generatedPosts = await GeneratedPost.find({ userId: req.user._id })
      .populate('topicId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: generatedPosts.length,
      posts: generatedPosts
    });
  } catch (error) {
    console.error('Get generated posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get posts'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/automation/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const settings = await AutomationSettings.findOne({ userId: req.user._id });
    const totalTopics = await Topic.countDocuments({ userId: req.user._id });
    const totalPosted = await GeneratedPost.countDocuments({ 
      userId: req.user._id,
      status: 'published'
    });

    const recentPosts = await GeneratedPost.find({ userId: req.user._id })
      .populate('topicId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('content imageUrl linkedInPostUrl engagement postedAt topicId status scheduledPublishTime');

    const totalEngagement = await GeneratedPost.aggregate([
      { $match: { userId: req.user._id, status: 'published' } },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: '$engagement.likes' },
          totalComments: { $sum: '$engagement.comments' },
          totalShares: { $sum: '$engagement.shares' },
          totalImpressions: { $sum: '$engagement.impressions' }
        }
      }
    ]);

    // Calculate posts generated today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const generatedToday = await GeneratedPost.countDocuments({
      userId: req.user._id,
      createdAt: { $gte: today }
    });

    // Calculate posts published today
    const publishedToday = await GeneratedPost.countDocuments({
      userId: req.user._id,
      status: 'published',
      postedAt: { $gte: today }
    });

    res.status(200).json({
      success: true,
      stats: {
        automationEnabled: settings?.enabled || false,
        postsPerDay: settings?.postsPerDay || 1,
        contentCreationTime: settings?.contentCreationTime || '08:00',
        publishTimes: settings?.publishTimes || ['09:00'],
        generatedToday,
        publishedToday,
        totalPosted,
        totalTopics,
        engagement: totalEngagement[0] || {
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalImpressions: 0
        },
        recentPosts
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics'
    });
  }
};

// @desc    Test post generation (temporary testing)
// @route   POST /api/automation/test-generate
// @access  Private
export const testGenerate = async (req, res) => {
  try {
    const { generateDailyContent } = await import('../services/automationService.js');
    
    console.log('🧪 Test generation triggered by user:', req.user._id);
    
    await generateDailyContent(req.user._id);
    
    res.status(200).json({
      success: true,
      message: 'Test post generation completed! Check your posts.'
    });
  } catch (error) {
    console.error('Test generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate test post'
    });
  }
};

// @desc    Get scheduled posts (generated but not yet published)
// @route   GET /api/automation/scheduled
// @access  Private
export const getScheduledPosts = async (req, res) => {
  try {
    const scheduledPosts = await GeneratedPost.find({
      userId: req.user._id,
      status: 'generated'
    })
      .populate('topicId', 'name')
      .sort({ scheduledPublishTime: 1 });

    res.status(200).json({
      success: true,
      count: scheduledPosts.length,
      posts: scheduledPosts
    });
  } catch (error) {
    console.error('Get scheduled posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scheduled posts'
    });
  }
};

// @desc    Update scheduled post
// @route   PUT /api/automation/posts/:id
// @access  Private
export const updatePost = async (req, res) => {
  try {
    const { content, imageUrl, hashtags } = req.body;

    const post = await GeneratedPost.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'generated' // Can only edit if not yet published
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or already published'
      });
    }

    // Update fields
    if (content !== undefined) post.content = content;
    if (imageUrl !== undefined) post.imageUrl = imageUrl;
    if (hashtags !== undefined) post.hashtags = hashtags;

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post'
    });
  }
};

// @desc    Delete scheduled post
// @route   DELETE /api/automation/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await GeneratedPost.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
      status: 'generated' // Can only delete if not yet published
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or already published'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
};

export default {
  getSettings,
  updateSettings,
  getGeneratedPosts,
  getDashboardStats,
  testGenerate,
  getScheduledPosts,
  updatePost,
  deletePost
};
