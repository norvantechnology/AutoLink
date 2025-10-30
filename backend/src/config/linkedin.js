import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Main LinkedIn App (for posting)
export const linkedinConfig = {
  clientId: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  redirectUri: process.env.LINKEDIN_REDIRECT_URI,
  scope: 'openid profile email w_member_social',
  authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
  apiBaseUrl: 'https://api.linkedin.com/v2',
};

// Analytics LinkedIn App (for fetching engagement - Community Management API)
export const linkedinAnalyticsConfig = {
  clientId: process.env.LINKEDIN_ANALYTICS_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_ANALYTICS_CLIENT_SECRET,
  redirectUri: process.env.LINKEDIN_ANALYTICS_REDIRECT_URI,
  scope: 'openid profile email r_organization_social r_basicprofile',
  authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
  apiBaseUrl: 'https://api.linkedin.com/v2',
};

export default linkedinConfig;

