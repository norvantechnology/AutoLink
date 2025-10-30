import Subscription from '../models/Subscription.js';
import AutomationSettings from '../models/AutomationSettings.js';
import Currency from '../models/Currency.js';
import Pricing from '../models/Pricing.js';

// @desc    Get all active currencies
// @route   GET /api/payment/currencies
// @access  Public
export const getCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.find({ isActive: true })
      .select('code symbol name conversionRate paymentMethod')
      .sort({ code: 1 });

    res.status(200).json({
      success: true,
      currencies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get currencies'
    });
  }
};

// @desc    Get pricing for specific currency (calculated dynamically)
// @route   GET /api/payment/pricing/:currencyCode
// @access  Public
export const getPricingByCurrency = async (req, res) => {
  try {
    const { currencyCode } = req.params;
    
    const currency = await Currency.findOne({ 
      code: currencyCode.toUpperCase(), 
      isActive: true 
    });

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    const basePricing = await Pricing.find({}).sort({ postsPerDay: 1 });

    const pricing = basePricing.map(base => ({
      postsPerDay: base.postsPerDay,
      price: Pricing.calculatePrice(base.basePriceUSD, currency.conversionRate),
      plan: base.planType,
      name: base.planName
    }));

    res.status(200).json({
      success: true,
      currency: {
        code: currency.code,
        symbol: currency.symbol,
        name: currency.name
      },
      pricing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get pricing'
    });
  }
};

// @desc    Get user's subscription status
// @route   GET /api/payment/subscription
// @access  Private
export const getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(200).json({
        success: true,
        hasActiveSubscription: false,
        subscription: null
      });
    }

    const now = new Date();
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
    
    if (!endDate || endDate < now) {
      subscription.status = 'expired';
      await subscription.save();
      
      return res.status(200).json({
        success: true,
        hasActiveSubscription: false,
        subscription: null
      });
    }

    res.status(200).json({
      success: true,
      hasActiveSubscription: true,
      subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription'
    });
  }
};

// @desc    Get payment info (without creating subscription)
// @route   POST /api/payment/create
// @access  Private
export const createPaymentRequest = async (req, res) => {
  try {
    const { postsPerDay, currencyCode } = req.body;

    if (!postsPerDay || postsPerDay < 1 || postsPerDay > 5) {
      return res.status(400).json({
        success: false,
        message: 'Invalid posts per day (must be 1-5)'
      });
    }

    if (!currencyCode) {
      return res.status(400).json({
        success: false,
        message: 'Currency code is required'
      });
    }

    const currency = await Currency.findOne({ 
      code: currencyCode.toUpperCase(), 
      isActive: true 
    });

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not supported'
      });
    }

    const basePricing = await Pricing.findOne({ postsPerDay });
    
    if (!basePricing) {
      return res.status(404).json({
        success: false,
        message: 'Pricing not found'
      });
    }

    const amount = Pricing.calculatePrice(basePricing.basePriceUSD, currency.conversionRate);
    const planType = basePricing.planType;

    // DON'T create subscription yet - just return payment info
    let paymentInfo = {
      amount: amount,
      currencyCode: currency.code,
      currencySymbol: currency.symbol,
      planType: planType,
      postsPerDay: postsPerDay,
      planName: basePricing.planName,
      note: `AutoLink ${planType} - ${postsPerDay} posts/day`,
      method: currency.paymentMethod
    };

    if (currency.paymentMethod === 'upi' && currency.upiId) {
      paymentInfo.upiId = currency.upiId;
      paymentInfo.upiUrl = `upi://pay?pa=${currency.upiId}&pn=${process.env.UPI_NAME || 'AutoLink'}&am=${amount}&cu=${currency.code}&tn=AutoLink-Payment`;
    } else if (currency.paymentMethod === 'paypal' && currency.paypalEmail) {
      paymentInfo.paypalEmail = currency.paypalEmail;
      paymentInfo.paypalUrl = `https://www.paypal.com/paypalme/${currency.paypalEmail}/${amount}`;
    }

    res.status(200).json({
      success: true,
      paymentInfo
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment request'
    });
  }
};

