const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {

  try {
    const { name, email, password } = req.body;

    // Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Hash password — salt rounds: 10 (good balance of security vs speed)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        createdAt: user.createdAt,
      },
    });
  }

  catch (err) {
    next(err);
  }
};


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {

  try {
    const { email, password } = req.body;

    // Find user — explicitly include password (select: false on schema)
    const user = await User.findOne({ email }).select('+password');

    // Generic message for both "not found" and "wrong password" — prevents email enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Compare submitted password against stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        createdAt: user.createdAt,
      },
    });
  }

  catch (err) {
    next(err);
  }
};


// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Protected
const getMe = (req, res) => {

  const { _id, name, email, balance, createdAt } = req.user;

  res.status(200).json({
    success: true,
    user: { _id, name, email, balance, createdAt },
  });
};


module.exports = { register, login, getMe };
