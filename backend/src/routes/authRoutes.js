import express from 'express';
import { signup, login, getMe, verifyEmail, verifyOTPCode, resendOTP, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);

// OTP Verification
router.post('/verify-otp', verifyOTPCode);
router.post('/resend-otp', resendOTP);

// Password Reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Legacy token verification
router.get('/verify-email/:token', verifyEmail);

export default router;

