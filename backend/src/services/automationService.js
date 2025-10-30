import AutomationSettings from '../models/AutomationSettings.js';
import GeneratedPost from '../models/GeneratedPost.js';
import LinkedInAccount from '../models/LinkedInAccount.js';
import Topic from '../models/Topic.js';
import Subscription from '../models/Subscription.js';
import { selectBestTopic, generatePostWithImage } from './aiService.js';
import { publishImagePost } from './linkedinService.js';
import { analyzePost, learnFromPerformance } from './analyticsService.js';

// Generate all posts for the day (runs at content creation time)
export const generateDailyContent = async (userId) => {
  try {
    // 1. Check subscription status
    const subscription = await Subscription.findOne({
      userId,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return;
    }
    // Check expiration
    if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
      return;
    }
    // 2. Get user's automation settings
    const settings = await AutomationSettings.findOne({ userId });
    if (!settings || !settings.enabled) {
      return;
    }

    // ALWAYS use subscription's postsPerDay (paid plan limit)
    const postsPerDay = subscription.postsPerDay;

    // Ensure settings has enough publish times
    let publishTimes = settings.publishTimes || [];
    const defaultTimes = ['09:00', '14:00', '18:00', '21:00', '23:00'];
    
    // Add default times if not enough
    while (publishTimes.length < postsPerDay) {
      publishTimes.push(defaultTimes[publishTimes.length] || '12:00');
    }
    
    // Trim if too many
    if (publishTimes.length > postsPerDay) {
      publishTimes = publishTimes.slice(0, postsPerDay);
    }
    
    // Update settings to match subscription
    if (settings.postsPerDay !== subscription.postsPerDay || 
        settings.publishTimes.length !== postsPerDay) {
      settings.postsPerDay = subscription.postsPerDay;
      settings.publishTimes = publishTimes;
      await settings.save();
    }

    // 3. Check how many posts already generated today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const postsGeneratedToday = await GeneratedPost.countDocuments({
      userId,
      createdAt: { $gte: today }
    });


    if (postsGeneratedToday >= postsPerDay) {
      return;
    }
    const postsNeeded = postsPerDay - postsGeneratedToday;

    const existingPublishTimes = await GeneratedPost.find({
      userId,
      createdAt: { $gte: today }
    }).distinct('scheduledPublishTime');

    const remainingTimes = publishTimes.filter(time => !existingPublishTimes.includes(time));
    
    if (remainingTimes.length === 0) {
      return;
    }

    const timesToGenerate = remainingTimes.slice(0, postsNeeded);

    // 4. Get LinkedIn account
    const linkedInAccount = await LinkedInAccount.findOne({ userId });
    if (!linkedInAccount) {
      throw new Error('LinkedIn account not connected');
    }

    // 5. Get all user topics
    const topics = await Topic.find({ userId });
    if (topics.length === 0) {
      throw new Error('No topics found');
    }

    // 6. Generate posts for remaining publish times
    for (let i = 0; i < timesToGenerate.length; i++) {
      const publishTime = timesToGenerate[i];

      // AI selects best topic for this post (with anti-repetition logic)
      const selectedTopic = await selectBestTopic(topics, userId);

      // Generate post content and image
      const { content, imageUrl: openaiImageUrl, hashtags } = await generatePostWithImage(
        userId,
        selectedTopic,
        selectedTopic.tone
      );

      // Create post record
      const generatedPost = await GeneratedPost.create({
        userId,
        topicId: selectedTopic._id,
        content,
        imageUrl: openaiImageUrl,
        hashtags,
        scheduledPublishTime: publishTime,
        status: 'generated'
      });

      // Upload image to Cloudinary if available
      if (openaiImageUrl) {
        const { uploadImageToCloudinary } = await import('./imageService.js');
        const cloudinaryResult = await uploadImageToCloudinary(openaiImageUrl, generatedPost._id);
        generatedPost.imageUrl = cloudinaryResult.url;
        await generatedPost.save();
      }

      // Analyze post for learning
      await analyzePost(generatedPost, selectedTopic);
      
      // Delay to avoid rate limits
      if (i < timesToGenerate.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Learning runs separately via hourly cron - no need to check here

    // Update last generation date only if we generated all needed posts
    if (postsGeneratedToday + timesToGenerate.length >= postsPerDay) {
      settings.lastContentGenerationDate = new Date();
      await settings.save();
    }

    return true;

  } catch (error) {
    console.error('❌ Content generation error:', error);
    throw error;
  }
};

// Publish posts at their scheduled times
export const publishScheduledPosts = async (currentHour, currentMinute) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all unpublished posts from today
    const allGeneratedPosts = await GeneratedPost.find({
      status: 'generated',
      createdAt: { $gte: today }
    }).populate('topicId');

    // Filter posts that should be published (within 2 minute window)
    const postsToPublish = allGeneratedPosts.filter(post => {
      const [schedHour, schedMinute] = post.scheduledPublishTime.split(':').map(Number);
      
      // Publish if time has passed (catch up on missed posts)
      const isPastTime = 
        currentHour > schedHour || 
        (currentHour === schedHour && currentMinute >= schedMinute);
      
      return isPastTime;
    });

    if (postsToPublish.length === 0) {
      return;
    }

    for (const post of postsToPublish) {
      try {
        const linkedInAccount = await LinkedInAccount.findOne({ userId: post.userId });
        
        if (!linkedInAccount || new Date(linkedInAccount.expiresAt) <= new Date()) {
          post.status = 'failed';
          await post.save();
          continue;
        }

        const accessToken = linkedInAccount.getDecryptedAccessToken();
        const result = await publishImagePost(
          accessToken,
          linkedInAccount.linkedInId,
          post.content,
          post.imageUrl,
          post.hashtags
        );

        post.linkedInPostId = result.postId;
        post.linkedInPostUrl = result.postUrl;
        post.postedAt = new Date();
        post.status = 'published';
        await post.save();

      } catch (error) {
        console.error(`Publish error:`, error.message);
        post.status = 'failed';
        await post.save();
      }
    }

  } catch (error) {
    console.error('❌ Publish scheduled posts error:', error);
  }
};

// Run content generation for all users (checks for missing posts)
export const runContentGenerationForAllUsers = async () => {
  try {
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();

    const allActiveSettings = await AutomationSettings.find({ enabled: true });

    for (const setting of allActiveSettings) {
      try {
        const [creationHour, creationMinute] = setting.contentCreationTime.split(':').map(Number);
        const creationTimeInMinutes = creationHour * 60 + creationMinute;
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        
        if (currentTimeInMinutes >= creationTimeInMinutes) {
          await generateDailyContent(setting.userId);
        }
      } catch (error) {
        // Silent fail
      }
    }
  } catch (error) {
    console.error('Content generation error:', error);
  }
};

export default { 
  generateDailyContent, 
  publishScheduledPosts,
  runContentGenerationForAllUsers
};
