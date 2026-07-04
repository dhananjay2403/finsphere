const User     = require('../models/User');
const Holding  = require('../models/Holding');
const Trade    = require('../models/Trade');
const Watchlist = require('../models/Watchlist');
const { INITIAL_BALANCE } = require('../utils/constants');

const DEMO_EMAIL = 'demo@finsphere.com';

// POST /api/demo/reset — wipes trades, holdings, and watchlist and restores
// cash for the shared demo account, so every demo session starts clean.
// Left open (no auth) since it only ever touches demo@finsphere.com.
const resetDemo = async (req, res, next) => {
  try {
    const demoUser = await User.findOne({ email: DEMO_EMAIL });

    if (!demoUser) {
      return res.status(200).json({
        success: true,
        message: 'Demo account not yet created — no reset needed',
      });
    }

    const userId = demoUser._id;

    await Promise.all([
      Trade.deleteMany({ userId }),
      Holding.deleteMany({ userId }),
      Watchlist.updateOne(
        { userId },
        { $set: { symbols: [] } },
        { upsert: false }
      ),
    ]);

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
