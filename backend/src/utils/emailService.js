import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ============================================================================
// LOAD EMAIL TEMPLATES
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatesPath = join(__dirname, '../config/emailTemplates.json');
const emailTemplates = JSON.parse(readFileSync(templatesPath, 'utf-8'));

// ============================================================================
// EMAIL TRANSPORTER CONFIGURATION
// ============================================================================

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// ============================================================================
// TEMPLATE HELPERS
// ============================================================================

/**
 * Replace placeholders in template
 * @param {String} template - Template string
 * @param {Object} data - Replacement data
 * @returns {String} Formatted template
 */
const replacePlaceholders = (template, data) => {
  let result = template;
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, data[key] || '');
  });
  return result;
};

/**
 * Wrap content in base layout
 * @param {String} content - Email content
 * @returns {String} Complete HTML
 */
const wrapInLayout = (content) => {
  return replacePlaceholders(emailTemplates.layout.wrapper, {
    content,
    year: new Date().getFullYear()
  });
};

/**
 * Create button HTML
 * @param {String} text - Button text
 * @param {String} url - Button URL
 * @returns {String} Button HTML
 */
const createButton = (text, url) => {
  return replacePlaceholders(emailTemplates.layout.button, { text, url });
};

/**
 * Create OTP box HTML
 * @param {String} otp - OTP code
 * @returns {String} OTP box HTML
 */
const createOTPBox = (otp) => {
  return replacePlaceholders(emailTemplates.layout.otpBox, { otp });
};

// ============================================================================
// CORE EMAIL SENDING FUNCTION
// ============================================================================

/**
 * Send email with template
 * @param {Object} options - Email options
 * @returns {Promise} Send result
 */
const sendEmail = async (options) => {
  const { to, subject, html } = options;

  const mailOptions = {
    from: `AutoLink <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: wrapInLayout(html)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Email failed to: ${to}`, error.message);
    throw error;
  }
};

// ============================================================================
// SPECIFIC EMAIL FUNCTIONS
// ============================================================================

/**
 * Send OTP verification email
 * @param {String} email - Recipient email
 * @param {String} otp - 6-digit OTP code
 * @param {String} name - User name
 */
export const sendOTPEmail = async (email, otp, name = 'there') => {
  const template = emailTemplates.otpVerification;
  const otpBox = createOTPBox(otp);
  
  const html = replacePlaceholders(template.content, {
    name,
    otpBox
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html
  });
};

/**
 * Send verification link email (legacy support)
 * @param {String} email - Recipient email
 * @param {String} token - Verification token
 */
export const sendVerificationEmail = async (email, token) => {
  const template = emailTemplates.emailVerification;
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const button = createButton('Verify Email', verificationUrl);

  const html = replacePlaceholders(template.content, {
    button,
    verificationUrl
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html
  });
};

/**
 * Send password reset email
 * @param {String} email - Recipient email
 * @param {String} token - Reset token
 */
export const sendPasswordResetEmail = async (email, token) => {
  const template = emailTemplates.passwordReset;
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const button = createButton('Reset Password', resetUrl);

  const html = replacePlaceholders(template.content, {
    button,
    resetUrl
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html
  });
};

/**
 * Send welcome email after verification
 * @param {String} email - Recipient email
 * @param {String} name - User name
 */
export const sendWelcomeEmail = async (email, name) => {
  const template = emailTemplates.welcome;
  const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;
  const button = createButton('Go to Dashboard', dashboardUrl);

  const html = replacePlaceholders(template.content, {
    name,
    button
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html
  });
};

/**
 * Send subscription confirmation email
 * @param {String} email - Recipient email
 * @param {Object} subscriptionDetails - Subscription info
 */
export const sendSubscriptionEmail = async (email, subscriptionDetails) => {
  const { planType, postsPerDay, amount, currencySymbol, name } = subscriptionDetails;
  const template = emailTemplates.subscriptionConfirmation;
  const button = createButton('View Dashboard', `${process.env.FRONTEND_URL}/dashboard`);

  const planName = planType.charAt(0).toUpperCase() + planType.slice(1);

  const html = replacePlaceholders(template.content, {
    planType,
    planName,
    postsPerDay,
    amount,
    currencySymbol,
    button
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html
  });
};

/**
 * Send payment verification pending email
 * @param {String} email - Recipient email
 * @param {Object} paymentDetails - Payment info
 */
export const sendPaymentPendingEmail = async (email, paymentDetails) => {
  const { name, planType, transactionId } = paymentDetails;
  const template = emailTemplates.paymentVerification;

  const html = replacePlaceholders(template.content, {
    name,
    planType,
    transactionId
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html
  });
};

/**
 * Send payment approved email
 * @param {String} email - Recipient email
 * @param {Object} subscriptionDetails - Subscription info
 */
export const sendPaymentApprovedEmail = async (email, subscriptionDetails) => {
  const { name, planType, postsPerDay, endDate } = subscriptionDetails;
  const template = emailTemplates.paymentApproved;
  const button = createButton('Go to Dashboard', `${process.env.FRONTEND_URL}/dashboard`);

  const planName = planType.charAt(0).toUpperCase() + planType.slice(1);
  const formattedEndDate = new Date(endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = replacePlaceholders(template.content, {
    name,
    planName,
    postsPerDay,
    endDate: formattedEndDate,
    button
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html
  });
};

/**
 * Send post published notification
 * @param {String} email - Recipient email
 * @param {Object} postDetails - Post info
 */
export const sendPostPublishedEmail = async (email, postDetails) => {
  const { name, topic, publishTime, postUrl } = postDetails;
  const template = emailTemplates.postPublished;
  const button = createButton('View Post on LinkedIn', postUrl);

  const html = replacePlaceholders(template.content, {
    name,
    topic,
    publishTime,
    button
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html
  });
};

/**
 * Send daily report email
 * @param {String} email - Recipient email
 * @param {Object} reportData - Daily statistics
 */
export const sendDailyReportEmail = async (email, reportData) => {
  const { name, postsGenerated, postsPublished, totalLikes, totalComments } = reportData;
  const template = emailTemplates.dailyReport;
  const button = createButton('View Dashboard', `${process.env.FRONTEND_URL}/dashboard`);

  const html = replacePlaceholders(template.content, {
    name,
    postsGenerated,
    postsPublished,
    totalLikes,
    totalComments,
    button
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html
  });
};

export default {
  sendOTPEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendSubscriptionEmail,
  sendPaymentPendingEmail,
  sendPaymentApprovedEmail,
  sendPostPublishedEmail,
  sendDailyReportEmail
};
