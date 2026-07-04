const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');

// POST /api/auth/register
const register = async (req, res, next) => {

  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // 10 salt rounds — reasonable tradeoff between hash strength and login latency
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
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


// POST /api/auth/login
const login = async (req, res, next) => {

  try {
    const { email, password } = req.body;

    // password has select: false on the schema, so it has to be requested explicitly
    const user = await User.findOne({ email }).select('+password');

    // Same message for "no such user" and "wrong password" so a login attempt
    // can't be used to fish for which emails have accounts.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

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


// GET /api/auth/me
const getMe = (req, res) => {

  const { _id, name, email, balance, createdAt } = req.user;

  res.status(200).json({
    success: true,
    user: { _id, name, email, balance, createdAt },
  });
};


module.exports = { register, login, getMe };
