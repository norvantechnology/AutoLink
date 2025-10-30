import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import GeneratedPost from '../models/GeneratedPost.js';
import { sendPaymentApprovedEmail } from '../utils/emailService.js';

/**
 * Admin Controller
 * Handles admin-specific operations
 */

// @desc    Get all pending payments
// @route   GET /api/admin/pending-payments
// @access  Admin
export const getPendingPayments = async (req, res) => {
  try {
    const pendingPayments = await Subscription.find({ status: 'pending' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingPayments.length,
      payments: pendingPayments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get pending payments'
    });
  }
};

// @desc    Verify and approve payment
// @route   POST /api/admin/verify-payment/:subscriptionId
// @access  Admin
export const verifyPayment = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.subscriptionId)
      .populate('userId', 'name email');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Update subscription status
    subscription.status = 'active';
    subscription.startDate = new Date();
    subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    subscription.paymentVerifiedBy = req.user._id;
    subscription.paymentVerifiedAt = new Date();
    await subscription.save();

    // Send confirmation email
    if (subscription.userId.email) {
      sendPaymentApprovedEmail(subscription.userId.email, {
        name: subscription.userId.name,
        planType: subscription.planType,
        postsPerDay: subscription.postsPerDay,
        endDate: subscription.endDate
      }).catch(err => console.error('Failed to send approval email:', err));
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and subscription activated',
      subscription
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};

// @desc    Reject payment
// @route   POST /api/admin/reject-payment/:subscriptionId
// @access  Admin
export const rejectPayment = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const subscription = await Subscription.findById(req.params.subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Payment rejected',
      subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject payment'
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
export const getAdminStats = async (req, res) => {
  try {
    // Count all users excluding current admin
    const allUsers = await User.find({}).select('email role verified');
    const totalUsers = allUsers.filter(u => u.role !== 'admin').length;
    const verifiedUsers = allUsers.filter(u => u.role !== 'admin' && u.verified).length;
    const allUsersCount = allUsers.length;
    const adminCount = allUsers.filter(u => u.role === 'admin').length;
    
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const pendingPayments = await Subscription.countDocuments({ status: 'pending' });
    const totalPosts = await GeneratedPost.countDocuments({});
    const publishedPosts = await GeneratedPost.countDocuments({ status: 'published' });

    // Revenue calculation
    const revenueData = await Subscription.aggregate([
      { $match: { status: { $in: ['active', 'expired'] } } },
      {
        $group: {
          _id: '$currencyCode',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('📊 Admin Stats:', {
      totalUsers,
      verifiedUsers,
      allUsersCount,
      adminCount,
      activeSubscriptions,
      pendingPayments,
      userBreakdown: allUsers.map(u => ({ email: u.email, role: u.role, verified: u.verified }))
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        allUsersCount,
        adminCount,
        activeSubscriptions,
        pendingPayments,
        totalPosts,
        publishedPosts,
        revenue: revenueData
      }
    });
  } catch (error) {
    console.error('❌ Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin stats'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
};

// @desc    Get all subscriptions
// @route   GET /api/admin/subscriptions
// @access  Admin
export const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get subscriptions'
    });
  }
};

export default {
  getPendingPayments,
  verifyPayment,
  rejectPayment,
  getAdminStats,
  getAllUsers,
  getAllSubscriptions
};

