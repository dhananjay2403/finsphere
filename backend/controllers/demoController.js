const bcrypt   = require('bcryptjs');
const User      = require('../models/User');
const Holding   = require('../models/Holding');
const Trade     = require('../models/Trade');
const Watchlist = require('../models/Watchlist');
const generateToken = require('../utils/generateToken');
const { INITIAL_BALANCE } = require('../utils/constants');

// Shared demo account — visible to everyone, holds no personal data.
const DEMO_EMAIL    = 'demo@finsphere.com';
const DEMO_PASSWORD = 'Demo@finsphere1';
const DEMO_NAME     = 'Demo User';


// Wipes trades, holdings, and watchlist and restores cash to the starting state. Idempotent on a fresh account.
const resetAccount = async (userId) => {
  await Promise.all([
    Trade.deleteMany({ userId }),
    Holding.deleteMany({ userId }),
    Watchlist.updateOne({ userId }, { $set: { symbols: [] } }, { upsert: false }),
  ]);
  await User.updateOne({ _id: userId }, { $set: { balance: INITIAL_BALANCE } });
};


// POST /api/demo/reset — resets the shared demo account to its initial state,
// so every demo session starts clean. Public: only ever touches the demo user.
const resetDemo = async (req, res, next) => {
  try {
    const demoUser = await User.findOne({ email: DEMO_EMAIL });

    if (!demoUser) {
      return res.status(200).json({
        success: true,
        message: 'Demo account not yet created — no reset needed',
      });
    }

    await resetAccount(demoUser._id);

    return res.status(200).json({
      success: true,
      message: 'Demo account reset to initial state',
    });
  }
  catch (err) {
    next(err);
  }
};


// POST /api/demo/login — one-shot demo entry: self-provisions the shared account if missing, resets it, returns a JWT.
const demoLogin = async (req, res, next) => {
  try {
    let demoUser = await User.findOne({ email: DEMO_EMAIL });

    if (!demoUser) {
      // First-ever demo visit (or a wiped DB) — create the account.
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, salt);
      demoUser = await User.create({
        name:     DEMO_NAME,
        email:    DEMO_EMAIL,
        password: hashedPassword,
      });
    }

    // Start every session from a clean slate.
    await resetAccount(demoUser._id);

    const token = generateToken(demoUser._id);

    return res.status(200).json({
      success: true,
      message: 'Demo session ready',
      token,
      user: {
        _id:       demoUser._id,
        name:      demoUser.name,
        email:     demoUser.email,
        balance:   INITIAL_BALANCE, // reset above, so report the fresh value
        createdAt: demoUser.createdAt,
      },
    });
  }
  catch (err) {
    next(err);
  }
};


module.exports = { resetDemo, demoLogin };
