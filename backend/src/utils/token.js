/**
 * ===============================
 * JWT Token Helpers
 * ===============================
 * @module jwtHelpers
 * @desc Utility functions to generate and verify JSON Web Tokens for authentication.
 */

const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user
 * 
 * Signs a token containing the user's ID and role. The token expires in ~60 days.
 * 
 * @function generateToken
 * @param {Object} user - User object
 * @param {number|string} user.id - User ID
 * @param {string} user.role - User role (e.g., customer, vendor, delivery)
 * @returns {string} Signed JWT token
 * 
 * @example
 * const token = generateToken({ id: 1, role: 'customer' });
 */
exports.generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '60d' }
    );
};

/**
 * Verify a JWT token
 * 
 * Decodes and verifies the provided token using the secret key.
 * Throws an error if the token is invalid or expired.
 * 
 * @function verifyToken
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded payload containing user's id and role
 * 
 * @example
 * const payload = verifyToken(token);
 * console.log(payload.id, payload.role);
 */
exports.verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

