import GeneratedPost from '../models/GeneratedPost.js';
import LinkedInAccount from '../models/LinkedInAccount.js';
import LinkedInAnalyticsAccount from '../models/LinkedInAnalyticsAccount.js';
import PostAnalytics from '../models/PostAnalytics.js';
import { updateEngagementMetrics } from './analyticsService.js';
import { fetchPostAnalytics } from './linkedinService.js';

// Sync engagement data from LinkedIn API
export const syncEngagementFromLinkedIn = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);


    const posts = await GeneratedPost.find({
      status: 'published',
      postedAt: { $gte: sevenDaysAgo },
      linkedInPostId: { $exists: true, $ne: null }
    }).limit(20);


    let synced = 0;
    let failed = 0;

    for (const post of posts) {
      try {
        const postId = post._id.toString().slice(-6);
        
        // Try analytics account first (App #2 with Community Management API)
        let analyticsAccount = await LinkedInAnalyticsAccount.findOne({ userId: post.userId });
        let accessToken;
        let accountType;
        
        if (analyticsAccount && new Date(analyticsAccount.expiresAt) > new Date()) {
          // Use analytics app token (has Community Management API permissions)
          accessToken = analyticsAccount.getDecryptedAccessToken();
          accountType = 'Analytics App';
        } else {
          // Fallback to main account (might have limited permissions)
          const mainAccount = await LinkedInAccount.findOne({ userId: post.userId });
          
          if (!mainAccount || new Date(mainAccount.expiresAt) <= new Date()) {
            failed++;
            continue;
          }
          
          accessToken = mainAccount.getDecryptedAccessToken();
          accountType = 'Main App';
        }
        
        const engagement = await fetchPostAnalytics(accessToken, post.linkedInPostId);
        
        if (engagement) {
          post.engagement = engagement;
          await post.save();
          await updateEngagementMetrics(post._id, engagement);
          synced++;
        } else {
            failed++;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        failed++;
      }
    }


    return { synced, failed };

  } catch (error) {
    return { synced: 0, failed: 0 };
  }
};

export default {
  syncEngagementFromLinkedIn
};
