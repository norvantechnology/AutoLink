import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendOTPEmail, sendWelcomeEmail, sendPasswordResetOTP } from '../utils/emailService.js';
import { generateOTP, getOTPExpiry, verifyOTP } from '../utils/otpHelper.js';

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      // If user exists but not verified, resend OTP
      if (!userExists.verified) {
        const otp = generateOTP();
        const otpExpiry = getOTPExpiry();
        
        userExists.verificationOTP = otp;
        userExists.otpExpires = otpExpiry;
        userExists.name = name; // Update name if changed
        userExists.password = password; // Update password if changed
        await userExists.save();
        
        // Resend OTP email
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
          sendOTPEmail(email, otp, name).catch(err => {
            console.error('Failed to send OTP email:', err);
          });
        }
        
        return res.status(200).json({
          success: true,
          message: 'Account exists but not verified. New OTP sent to your email.',
          user: {
            id: userExists._id,
            email: userExists.email,
            name: userExists.name,
            role: userExists.role,
            verified: userExists.verified
          }
        });
      }
      
      // User exists and is verified
      return res.status(400).json({
        success: false,
        message: 'User already exists. Please login instead.'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      verificationOTP: otp,
      otpExpires: otpExpiry,
      verified: false
    });

    // Send OTP email (don't wait for it)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      sendOTPEmail(email, otp, name).catch(err => {
        console.error('Failed to send OTP email:', err);
      });
    }

    // Don't send token yet - only after email verification
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for the verification code.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // If user is not verified, resend OTP and ask them to verify
    if (!user.verified) {
      // Generate new OTP
      const otp = generateOTP();
      const otpExpiry = getOTPExpiry();
      
      user.verificationOTP = otp;
      user.otpExpires = otpExpiry;
      await user.save();
      
      // Send OTP email
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        sendOTPEmail(email, otp, user.name).catch(err => {
          console.error('Failed to send OTP email:', err);
        });
      }
      
      return res.status(403).json({
        success: false,
        verified: false,
        message: 'Please verify your email first. We sent a new OTP to your email.',
        email: user.email
      });
    }

    // Generate token only for verified users
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTPCode = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP
    const validation = verifyOTP(otp, user.verificationOTP, user.otpExpires);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Mark as verified
    user.verified = true;
    user.verificationOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send welcome email (don't wait)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      sendWelcomeEmail(email, user.name).catch(err => {
        console.error('Failed to send welcome email:', err);
      });
    }

    // Generate token after successful verification
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.verified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    user.verificationOTP = otp;
    user.otpExpires = otpExpiry;
    await user.save();

    // Send OTP email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      await sendOTPEmail(email, otp, user.name);
    }

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });
  }
};

// @desc    Verify email (legacy token support)
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Forgot password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = otpExpiry;
    await user.save();

    // Send password reset OTP email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      await sendPasswordResetOTP(email, otp, user.name);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP
    const validation = verifyOTP(otp, user.resetPasswordOTP, user.resetPasswordExpires);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export default { signup, login, getMe, verifyEmail, verifyOTPCode, resendOTP, forgotPassword, resetPassword };

