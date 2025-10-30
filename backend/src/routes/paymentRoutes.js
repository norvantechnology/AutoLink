import express from 'express';
import {
  getCurrencies,
  getPricingByCurrency,
  getSubscription,
  createPaymentRequest,
  upgradePlan,
  submitPaymentProof,
  verifyPayment,
  getPendingPayments,
  getPaymentHistory
} from '../controllers/paymentController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Public
router.get('/currencies', getCurrencies);
router.get('/pricing/:currencyCode', getPricingByCurrency);

// User routes
router.get('/subscription', protect, getSubscription);
router.get('/history', protect, getPaymentHistory);
router.post('/create', protect, createPaymentRequest);
router.post('/upgrade-plan', protect, upgradePlan);
router.post('/submit-proof', protect, submitPaymentProof);

// Admin routes
router.post('/verify/:subscriptionId', protect, verifyPayment);
router.get('/pending', protect, getPendingPayments);

export default router;

