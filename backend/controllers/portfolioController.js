const Holding = require('../models/Holding');

// ---------------------------------------------------------------------------
// @desc    Get all holdings for the authenticated user
// @route   GET /api/portfolio/holdings
// @access  Protected
// ---------------------------------------------------------------------------
// Returns an array of holding documents for the current user.
// Each item includes all fields needed by the Holdings table in Portfolio.jsx:
//   symbol, name, quantity, avgCostPrice
//
// currentPrice and unrealisedPnL are placeholders (null) until the stock-
// data service (Milestone 12) is wired in.  The shape is final so the
// frontend can be built against it today.
// ---------------------------------------------------------------------------
const getHoldings = async (req, res, next) => {

  try {
    const holdings = await Holding.find({ userId: req.user._id })
      .sort({ symbol: 1 }) // Alphabetical — consistent ordering for the UI
      .lean();              // Plain JS objects — faster, no Mongoose overhead for read-only

    const payload = holdings.map((h) => ({
      _id:           h._id,
      symbol:        h.symbol,
      name:          h.name,
      quantity:      h.quantity,
      avgCostPrice:  h.avgCostPrice,
      totalInvested: parseFloat((h.quantity * h.avgCostPrice).toFixed(2)),

      // Future: populated by stockService once live prices are available
      currentPrice:    null,
      currentValue:    null,
      unrealisedPnL:   null,
      unrealisedPnLPct: null,
    }));

    return res.status(200).json({
      success: true,
      count:   payload.length,
      data:    payload,
    });
  }

  catch (err) {
    next(err);
  }
};


// ---------------------------------------------------------------------------
// @desc    Get portfolio summary for the authenticated user
// @route   GET /api/portfolio/summary
// @access  Protected
// ---------------------------------------------------------------------------
// Returns the four values that drive the right-column cards in Portfolio.jsx:
//   cashBalance    — user.balance (cash not yet invested)
//   totalInvested  — sum(quantity × avgCostPrice) across all holdings
//   currentValue   — same as totalInvested until live prices are available
//   totalReturn    — currentValue - totalInvested (= 0 until live prices)
//   totalReturnPct — percentage gain/loss (= 0 until live prices)
//
// Rationale for currentValue === totalInvested:
//   Without a price feed we cannot mark positions to market.  Returning
//   totalInvested is more honest than returning null — the UI gracefully
//   shows 0 P&L rather than a broken skeleton.
// ---------------------------------------------------------------------------
const getSummary = async (req, res, next) => {

  try {
    // req.user is attached by authMiddleware.protect — contains live balance
    const cashBalance = req.user.balance;

    // Aggregate total invested across all holdings in one DB round-trip
    const [agg] = await Holding.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id:           null,
          totalInvested: {
            $sum: { $multiply: ['$quantity', '$avgCostPrice'] },
          },
        },
      },
    ]);

    const totalInvested  = agg ? parseFloat(agg.totalInvested.toFixed(2)) : 0;
    const currentValue   = totalInvested; // Placeholder — no live price feed yet
    const totalReturn    = parseFloat((currentValue - totalInvested).toFixed(2));
    const totalReturnPct = totalInvested > 0
      ? parseFloat(((totalReturn / totalInvested) * 100).toFixed(2))
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        cashBalance,
        totalInvested,
        currentValue,
        totalReturn,
        totalReturnPct,

        // Portfolio value = cash + market value of all holdings
        portfolioValue: parseFloat((cashBalance + currentValue).toFixed(2)),
      },
    });
  }

  catch (err) {
    next(err);
  }
};


// ---------------------------------------------------------------------------
// @desc    Get cash balance for the authenticated user
// @route   GET /api/portfolio/cash
// @access  Protected
// ---------------------------------------------------------------------------
// Thin endpoint for components that only need the available cash figure
// (e.g. the "Cash Available" card in Portfolio.jsx) without fetching the
// full summary.  Reads directly from req.user — no extra DB query.
// ---------------------------------------------------------------------------
const getCash = (req, res) => {

  return res.status(200).json({
    success: true,
    data: {
      cashBalance: req.user.balance,
    },
  });
};


module.exports = { getHoldings, getSummary, getCash };
