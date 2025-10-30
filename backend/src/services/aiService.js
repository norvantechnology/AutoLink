import openai from '../config/openai.js';
import GeneratedPost from '../models/GeneratedPost.js';
import { getUserPreferences } from './analyticsService.js';
import { generateDetailedImagePrompt } from './imagePromptService.js';
import { getPostGenerationPrompt } from '../config/promptsLoader.js';

/**
 * Select best topic to avoid repetition
 * Uses recent post history to ensure variety
 * @param {Array} topics - Available topics
 * @param {String} userId - User ID
 * @returns {Object} Selected topic
 */
export const selectBestTopic = async (topics, userId) => {
  try {
    // Get recent posts with topic information
    const recentPosts = await GeneratedPost.find({ userId })
      .populate('topicId')
      .sort({ createdAt: -1 })
      .limit(10);

    // Count usage of each topic
    const topicUsage = {};
    topics.forEach(topic => {
      topicUsage[topic._id.toString()] = 0;
    });

    recentPosts.forEach(post => {
      if (post.topicId?._id) {
        const topicId = post.topicId._id.toString();
        topicUsage[topicId] = (topicUsage[topicId] || 0) + 1;
      }
    });

    // Avoid last 3 topics
    const last3Topics = recentPosts
      .slice(0, 3)
      .map(p => p.topicId?.name)
      .filter(Boolean);

    const availableTopics = topics.filter(topic => !last3Topics.includes(topic.name));
    const topicsToConsider = availableTopics.length > 0 ? availableTopics : topics;

    // Sort by least used
    topicsToConsider.sort((a, b) => {
      const usageA = topicUsage[a._id.toString()] || 0;
      const usageB = topicUsage[b._id.toString()] || 0;
      return usageA - usageB;
    });

    return topicsToConsider[0];
  } catch (error) {
    console.error('❌ Topic selection error:', error);
    return topics[0];
  }
};

/**
 * Generate LinkedIn post with AI-generated content and image
 * @param {String} userId - User ID
 * @param {Object} topic - Topic object
 * @param {String} tone - Post tone
 * @returns {Object} Generated content, image URL, and hashtags
 */
export const generatePostWithImage = async (userId, topic, tone = 'professional') => {
  try {
    // Get learned preferences for optimization
    const preferences = await getUserPreferences(userId);
    // Image is primary content, text is just a hook (shorter is better)
    const targetLength = preferences?.optimalContentLength || 80;
    const targetEmojis = preferences?.successPatterns?.avgEmojiCount || 1;
    
    // Build prompt for text generation
    const prompt = await buildPostPrompt(userId, topic, tone, targetLength, targetEmojis, preferences);
    
    // Generate post content with OpenAI
    const content = await generateTextContent(prompt);
    
    // Generate image in parallel with hashtags
    const [imageUrl, hashtags] = await Promise.all([
      generateOptimizedImage(content, topic, preferences),
      getOptimizedHashtags(userId, topic, preferences)
    ]);

    return { content, imageUrl, hashtags };
  } catch (error) {
    console.error('❌ Post generation error:', error);
    throw error;
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build prompt for text generation using prompts JSON
 */
const buildPostPrompt = async (userId, topic, tone, targetLength, targetEmojis) => {
  // Get recent posts for context to avoid repetition
  const recentPosts = await GeneratedPost.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('content topicId');

  const previousTopics = recentPosts
    .filter(p => p.topicId?.toString() === topic._id.toString())
    .map(p => p.content.substring(0, 100))
    .join('\n');

  // Build prompt using centralized template
  return getPostGenerationPrompt({
    topicName: topic.name,
    topicDescription: topic.description,
    keywords: topic.keywords,
    previousPosts: previousTopics || null,
    tone,
    targetLength,
    targetEmojis
  });
};

/**
 * Generate text content using OpenAI
 */
const generateTextContent = async (prompt) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 500
  });

  return response.choices[0].message.content.trim();
};

/**
 * Generate image using Gemini API
 */
const generateOptimizedImage = async (content, topic, preferences) => {
  try {
    const detailedPrompt = await generateDetailedImagePrompt(content, topic, preferences);
    const { generateImageWithGemini } = await import('./geminiImageService.js');
    return await generateImageWithGemini(detailedPrompt);
  } catch (error) {
    console.error('❌ Gemini Imagen error:', error.message);
    console.error('⚠️ Image generation failed - post will be created without image');
    return null;
  }
};

/**
 * Get optimized hashtags based on user preferences or topic
 * No AI call - uses learned data or defaults
 */
const getOptimizedHashtags = async (userId, topic, preferences) => {
  try {
    // Use learned high-performing hashtags if available
    const topHashtags = preferences?.topHashtags || [];
    
    if (topHashtags.length >= 5) {
      return topHashtags.slice(0, 5).map(h => h.tag);
    }

    // Fallback to topic-based hashtags
    const defaultHashtags = [
      topic.name.replace(/\s+/g, ''),
      ...(topic.keywords || []).slice(0, 3),
      'LinkedIn',
      'Professional'
    ];

    return defaultHashtags.slice(0, 5);
  } catch (error) {
    console.error('❌ Hashtag generation error:', error);
    return [topic.name.replace(/\s+/g, '')];
  }
};

export default { selectBestTopic, generatePostWithImage };
