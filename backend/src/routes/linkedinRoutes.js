import express from 'express';
import { 
  getLinkedInAuthUrl, 
  linkedInCallback, 
  getLinkedInStatus, 
  disconnectLinkedIn 
} from '../controllers/linkedinController.js';
import {
  getLinkedInAnalyticsAuthUrl,
  linkedInAnalyticsCallback,
  getAnalyticsStatus
} from '../controllers/linkedinAnalyticsController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Main LinkedIn connection (for posting)
router.get('/connect', protect, getLinkedInAuthUrl);
router.get('/callback', linkedInCallback);
router.get('/status', protect, getLinkedInStatus);
router.delete('/disconnect', protect, disconnectLinkedIn);

// Analytics LinkedIn connection (for engagement data)
router.get('/analytics-connect', protect, getLinkedInAnalyticsAuthUrl);
router.get('/analytics-callback', linkedInAnalyticsCallback);
router.get('/analytics-status', protect, getAnalyticsStatus);

export default router;

