/**
 * Global error handler middleware
 * Catches unhandled errors and returns safe responses to clients
 * Includes Prisma error handling
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.6, 8.7, 10.1-10.5
 */

const logger = require('../utils/logger');

/**
 * Error handler middleware - must be registered last in Express middleware chain
 * @param {Error} err - Error object
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {NextFunction} next - Express next function
 */
function errorHandler(err, req, res, next) {
  // Log the full error with stack trace for debugging
  logger.error(`Unhandled error: ${err.message}`);
  logger.error(`Stack trace: ${err.stack}`);
  
  // Log request details for context
  logger.error(`Request: ${req.method} ${req.path}`);
  
  // Handle Prisma-specific errors
  if (err.code) {
    // P2002: Unique constraint violation
    if (err.code === 'P2002') {
      logger.warn(`Unique constraint violation: ${err.meta?.target}`);
      return res.status(409).json({
        error: 'Resource already exists'
      });
    }
    
    // P2025: Record not found
    if (err.code === 'P2025') {
      logger.warn('Record not found in database');
      return res.status(404).json({
        error: 'Resource not found'
      });
    }
    
    // P2003: Foreign key constraint violation
    if (err.code === 'P2003') {
      logger.warn(`Foreign key constraint violation: ${err.meta?.field_name}`);
      return res.status(400).json({
        error: 'Invalid reference'
      });
    }
  }
  
  // Never expose internal error details to client
  // Return generic error message to prevent information leakage
  res.status(500).json({
    error: 'Internal server error'
  });
}

module.exports = errorHandler;
