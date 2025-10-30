import express from 'express';
import { 
  createTopic, 
  getTopics, 
  getTopic, 
  updateTopic, 
  deleteTopic 
} from '../controllers/topicController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', protect, createTopic);
router.get('/', protect, getTopics);
router.get('/:id', protect, getTopic);
router.put('/:id', protect, updateTopic);
router.delete('/:id', protect, deleteTopic);

export default router;

