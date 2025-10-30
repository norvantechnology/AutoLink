/**
 * Common response helpers for controllers
 * Reduces code duplication and standardizes API responses
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (res, data = {}, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    ...data
  });
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default: 500)
 */
export const sendError = (res, message, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    message
  });
};

/**
 * Handle async controller errors
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validate required fields
 * @param {Object} body - Request body
 * @param {Array} required Fields - Array of required field names
 * @returns {Object|null} Error object or null if valid
 */
export const validateRequired = (body, requiredFields) => {
  const missing = requiredFields.filter(field => !body[field]);
  
  if (missing.length > 0) {
    return {
      valid: false,
      message: `Missing required fields: ${missing.join(', ')}`
    };
  }
  
  return { valid: true };
};

export default {
  sendSuccess,
  sendError,
  asyncHandler,
  validateRequired
};

