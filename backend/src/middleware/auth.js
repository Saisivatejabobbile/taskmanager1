/**
 * Authentication Middleware
 * 
 * Validates JWT tokens and extracts user identity for protected routes.
 * Enforces authentication requirements for all CRUD endpoints.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 12.1, 12.2, 12.3, 12.5, 12.6
 */

const jwtService = require('../services/jwt');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 * Validates JWT token from Authorization header and attaches user info to request
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
function authenticateToken(req, res, next) {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    // Check if Authorization header is present
    if (!authHeader) {
      logger.warn('Authentication attempt without Authorization header');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Parse "Bearer <token>" format
    const parts = authHeader.split(' ');
    
    // Validate format: should be exactly 2 parts ["Bearer", "<token>"]
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logger.warn('Malformed Authorization header format');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = parts[1];

    // Verify token using JWT service
    const decoded = jwtService.verify(token);

    // Check if token is invalid or expired
    if (!decoded) {
      logger.warn('Invalid or expired token provided');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user information to request object
    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    // Log successful authentication
    logger.info(`User authenticated: ${decoded.email}`);

    // Proceed to next middleware/route handler
    next();

  } catch (error) {
    // Handle unexpected errors
    logger.error(`Authentication error: ${error.message}`);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  authenticateToken
};