// @desc    Request plan upgrade (with prorated or full pricing)
// @route   POST /api/payment/upgrade-plan
// @access  Private
export const upgradePlan = async (req, res) => {
  try {
    const { newPostsPerDay, currencyCode, startImmediately } = req.body;

    console.log(`🔄 Upgrade request for user: ${req.user._id}`);
    console.log(`   New plan: ${newPostsPerDay} posts/day`);
    console.log(`   Start immediately: ${startImmediately}`);

    if (!newPostsPerDay || newPostsPerDay < 1 || newPostsPerDay > 5) {
      return res.status(400).json({
        success: false,
        message: 'Invalid posts per day (must be 1-5)'
      });
    }

    // Get current active subscription (simplified query)
    const currentSubscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active'
    }).sort({ createdAt: -1 });

    console.log(`   Current subscription found? ${currentSubscription ? 'YES' : 'NO'}`);

    if (!currentSubscription) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Check if expired
    if (currentSubscription.endDate && new Date(currentSubscription.endDate) < new Date()) {
      console.log(`   Subscription expired`);
      return res.status(400).json({
        success: false,
        message: 'Current subscription has expired'
      });
    }

    console.log(`   Current plan: ${currentSubscription.postsPerDay} posts/day`);

    // Only allow upgrades (not downgrades)
    if (newPostsPerDay <= currentSubscription.postsPerDay) {
      return res.status(400).json({
        success: false,
        message: 'You can only upgrade your plan. Contact support to downgrade.'
      });
    }

    // Get currency (allow currency change or use existing)
    const selectedCurrencyCode = currencyCode || currentSubscription.currencyCode;
    const currency = await Currency.findOne({ 
      code: selectedCurrencyCode.toUpperCase(),
      isActive: true 
    });

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    // Get pricing for current and new plan
    const currentPricing = await Pricing.findOne({ postsPerDay: currentSubscription.postsPerDay });
    const newPricing = await Pricing.findOne({ postsPerDay: newPostsPerDay });
    
    if (!currentPricing || !newPricing) {
      return res.status(404).json({
        success: false,
        message: 'Pricing not found'
      });
    }

    // Calculate days used from startDate (not endDate)
    const now = new Date();
    const startDate = new Date(currentSubscription.startDate);
    const endDate = new Date(currentSubscription.endDate);
    const totalDays = 30;
    
    // Days used = from startDate to now
    const daysUsed = Math.max(0, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));

    // Current plan: Amount already paid
    const currentPlanFullPrice = Pricing.calculatePrice(currentPricing.basePriceUSD, currency.conversionRate);
    const currentPlanUsedAmount = Math.round((currentPlanFullPrice / totalDays) * daysUsed);
    const currentPlanRemainingCredit = currentPlanFullPrice - currentPlanUsedAmount;

    // New plan: Full price
    const newPlanFullPrice = Pricing.calculatePrice(newPricing.basePriceUSD, currency.conversionRate);
    
    let amountToPay;
    let upgradeType;

    if (startImmediately) {
      // Start now: Pay (new plan price - remaining credit)
      amountToPay = Math.max(0, newPlanFullPrice - currentPlanRemainingCredit);
      upgradeType = 'immediate';
    } else {
      // Start after current plan: Pay full price
      amountToPay = newPlanFullPrice;
      upgradeType = 'scheduled';
    }

    // Create new pending subscription
    const newSubscription = await Subscription.create({
      userId: req.user._id,
      planType: newPricing.planType,
      postsPerDay: newPostsPerDay,
      amount: amountToPay,
      currencyCode: currency.code,
      currencySymbol: currency.symbol,
      status: 'pending',
      upgradeType // Store if immediate or scheduled
    });

    let paymentInfo = {
      amount: amountToPay,
      currencyCode: currency.code,
      currencySymbol: currency.symbol,
      note: `AutoLink Upgrade - ${newPostsPerDay} posts/day (${startImmediately ? 'Immediate' : 'Scheduled'})`,
      method: currency.paymentMethod,
      upgradeType,
      startImmediately,
      // Prorating details
      currentPlan: {
        postsPerDay: currentSubscription.postsPerDay,
        fullPrice: currentPlanFullPrice,
        daysUsed,
        daysRemaining,
        usedAmount: currentPlanUsedAmount,
        remainingCredit: currentPlanRemainingCredit,
        endDate: currentSubscription.endDate
      },
      newPlan: {
        postsPerDay: newPostsPerDay,
        fullPrice: newPlanFullPrice
      }
    };

    if (currency.paymentMethod === 'upi' && currency.upiId) {
      paymentInfo.upiId = currency.upiId;
      paymentInfo.upiUrl = `upi://pay?pa=${currency.upiId}&pn=${process.env.UPI_NAME || 'AutoLink'}&am=${amountToPay}&cu=${currency.code}&tn=AutoLink-${newSubscription._id}`;
    } else if (currency.paymentMethod === 'paypal' && currency.paypalEmail) {
      paymentInfo.paypalEmail = currency.paypalEmail;
      paymentInfo.paypalUrl = `https://www.paypal.com/paypalme/${currency.paypalEmail}/${amountToPay}`;
    }

    res.status(201).json({
      success: true,
      subscription: newSubscription,
      paymentInfo
    });
  } catch (error) {
    console.error('Plan upgrade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process plan upgrade'
    });
  }
};

