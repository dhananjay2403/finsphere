const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protects routes that require authentication.
 *
 * Expects:  Authorization: Bearer <token>
 * Attaches: req.user (the authenticated user document, without password)
 */
const protect = async (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {

    return res.status(401).json({
      success: false,
      message: 'Not authorised — no token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB — confirms the account still exists
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorised — user no longer exists',
      });
    }

    req.user = user;
    next();
  }

  catch (err) {
    // Covers TokenExpiredError, JsonWebTokenError, NotBeforeError
    return res.status(401).json({
      success: false,
      message: 'Not authorised — invalid or expired token',
    });
  }
};

module.exports = { protect };
