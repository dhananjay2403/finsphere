const Watchlist = require('../models/Watchlist');


// ---------------------------------------------------------------------------
// @desc    Get the authenticated user's watchlist
// @route   GET /api/watchlist
// @access  Protected
// ---------------------------------------------------------------------------
// Returns the full watchlist document (or an empty symbols array if the user
// has never added a stock). Using findOne + lean for a lightweight read.
// ---------------------------------------------------------------------------
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


// ---------------------------------------------------------------------------
// @desc    Add a stock to the authenticated user's watchlist
// @route   POST /api/watchlist
// @access  Protected
// ---------------------------------------------------------------------------
// Body: { symbol, name }
//
// Strategy:
//   - upsert: true  → create the Watchlist doc on first use (no separate seed step)
//   - $push only runs when the filter's $not:$elemMatch condition passes,
//     i.e. the symbol is NOT already in the array — atomic duplicate prevention.
//   - If the symbol already exists, the filter does not match → returns null
//     → we detect this and respond 409.
// ---------------------------------------------------------------------------
const addToWatchlist = async (req, res, next) => {

  try {
    const { symbol, name } = req.body;
    const upperSymbol = symbol.trim().toUpperCase();

    // Attempt to push — only succeeds if symbol is not already present
    const updated = await Watchlist.findOneAndUpdate(
      {
        userId: req.user._id,
        // Guard: skip $push if symbol already exists in the array
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
      {
        new: true,   // Return the updated document
        upsert: true,   // Create Watchlist doc if user has none yet
        lean: true,
      }
    );

    // If updated is null the upsert was not triggered AND the $ne condition
    // failed — meaning the symbol was already present.
    // Note: with upsert:true, MongoDB will insert if no doc exists (upsert path)
    // OR update if the filter matches (update path).
    // If the doc exists but the $ne condition fails → no write, returns null.
    if (!updated) {
      return res.status(409).json({
        success: false,
        message: `${upperSymbol} is already in your watchlist`,
      });
    }

    // Return only the newly added entry for UI confirmation
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


// ---------------------------------------------------------------------------
// @desc    Remove a stock from the authenticated user's watchlist
// @route   DELETE /api/watchlist/:symbol
// @access  Protected
// ---------------------------------------------------------------------------
// Uses $pull to atomically remove the matching subdocument.
// Returns 404 if the symbol is not found in the watchlist.
// ---------------------------------------------------------------------------
const removeFromWatchlist = async (req, res, next) => {

  try {
    const upperSymbol = req.params.symbol.trim().toUpperCase();

    const updated = await Watchlist.findOneAndUpdate(
      {
        userId: req.user._id,
        'symbols.symbol': upperSymbol, // Only match if symbol actually exists
      },
      {
        $pull: { symbols: { symbol: upperSymbol } },
      },
      { new: true, lean: true }
    );

    // If no document matched, the symbol was not in the watchlist
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
