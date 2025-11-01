import GeneratedPost from '../models/GeneratedPost.js';

// Get top performing posts for home page showcase
export const getTopPosts = async (req, res) => {
  try {
    // Fetch all published posts with LinkedIn URL
    const posts = await GeneratedPost.find({
      status: 'published',
      linkedInPostUrl: { $exists: true, $ne: null }
    })
    .populate('topicId', 'name tone')
    .select('content imageUrl linkedInPostUrl engagement topicId postedAt hashtags')
    .lean();

    // Calculate engagement score for each post
    const postsWithScore = posts.map(post => {
      const likes = post.engagement?.likes || 0;
      const comments = post.engagement?.comments || 0;
      const shares = post.engagement?.shares || 0;
      const impressions = post.engagement?.impressions || 0;
      
      const totalEngagement = likes + (comments * 2) + (shares * 3);
      const engagementRate = impressions > 0 ? (totalEngagement / impressions) * 100 : 0;
      
      return {
        id: post._id,
        content: post.content,
        imageUrl: post.imageUrl,
        linkedInUrl: post.linkedInPostUrl,
        topic: {
          name: post.topicId?.name || 'General',
          tone: post.topicId?.tone || 'professional'
        },
        engagement: {
          likes,
          comments,
          shares,
          impressions,
          total: totalEngagement,
          rate: engagementRate.toFixed(2)
        },
        postedAt: post.postedAt,
        hashtags: post.hashtags || []
      };
    });

    // Sort by total engagement and take top 10
    postsWithScore.sort((a, b) => b.engagement.total - a.engagement.total);
    const topPosts = postsWithScore.slice(0, 10);

    res.json({
      success: true,
      count: topPosts.length,
      posts: topPosts
    });

  } catch (error) {
    console.error('Error fetching top posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top posts',
      posts: []
    });
  }
};

export default {
  getTopPosts
};

