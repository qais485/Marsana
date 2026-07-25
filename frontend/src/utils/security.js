/**
 * Security utilities for input sanitization and XSS prevention
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for HTML insertion
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize user input by removing potentially dangerous characters
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (!input) return '';
  return String(input)
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

/**
 * Validate and parse JSON safely
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed value or default
 */
export function safeJsonParse(jsonString, defaultValue = null) {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch {
    return defaultValue;
  }
}

/**
 * Generate a secure random token
 * @param {number} length - Length of the token
 * @returns {string} Random token
 */
export function generateSecureToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if a URL is safe (not javascript: or data:)
 * @param {string} url - URL to check
 * @returns {boolean} True if URL is safe
 */
export function isSafeUrl(url) {
  if (!url) return false;
  const lowerUrl = url.toLowerCase().trim();
  return !lowerUrl.startsWith('javascript:') && 
         !lowerUrl.startsWith('data:') &&
         !lowerUrl.startsWith('vbscript:');
}