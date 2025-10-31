import axios from 'axios';
import LinkedInAccount from '../models/LinkedInAccount.js';
import linkedinConfig from '../config/linkedin.js';

// @desc    Get LinkedIn OAuth URL
// @route   GET /api/linkedin/connect
// @access  Private
export const getLinkedInAuthUrl = async (req, res) => {
  try {
    const state = Buffer.from(JSON.stringify({ userId: req.user._id })).toString('base64');
    
    // Add prompt=consent to force re-authorization even if previously authorized
    const authUrl = `${linkedinConfig.authUrl}?response_type=code&client_id=${linkedinConfig.clientId}&redirect_uri=${encodeURIComponent(linkedinConfig.redirectUri)}&state=${state}&scope=${encodeURIComponent(linkedinConfig.scope)}&prompt=consent`;

    res.status(200).json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error('Get LinkedIn auth URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate authorization URL'
    });
  }
};

// @desc    LinkedIn OAuth callback
// @route   GET /api/linkedin/callback
// @access  Public
export const linkedInCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=access_denied`);
    }

    // Decode state to get userId
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Exchange code for access token
    const tokenResponse = await axios.post(linkedinConfig.tokenUrl, null, {
      params: {
        grant_type: 'authorization_code',
        code,
        client_id: linkedinConfig.clientId,
        client_secret: linkedinConfig.clientSecret,
        redirect_uri: linkedinConfig.redirectUri
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get LinkedIn profile
    const profileResponse = await axios.get(`${linkedinConfig.apiBaseUrl}/userinfo`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const profile = profileResponse.data;

    // Calculate expiration date (default to 60 days if not provided)
    const expiresAt = new Date(Date.now() + (expires_in || 5184000) * 1000);

    // Prepare update data
    const updateData = {
      userId,
      linkedInId: profile.sub,
      accessToken: access_token,
      expiresAt,
      profileData: {
        name: profile.name,
        email: profile.email,
        profilePicture: profile.picture
      }
    };

    // Only add refresh token if it exists
    if (refresh_token) {
      updateData.refreshToken = refresh_token;
    }

    // Save or update LinkedIn account
    await LinkedInAccount.findOneAndUpdate(
      { userId },
      updateData,
      { upsert: true, new: true }
    );

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?linkedin=connected`);
  } catch (error) {
    console.error('LinkedIn callback error:', error.response?.data || error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=connection_failed`);
  }
};

// @desc    Get LinkedIn account status
// @route   GET /api/linkedin/status
// @access  Private
export const getLinkedInStatus = async (req, res) => {
  try {
    
    // Check how many accounts exist for this user
    const accountCount = await LinkedInAccount.countDocuments({ userId: req.user._id });
    
    const linkedInAccount = await LinkedInAccount.findOne({ userId: req.user._id });

    if (!linkedInAccount) {
      return res.status(200).json({
        success: true,
        connected: false,
        accountCount: 0
      });
    }

    res.status(200).json({
      success: true,
      connected: true,
      accountCount: accountCount,
      account: {
        linkedInId: linkedInAccount.linkedInId,
        profileData: linkedInAccount.profileData,
        expiresAt: linkedInAccount.expiresAt
      }
    });
  } catch (error) {
    console.error('[STATUS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get LinkedIn status'
    });
  }
};

// @desc    Disconnect LinkedIn account
// @route   DELETE /api/linkedin/disconnect
// @access  Private
export const disconnectLinkedIn = async (req, res) => {
  try {
    
    // First, find all LinkedIn accounts for this user to revoke tokens
    const linkedInAccounts = await LinkedInAccount.find({ userId: req.user._id });
    
    // Revoke each access token before deleting
    for (const account of linkedInAccounts) {
      try {
        const decryptedToken = account.getDecryptedAccessToken();
        
        // LinkedIn token revocation endpoint
        await axios.post('https://www.linkedin.com/oauth/v2/revoke', 
          `token=${decryptedToken}&client_id=${linkedinConfig.clientId}&client_secret=${linkedinConfig.clientSecret}`,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
      } catch (revokeError) {
        // Log but don't fail if token revocation fails (token might be expired)
        console.warn(`[DISCONNECT] Failed to revoke token for ${account.linkedInId}:`, revokeError.message);
      }
    }
    
    // Now delete the accounts from database
    const result = await LinkedInAccount.deleteMany({ userId: req.user._id });
    

    res.status(200).json({
      success: true,
      message: `LinkedIn account(s) disconnected successfully. Deleted ${result.deletedCount} account(s)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('[DISCONNECT] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect LinkedIn account'
    });
  }
};

export default { getLinkedInAuthUrl, linkedInCallback, getLinkedInStatus, disconnectLinkedIn };

