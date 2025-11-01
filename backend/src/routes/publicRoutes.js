import express from 'express';
import { getTopPosts } from '../controllers/publicController.js';

const router = express.Router();

// Public route - no authentication required
router.get('/top-posts', getTopPosts);

export default router;

