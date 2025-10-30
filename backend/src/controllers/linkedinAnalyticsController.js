import axios from 'axios';
import LinkedInAnalyticsAccount from '../models/LinkedInAnalyticsAccount.js';
import { linkedinAnalyticsConfig } from '../config/linkedin.js';

// @desc    Get LinkedIn Analytics OAuth URL
// @route   GET /api/linkedin/analytics-connect
// @access  Private
export const getLinkedInAnalyticsAuthUrl = async (req, res) => {
  try {
    const state = Buffer.from(JSON.stringify({ userId: req.user._id })).toString('base64');
    
    const authUrl = `${linkedinAnalyticsConfig.authUrl}?response_type=code&client_id=${linkedinAnalyticsConfig.clientId}&redirect_uri=${encodeURIComponent(linkedinAnalyticsConfig.redirectUri)}&state=${state}&scope=${encodeURIComponent(linkedinAnalyticsConfig.scope)}`;

    res.status(200).json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error('Get LinkedIn analytics auth URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate authorization URL'
    });
  }
};

// @desc    LinkedIn Analytics OAuth callback
// @route   GET /api/linkedin/analytics-callback
// @access  Public
export const linkedInAnalyticsCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=analytics_access_denied`);
    }

    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Exchange code for access token
    const tokenResponse = await axios.post(linkedinAnalyticsConfig.tokenUrl, null, {
      params: {
        grant_type: 'authorization_code',
        code,
        client_id: linkedinAnalyticsConfig.clientId,
        client_secret: linkedinAnalyticsConfig.clientSecret,
        redirect_uri: linkedinAnalyticsConfig.redirectUri
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get LinkedIn profile
    const profileResponse = await axios.get(`${linkedinAnalyticsConfig.apiBaseUrl}/userinfo`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const profile = profileResponse.data;
    const expiresAt = new Date(Date.now() + (expires_in || 5184000) * 1000);

    const updateData = {
      userId,
      linkedInId: profile.sub,
      accessToken: access_token,
      expiresAt,
      profileData: {
        name: profile.name,
        email: profile.email
      }
    };

    if (refresh_token) {
      updateData.refreshToken = refresh_token;
    }

    await LinkedInAnalyticsAccount.findOneAndUpdate(
      { userId },
      updateData,
      { upsert: true, new: true }
    );

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?analytics=connected`);
  } catch (error) {
    console.error('LinkedIn analytics callback error:', error.response?.data || error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=analytics_connection_failed`);
  }
};

// @desc    Get LinkedIn Analytics account status
// @route   GET /api/linkedin/analytics-status
// @access  Private
export const getAnalyticsStatus = async (req, res) => {
  try {
    const analyticsAccount = await LinkedInAnalyticsAccount.findOne({ userId: req.user._id });

    if (!analyticsAccount) {
      return res.status(200).json({
        success: true,
        connected: false
      });
    }

    res.status(200).json({
      success: true,
      connected: true,
      account: {
        linkedInId: analyticsAccount.linkedInId,
        profileData: analyticsAccount.profileData,
        expiresAt: analyticsAccount.expiresAt
      }
    });
  } catch (error) {
    console.error('Get analytics status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics status'
    });
  }
};

export default { getLinkedInAnalyticsAuthUrl, linkedInAnalyticsCallback, getAnalyticsStatus };


