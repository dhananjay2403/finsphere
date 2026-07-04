const jwt = require('jsonwebtoken');

// Signs a JWT for the given user ID. Payload is just the id — nothing sensitive.
const generateToken = (userId) => {

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};


module.exports = generateToken;
