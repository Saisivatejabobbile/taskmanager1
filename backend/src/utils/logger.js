/**
 * Logger Utility
 * 
 * Provides structured logging functions with timestamps and log levels.
 * Logs to console in a consistent format for easy debugging and monitoring.
 */

/**
 * Get current timestamp in ISO 8601 format
 * @returns {string} - ISO timestamp
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level (INFO, WARN, ERROR)
 * @param {string} message - Log message
 * @param {object} context - Additional context data
 * @returns {string} - Formatted log message
 */
function formatLog(level, message, context = {}) {
  const timestamp = getTimestamp();
  const contextStr = Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] ${level} ${message}${contextStr}`;
}

/**
 * Log informational message
 * @param {string} message - Log message
 * @param {object} context - Additional context data
 */
function info(message, context = {}) {
  console.log(formatLog('INFO', message, context));
}

/**
 * Log warning message
 * @param {string} message - Log message
 * @param {object} context - Additional context data
 */
function warn(message, context = {}) {
  console.warn(formatLog('WARN', message, context));
}

/**
 * Log error message
 * @param {string} message - Log message
 * @param {object} context - Additional context data (may include error stack)
 */
function error(message, context = {}) {
  console.error(formatLog('ERROR', message, context));
}

module.exports = {
  info,
  warn,
  error,
};
