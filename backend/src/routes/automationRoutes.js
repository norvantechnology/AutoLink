import express from 'express';
import {
  getSettings,
  updateSettings,
  getGeneratedPosts,
  getDashboardStats,
  testGenerate,
  getScheduledPosts,
  updatePost,
  deletePost
} from '../controllers/automationController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Settings
router.get('/settings', protect, getSettings);
router.put('/settings', protect, updateSettings);

// Posts
router.get('/posts', protect, getGeneratedPosts);
router.get('/scheduled', protect, getScheduledPosts);
router.put('/posts/:id', protect, updatePost);
router.delete('/posts/:id', protect, deletePost);
router.get('/stats', protect, getDashboardStats);

// Test (temporary for development)
router.post('/test-generate', protect, testGenerate);

export default router;
