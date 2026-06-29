const User     = require('../models/User');
const Holding  = require('../models/Holding');
const Trade    = require('../models/Trade');
const Watchlist = require('../models/Watchlist');
const { INITIAL_BALANCE } = require('../utils/constants');

const DEMO_EMAIL = 'demo@finsphere.com';

// ---------------------------------------------------------------------------
// @desc    Reset the shared demo account to its initial state
// @route   POST /api/demo/reset
// @access  Public — intentionally open, only touches the demo account
// ---------------------------------------------------------------------------
// Called by the frontend immediately before logging in as the demo user.
// Guarantees that every new demo session starts with a clean slate:
//
//   • All trades deleted
//   • All holdings deleted
//   • Watchlist cleared
//   • Cash balance restored to INITIAL_BALANCE ($100,000)
//
// Only the demo@finsphere.com account is ever modified.
// If the account does not yet exist, the reset is a no-op (returns success).
// ---------------------------------------------------------------------------
const resetDemo = async (req, res, next) => {
  try {
    const demoUser = await User.findOne({ email: DEMO_EMAIL });

    if (!demoUser) {
      // Account hasn't been created yet — nothing to reset
      return res.status(200).json({
        success: true,
        message: 'Demo account not yet created — no reset needed',
      });
    }

    const userId = demoUser._id;

    // Run all three wipes in parallel for speed
    await Promise.all([
      Trade.deleteMany({ userId }),
      Holding.deleteMany({ userId }),
      Watchlist.updateOne(
        { userId },
        { $set: { symbols: [] } },
        { upsert: false }
      ),
    ]);

    // Reset cash balance back to starting amount
    await User.updateOne({ _id: userId }, { $set: { balance: INITIAL_BALANCE } });

    return res.status(200).json({
      success: true,
      message: 'Demo account reset to initial state',
    });
  }

  catch (err) {
    next(err);
  }
};


module.exports = { resetDemo };
