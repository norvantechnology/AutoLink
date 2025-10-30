import GeneratedPost from '../models/GeneratedPost.js';
import { updateEngagementMetrics } from '../services/analyticsService.js';

// @desc    Manually update engagement for a post
// @route   PUT /api/engagement/:postId
// @access  Private
export const updatePostEngagement = async (req, res) => {
  try {
    const { postId } = req.params;
    const { likes, comments, shares, impressions } = req.body;

    // Find post and verify ownership
    const post = await GeneratedPost.findOne({
      _id: postId,
      userId: req.user._id
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Update engagement
    post.engagement = {
      likes: likes !== undefined ? likes : post.engagement?.likes || 0,
      comments: comments !== undefined ? comments : post.engagement?.comments || 0,
      shares: shares !== undefined ? shares : post.engagement?.shares || 0,
      impressions: impressions !== undefined ? impressions : post.engagement?.impressions || 0
    };

    await post.save();

    // Update PostAnalytics
    await updateEngagementMetrics(post._id, post.engagement);

    console.log(`✅ Manually updated engagement for post ${postId}`);

    res.status(200).json({
      success: true,
      message: 'Engagement updated successfully',
      engagement: post.engagement
    });
  } catch (error) {
    console.error('Update engagement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update engagement'
    });
  }
};

export default { updatePostEngagement };

