const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the Bearer token and attaches req.user for downstream routes.
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

    // re-fetch to confirm the account still exists, not just that the token is valid
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
