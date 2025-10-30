/**
 * Common formatting utilities
 */

/**
 * Format date to readable string
 * @param {Date|String} date - Date to format
 * @param {String} format - Format type ('short', 'long', 'time')
 * @returns {String} Formatted date
 */
export const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  
  const formats = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    time: { hour: '2-digit', minute: '2-digit' }
  };
  
  return d.toLocaleDateString('en-US', formats[format] || formats.short);
};

/**
 * Format number with commas
 * @param {Number} num - Number to format
 * @returns {String} Formatted number
 */
export const formatNumber = (num) => {
  return num?.toLocaleString() || '0';
};

/**
 * Truncate text with ellipsis
 * @param {String} text - Text to truncate
 * @param {Number} maxLength - Maximum length
 * @returns {String} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get word count from text
 * @param {String} text - Text to count
 * @returns {Number} Word count
 */
export const getWordCount = (text) => {
  return text?.trim().split(/\s+/).length || 0;
};

export default {
  formatDate,
  formatNumber,
  truncateText,
  getWordCount
};

