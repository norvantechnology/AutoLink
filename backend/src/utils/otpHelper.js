/**
 * OTP Helper Functions
 * Generate and validate OTPs
 */

/**
 * Generate 6-digit OTP
 * @returns {String} 6-digit OTP code
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Get OTP expiry time (10 minutes from now)
 * @returns {Date} Expiry date
 */
export const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

/**
 * Verify if OTP is valid and not expired
 * @param {String} providedOTP - OTP provided by user
 * @param {String} storedOTP - OTP stored in database
 * @param {Date} expiryDate - OTP expiry date
 * @returns {Object} Validation result
 */
export const verifyOTP = (providedOTP, storedOTP, expiryDate) => {
  if (!storedOTP || !expiryDate) {
    return { valid: false, message: 'No OTP found. Please request a new one.' };
  }

  if (new Date() > new Date(expiryDate)) {
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (providedOTP !== storedOTP) {
    return { valid: false, message: 'Invalid OTP. Please check and try again.' };
  }

  return { valid: true };
};

export default {
  generateOTP,
  getOTPExpiry,
  verifyOTP
};

