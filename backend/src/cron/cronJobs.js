import cron from 'node-cron';
import { runContentGenerationForAllUsers, publishScheduledPosts } from '../services/automationService.js';
import { learnFromPerformance } from '../services/analyticsService.js';
import { syncEngagementFromLinkedIn } from '../services/syncService.js';
import UserPreferences from '../models/UserPreferences.js';
import User from '../models/User.js';

// Run every 2 minutes to check for content generation and publishing
const automationCron = cron.schedule('*/2 * * * *', async () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  try {
    await runContentGenerationForAllUsers();
    await publishScheduledPosts(currentHour, currentMinute);
  } catch (error) {
  }
}, {
  scheduled: false
});

// Sync engagement data from LinkedIn every 5 minutes
const engagementSyncCron = cron.schedule('*/1 * * * *', async () => {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  
  try {
    const result = await syncEngagementFromLinkedIn();
  } catch (error) {
  }
  
}, {
  scheduled: false
});

// Run learning every hour (analyze performance and update preferences)
const learningCron = cron.schedule('0 * * * *', async () => {
  try {
    const users = await User.find({});
    
    for (const user of users) {
      try {
        const preferences = await UserPreferences.findOne({ userId: user._id });
        
        // Run analysis every hour (if there's new data)
        const hoursSinceLastAnalysis = preferences?.lastAnalyzed
          ? Math.floor((Date.now() - preferences.lastAnalyzed.getTime()) / (1000 * 60 * 60))
          : 24;

        // Analyze if 1+ hours passed OR if never analyzed
        if (hoursSinceLastAnalysis >= 1) {
          await learnFromPerformance(user._id);
        }
      } catch (error) {
        // Silent fail
      }
    }
  } catch (error) {
  }
}, {
  scheduled: false
});

// Start all cron jobs
export const startCronJobs = () => {
  automationCron.start();
  engagementSyncCron.start();
  learningCron.start();
};

// Stop all cron jobs
export const stopCronJobs = () => {
  automationCron.stop();
  engagementSyncCron.stop();
  learningCron.stop();
};

export default { startCronJobs, stopCronJobs };
