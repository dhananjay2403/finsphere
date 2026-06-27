const jwt = require('jsonwebtoken');

/**
 * Signs and returns a JWT for the given user ID.
 *
 * Payload contains only the user _id — nothing sensitive.
 * The token is signed with JWT_SECRET from the environment.
 * Expiry is controlled by JWT_EXPIRE (default: 7d).
 */
const generateToken = (userId) => {

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};


module.exports = generateToken;
