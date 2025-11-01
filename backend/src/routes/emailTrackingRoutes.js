import express from 'express';
import { 
  trackEmailClick, 
  getEmailAnalytics,
  getEmailCampaignSummary
} from '../controllers/emailTrackingController.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

// Public route - track email clicks
router.post('/click', trackEmailClick);

// Admin routes - view analytics
router.get('/analytics', protect, adminOnly, getEmailAnalytics);
router.get('/summary', protect, adminOnly, getEmailCampaignSummary);

export default router;

