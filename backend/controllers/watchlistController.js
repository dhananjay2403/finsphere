const Watchlist = require('../models/Watchlist');


// GET /api/watchlist — empty symbols array if the user has never added a stock
const getWatchlist = async (req, res, next) => {

  try {
    const watchlist = await Watchlist.findOne({ userId: req.user._id }).lean();

    return res.status(200).json({
      success: true,
      count: watchlist ? watchlist.symbols.length : 0,
      data: watchlist ? watchlist.symbols : [],
    });
  }

  catch (err) {
    next(err);
  }
};


// POST /api/watchlist — body: { symbol, name }
//
// The 'symbols.symbol': { $ne } filter only matches when the symbol isn't
// already in the array, so $push only runs for a genuinely new entry — an
// atomic way to prevent duplicates without a separate read first. upsert:
// true also creates the Watchlist doc on a user's first-ever add. If the
// symbol's already there, the filter just doesn't match and we get null back.
const addToWatchlist = async (req, res, next) => {

  try {
    const { symbol, name } = req.body;
    const upperSymbol = symbol.trim().toUpperCase();

    const updated = await Watchlist.findOneAndUpdate(
      {
        userId: req.user._id,
        'symbols.symbol': { $ne: upperSymbol },
      },
      {
        $push: {
          symbols: {
            symbol: upperSymbol,
            name: name.trim(),
            addedAt: new Date(),
          },
        },
      },
      { new: true, upsert: true, lean: true }
    );

    if (!updated) {
      return res.status(409).json({
        success: false,
        message: `${upperSymbol} is already in your watchlist`,
      });
    }

    const added = updated.symbols.find((s) => s.symbol === upperSymbol);

    return res.status(201).json({
      success: true,
      message: `${upperSymbol} added to watchlist`,
      data: added,
    });
  }

  catch (err) {
    next(err);
  }
};


// DELETE /api/watchlist/:symbol
const removeFromWatchlist = async (req, res, next) => {

  try {
    const upperSymbol = req.params.symbol.trim().toUpperCase();

    const updated = await Watchlist.findOneAndUpdate(
      {
        userId: req.user._id,
        'symbols.symbol': upperSymbol, // only matches if it's actually there
      },
      { $pull: { symbols: { symbol: upperSymbol } } },
      { new: true, lean: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `${upperSymbol} is not in your watchlist`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `${upperSymbol} removed from watchlist`,
      count: updated.symbols.length,
      data: updated.symbols,
    });
  }

  catch (err) {
    next(err);
  }
};


module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