// @desc    Submit payment proof
// @route   POST /api/payment/submit-proof
// @access  Private
export const submitPaymentProof = async (req, res) => {
  try {
    const { transactionId, transactionScreenshot, postsPerDay, currencyCode } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    if (!postsPerDay || !currencyCode) {
      return res.status(400).json({
        success: false,
        message: 'Plan details are required'
      });
    }

    // Get pricing info
    const currency = await Currency.findOne({ code: currencyCode.toUpperCase(), isActive: true });
    const basePricing = await Pricing.findOne({ postsPerDay });

    if (!currency || !basePricing) {
      return res.status(404).json({
        success: false,
        message: 'Invalid plan or currency'
      });
    }

    const amount = Pricing.calculatePrice(basePricing.basePriceUSD, currency.conversionRate);

    // NOW create subscription with transaction ID
    const subscription = await Subscription.create({
      userId: req.user._id,
      planType: basePricing.planType,
      postsPerDay,
      amount,
      currencyCode: currency.code,
      currencySymbol: currency.symbol,
      paymentMethod: currency.paymentMethod,
      transactionId,
      transactionScreenshot,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Payment proof submitted. Waiting for admin verification.',
      subscription
    });
  } catch (error) {
    console.error('Submit payment proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit payment proof'
    });
  }
};

// @desc    Verify payment (Admin only)
// @route   POST /api/payment/verify/:subscriptionId
// @access  Private (Admin)
export const verifyPayment = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { approved } = req.body;

    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (approved) {
      // Cancel old active subscription if upgrading
      await Subscription.updateMany(
        {
          userId: subscription.userId,
          status: 'active',
          _id: { $ne: subscription._id }
        },
        {
          $set: { status: 'cancelled' }
        }
      );

      // Activate new subscription
      subscription.status = 'active';
      subscription.startDate = new Date();
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      subscription.endDate = endDate;

      subscription.paymentVerifiedBy = req.user._id;
      subscription.paymentVerifiedAt = new Date();
      
      await subscription.save();

      // Update automation settings
      await AutomationSettings.findOneAndUpdate(
        { userId: subscription.userId },
        { 
          postsPerDay: subscription.postsPerDay,
          enabled: true
        },
        { upsert: true }
      );

      res.status(200).json({
        success: true,
        message: 'Payment verified and subscription activated',
        subscription
      });
    } else {
      subscription.status = 'cancelled';
      await subscription.save();

      res.status(200).json({
        success: true,
        message: 'Payment rejected',
        subscription
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};

// @desc    Get all pending payments (Admin)
// @route   GET /api/payment/pending
// @access  Private (Admin)
export const getPendingPayments = async (req, res) => {
  try {
    const pendingPayments = await Subscription.find({ 
      status: 'pending',
      transactionId: { $exists: true }
    })
      .populate('userId', 'email name')
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

// @desc    Get user's payment history
// @route   GET /api/payment/history
// @access  Private
export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Subscription.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('planType postsPerDay amount currencyCode currencySymbol status paymentMethod transactionId startDate endDate createdAt paymentVerifiedAt');

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history'
    });
  }
};

export default {
  getCurrencies,
  getPricingByCurrency,
  getSubscription,
  createPaymentRequest,
  upgradePlan,
  submitPaymentProof,
  verifyPayment,
  getPendingPayments,
  getPaymentHistory
};
