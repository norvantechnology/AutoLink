import express from 'express';
import { updatePostEngagement } from '../controllers/engagementController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Update post engagement manually
router.put('/:postId', protect, updatePostEngagement);

export default router;

