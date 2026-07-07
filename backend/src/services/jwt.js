const jwt = require('jsonwebtoken');

/**
 * JWT Service
 * 
 * Provides JWT token generation and verification for authentication.
 * Tokens expire after 7 days and use HS256 algorithm.
 */

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '7d'; // 7 days (604800 seconds)
const ALGORITHM = 'HS256';

// Validate JWT_SECRET is configured
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

/**
 * Sign a payload and generate a JWT token
 * 
 * @param {object} payload - Payload to include in token (should contain id and email)
 * @returns {string} - Signed JWT token
 * @throws {Error} - If signing fails
 */
function sign(payload) {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      algorithm: ALGORITHM,
      expiresIn: JWT_EXPIRATION,
    });
    return token;
  } catch (error) {
    throw new Error(`JWT signing failed: ${error.message}`);
  }
}

/**
 * Verify and decode a JWT token
 * 
 * @param {string} token - JWT token to verify
 * @returns {object|null} - Decoded payload if valid, null if invalid
 */
function verify(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: [ALGORITHM],
    });
    return decoded;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

module.exports = {
  sign,
  verify,
};
