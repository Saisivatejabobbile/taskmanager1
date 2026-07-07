const bcrypt = require('bcrypt');

/**
 * Password Service
 * 
 * Provides secure password hashing and verification using bcrypt.
 * Uses 10 salt rounds as a balance between security and performance.
 */

const SALT_ROUNDS = 10;

/**
 * Hash a plaintext password using bcrypt
 * 
 * @param {string} password - Plaintext password to hash
 * @returns {Promise<string>} - Bcrypt hash string
 * @throws {Error} - If hashing fails
 */
async function hash(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

/**
 * Verify a plaintext password against a bcrypt hash
 * 
 * @param {string} password - Plaintext password to verify
 * @param {string} hash - Bcrypt hash to compare against
 * @returns {Promise<boolean>} - True if password matches, false otherwise
 * @throws {Error} - If verification fails
 */
async function verify(password, hash) {
  try {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    throw new Error(`Password verification failed: ${error.message}`);
  }
}

module.exports = {
  hash,
  verify,
};
