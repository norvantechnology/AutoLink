import express from 'express';
import {
  getPendingPayments,
  verifyPayment,
  rejectPayment,
  getAdminStats,
  getAllUsers,
  getAllSubscriptions
} from '../controllers/adminController.js';
import { protect } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/adminAuth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// Dashboard
router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/subscriptions', getAllSubscriptions);

// Payment verification
router.get('/pending-payments', getPendingPayments);
router.post('/verify-payment/:subscriptionId', verifyPayment);
router.post('/reject-payment/:subscriptionId', rejectPayment);

export default router;


