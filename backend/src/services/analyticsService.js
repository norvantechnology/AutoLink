import PostAnalytics from '../models/PostAnalytics.js';
import UserPreferences from '../models/UserPreferences.js';
import GeneratedPost from '../models/GeneratedPost.js';

// Analyze post and create analytics record
export const analyzePost = async (post, topic) => {
  try {
    const content = post.content;
    const contentLength = content.split(/\s+/).length; // word count
    const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const emojiCount = (content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;

    const publishTime = post.scheduledPublishTime;
    const dayOfWeek = new Date(post.createdAt).getDay();

    await PostAnalytics.create({
      userId: post.userId,
      postId: post._id,
      topicId: post.topicId,
      contentLength,
      sentenceCount,
      emojiCount,
      tone: topic.tone,
      imageStyle: 'modern-professional', // Will be enhanced with image analysis
      hasImage: !!post.imageUrl,
      hashtags: post.hashtags,
      hashtagCount: post.hashtags?.length || 0,
      publishTime,
      dayOfWeek
    });

    console.log('✅ Post analytics created');
  } catch (error) {
    console.error('❌ Analytics creation error:', error);
  }
};

// Update engagement metrics from LinkedIn
export const updateEngagementMetrics = async (postId, engagement) => {
  try {
    const analytics = await PostAnalytics.findOne({ postId });
    if (!analytics) return;

    analytics.likes = engagement.likes || 0;
    analytics.comments = engagement.comments || 0;
    analytics.shares = engagement.shares || 0;
    analytics.impressions = engagement.impressions || 0;
    analytics.calculatePerformanceScore();
    
    await analytics.save();
    console.log('✅ Engagement metrics updated');
  } catch (error) {
    console.error('❌ Engagement update error:', error);
  }
};

// Learn from user's post performance and update preferences
export const learnFromPerformance = async (userId) => {
  try {
    // Get all analytics for this user
    const allAnalytics = await PostAnalytics.find({ userId })
      .sort({ performanceScore: -1 })
      .limit(50);

    // Need at least 3 posts to start learning
    if (allAnalytics.length < 3) {
      return; // Not enough data yet
    }

    // Get top 30% performing posts
    const topPerformers = allAnalytics.slice(0, Math.ceil(allAnalytics.length * 0.3));

    // Calculate optimal content length
    const avgContentLength = Math.round(
      topPerformers.reduce((sum, a) => sum + a.contentLength, 0) / topPerformers.length
    );

    // Find best performing tone
    const toneScores = {};
    topPerformers.forEach(a => {
      toneScores[a.tone] = (toneScores[a.tone] || 0) + a.performanceScore;
    });
    const bestTone = Object.keys(toneScores).reduce((a, b) => 
      toneScores[a] > toneScores[b] ? a : b
    );

    // Analyze hashtag performance
    const hashtagStats = {};
    allAnalytics.forEach(a => {
      if (a.hashtags) {
        a.hashtags.forEach(tag => {
          if (!hashtagStats[tag]) {
            hashtagStats[tag] = { total: 0, count: 0 };
          }
          hashtagStats[tag].total += a.performanceScore;
          hashtagStats[tag].count += 1;
        });
      }
    });

    const topHashtags = Object.keys(hashtagStats)
      .map(tag => ({
        tag,
        avgEngagement: Math.round(hashtagStats[tag].total / hashtagStats[tag].count),
        timesUsed: hashtagStats[tag].count
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 10);

    // Calculate average metrics from top performers
    const avgSentenceLength = Math.round(
      topPerformers.reduce((sum, a) => sum + (a.contentLength / a.sentenceCount), 0) / topPerformers.length
    );
    const avgEmojiCount = Math.round(
      topPerformers.reduce((sum, a) => sum + a.emojiCount, 0) / topPerformers.length
    );

    // Update or create user preferences
    await UserPreferences.findOneAndUpdate(
      { userId },
      {
        userId,
        optimalContentLength: avgContentLength,
        bestPerformingTone: bestTone,
        topHashtags,
        successPatterns: {
          avgSentenceLength,
          avgEmojiCount,
          preferredStructure: 'hook-content-cta'
        },
        lastAnalyzed: new Date(),
        totalPostsAnalyzed: allAnalytics.length
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Learned from ${allAnalytics.length} posts`);
    console.log(`   Optimal length: ${avgContentLength} words`);
    console.log(`   Best tone: ${bestTone}`);
    console.log(`   Top hashtags: ${topHashtags.slice(0, 3).map(h => h.tag).join(', ')}`);

  } catch (error) {
    console.error('❌ Learning error:', error);
  }
};

// Get user preferences for content generation
export const getUserPreferences = async (userId) => {
  try {
    let preferences = await UserPreferences.findOne({ userId });
    
    if (!preferences) {
      // Create default preferences
      preferences = await UserPreferences.create({
        userId,
        optimalContentLength: 200,
        bestPerformingTone: 'professional',
        topHashtags: [],
        bestImageStyles: []
      });
    }

    return preferences;
  } catch (error) {
    console.error('❌ Get preferences error:', error);
    return null;
  }
};

export default {
  analyzePost,
  updateEngagementMetrics,
  learnFromPerformance,
  getUserPreferences
};

