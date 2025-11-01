import EmailClick from '../models/EmailClick.js';

// Helper function to parse user agent
function parseUserAgent(userAgent) {
  const ua = userAgent || '';
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Opera')) browser = 'Opera';
  
  // Detect device
  let device = 'Desktop';
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    if (/iPad/i.test(ua)) device = 'Tablet';
    else device = 'Mobile';
  }
  
  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  return { browser, device, os };
}

// @desc    Track email click
// @route   POST /api/email-tracking/click
// @access  Public
export const trackEmailClick = async (req, res) => {
  try {
    const { email, source, campaign, ts, page } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Get IP address
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || 
                      req.headers['x-real-ip'] || 
                      req.connection.remoteAddress;

    // Parse user agent
    const userAgent = req.headers['user-agent'] || '';
    const { browser, device, os } = parseUserAgent(userAgent);

    // Get referrer
    const referrer = req.headers['referer'] || req.headers['referrer'] || '';

    // Create click record
    const emailClick = await EmailClick.create({
      email: email.toLowerCase().trim(),
      source: source || 'email',
      campaign: campaign || 'automation',
      emailSentTimestamp: ts ? parseInt(ts) : null,
      ipAddress,
      userAgent,
      browser,
      device,
      os,
      referrer,
      landingPage: page || 'home',
      clickedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Click tracked successfully',
      data: emailClick
    });

  } catch (error) {
    console.error('Email tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track click'
    });
  }
};

// @desc    Get email click analytics (Admin)
// @route   GET /api/email-tracking/analytics
// @access  Private (Admin)
export const getEmailAnalytics = async (req, res) => {
  try {
    const { campaign, startDate, endDate, limit = 100 } = req.query;

    // Build query
    const query = {};
    if (campaign) query.campaign = campaign;
    if (startDate || endDate) {
      query.clickedAt = {};
      if (startDate) query.clickedAt.$gte = new Date(startDate);
      if (endDate) query.clickedAt.$lte = new Date(endDate);
    }

    // Get clicks
    const clicks = await EmailClick.find(query)
      .sort({ clickedAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Get statistics
    const totalClicks = await EmailClick.countDocuments(query);
    const uniqueClicks = await EmailClick.distinct('email', query).then(arr => arr.length);

    // Group by date
    const clicksByDate = await EmailClick.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    // Group by device
    const clicksByDevice = await EmailClick.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$device',
          count: { $sum: 1 }
        }
      }
    ]);

    // Group by browser
    const clicksByBrowser = await EmailClick.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$browser',
          count: { $sum: 1 }
        }
      }
    ]);

    // Most active emails
    const topClickers = await EmailClick.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$email',
          clicks: { $sum: 1 },
          lastClick: { $max: '$clickedAt' }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalClicks,
        uniqueClicks,
        clickRate: uniqueClicks > 0 ? ((uniqueClicks / totalClicks) * 100).toFixed(2) : 0,
        clicksByDate,
        clicksByDevice,
        clicksByBrowser,
        topClickers,
        recentClicks: clicks
      }
    });

  } catch (error) {
    console.error('Get email analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics'
    });
  }
};

// @desc    Get email campaign summary (Admin)
// @route   GET /api/email-tracking/summary
// @access  Private (Admin)
export const getEmailCampaignSummary = async (req, res) => {
  try {
    const { campaign = 'automation' } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    // Get click stats
    const [totalClicks, todayClicks, weekClicks, monthClicks] = await Promise.all([
      EmailClick.countDocuments({ campaign }),
      EmailClick.countDocuments({ campaign, clickedAt: { $gte: today } }),
      EmailClick.countDocuments({ campaign, clickedAt: { $gte: thisWeek } }),
      EmailClick.countDocuments({ campaign, clickedAt: { $gte: thisMonth } })
    ]);

    // Get unique email counts
    const [uniqueTotal, uniqueToday, uniqueWeek, uniqueMonth] = await Promise.all([
      EmailClick.distinct('email', { campaign }).then(arr => arr.length),
      EmailClick.distinct('email', { campaign, clickedAt: { $gte: today } }).then(arr => arr.length),
      EmailClick.distinct('email', { campaign, clickedAt: { $gte: thisWeek } }).then(arr => arr.length),
      EmailClick.distinct('email', { campaign, clickedAt: { $gte: thisMonth } }).then(arr => arr.length)
    ]);

    res.status(200).json({
      success: true,
      summary: {
        allTime: {
          totalClicks,
          uniqueClicks: uniqueTotal
        },
        today: {
          totalClicks: todayClicks,
          uniqueClicks: uniqueToday
        },
        thisWeek: {
          totalClicks: weekClicks,
          uniqueClicks: uniqueWeek
        },
        thisMonth: {
          totalClicks: monthClicks,
          uniqueClicks: uniqueMonth
        }
      }
    });

  } catch (error) {
    console.error('Get campaign summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get campaign summary'
    });
  }
};

export default { trackEmailClick, getEmailAnalytics, getEmailCampaignSummary };

