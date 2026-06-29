const Holding          = require('../models/Holding');
const PortfolioSnapshot = require('../models/PortfolioSnapshot');
const stockService     = require('../services/stockService');


// ---------------------------------------------------------------------------
// Shared helper — fetch live quotes for an array of holdings
// ---------------------------------------------------------------------------
// Uses Promise.allSettled so one failing quote never blocks the whole response.
// Logs individual failures; callers receive the settled results array and
// decide how to handle nulls.
// ---------------------------------------------------------------------------
const fetchQuotes = async (holdings) => {
  const results = await Promise.allSettled(
    holdings.map((h) => stockService.getQuote(h.symbol))
  );

  // Log any individual failures for debugging without crashing the request
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(
        `[portfolioController] getQuote failed for ${holdings[i].symbol}:`,
        result.reason?.message ?? result.reason
      );
    }
  });

  return results; // Array<{ status: 'fulfilled'|'rejected', value|reason }>
};


// ---------------------------------------------------------------------------
// Isolated snapshot writer
// ---------------------------------------------------------------------------
// Computes the current portfolio value and upserts a PortfolioSnapshot for
// today.  Isolated as a standalone async function so it can be:
//
//   a) Called from the GET /snapshots endpoint (current approach)
//   b) Triggered after every buy/sell trade
//   c) Moved to a nightly cron job — just import and call takeSnapshot()
//
// The function signature and the PortfolioSnapshot schema are the API
// contract; the call-site changes; this function does not.
// ---------------------------------------------------------------------------
const takeSnapshot = async (userId, cashBalance, holdings, quoteResults) => {
  // Sum current market value, falling back to cost price for failed quotes
  let marketValue = 0;
  holdings.forEach((h, i) => {
    const result = quoteResults[i];
    if (result.status === 'fulfilled') {
      marketValue += h.quantity * result.value.price;
    } else {
      marketValue += h.quantity * h.avgCostPrice; // best-effort fallback
    }
  });

  const totalValue = parseFloat((cashBalance + marketValue).toFixed(2));

  // Normalise to midnight UTC so one upsert per calendar day is guaranteed
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await PortfolioSnapshot.findOneAndUpdate(
    { userId, date: today },
    { totalValue, cashBalance },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};


// ---------------------------------------------------------------------------
// @desc    Get all holdings with live prices
// @route   GET /api/portfolio/holdings
// @access  Protected
// ---------------------------------------------------------------------------
// Enriches each holding with live Finnhub data.
// Individual quote failures fall back to null — the position is still
// returned; the UI should handle null gracefully.
// ---------------------------------------------------------------------------
const getHoldings = async (req, res, next) => {
  try {
    const holdings = await Holding.find({ userId: req.user._id })
      .sort({ symbol: 1 })
      .lean();

    if (holdings.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const quoteResults = await fetchQuotes(holdings);

    const payload = holdings.map((h, i) => {
      const result = quoteResults[i];

      let currentPrice    = null;
      let currentValue    = null;
      let unrealisedPnL   = null;
      let unrealisedPnLPct = null;

      if (result.status === 'fulfilled') {
        currentPrice    = result.value.price;
        currentValue    = parseFloat((h.quantity * currentPrice).toFixed(2));
        const costBasis  = parseFloat((h.quantity * h.avgCostPrice).toFixed(2));
        unrealisedPnL    = parseFloat((currentValue - costBasis).toFixed(2));
        unrealisedPnLPct = costBasis > 0
          ? parseFloat(((unrealisedPnL / costBasis) * 100).toFixed(2))
          : 0;
      }

      return {
        _id:            h._id,
        symbol:         h.symbol,
        name:           h.name,
        quantity:       h.quantity,
        avgCostPrice:   h.avgCostPrice,
        totalInvested:  parseFloat((h.quantity * h.avgCostPrice).toFixed(2)),
        currentPrice,
        currentValue,
        unrealisedPnL,
        unrealisedPnLPct,
      };
    });

    return res.status(200).json({ success: true, count: payload.length, data: payload });
  }
  catch (err) {
    next(err);
  }
};


// ---------------------------------------------------------------------------
// @desc    Get portfolio summary with live market value
// @route   GET /api/portfolio/summary
// @access  Protected
// ---------------------------------------------------------------------------
// currentValue = sum(quantity × livePrice) — live from Finnhub.
// Falls back to totalInvested (purchase cost) for symbols whose quote fails.
// portfolioValue = cashBalance + currentValue.
// ---------------------------------------------------------------------------
const getSummary = async (req, res, next) => {
  try {
    const cashBalance = req.user.balance;
    const holdings    = await Holding.find({ userId: req.user._id }).lean();

    // No holdings — portfolio value is just the cash balance
    if (holdings.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          cashBalance,
          totalInvested:  0,
          currentValue:   0,
          totalReturn:    0,
          totalReturnPct: 0,
          portfolioValue: cashBalance,
        },
      });
    }

    const quoteResults = await fetchQuotes(holdings);

    let totalInvested = 0;
    let currentValue  = 0;

    holdings.forEach((h, i) => {
      const costBasis = h.quantity * h.avgCostPrice;
      totalInvested  += costBasis;

      const result = quoteResults[i];
      if (result.status === 'fulfilled') {
        currentValue += h.quantity * result.value.price;
      } else {
        // Quote failed — use cost price so portfolio value stays internally consistent
        currentValue += costBasis;
      }
    });

    totalInvested  = parseFloat(totalInvested.toFixed(2));
    currentValue   = parseFloat(currentValue.toFixed(2));
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
        portfolioValue: parseFloat((cashBalance + currentValue).toFixed(2)),
      },
    });
  }
  catch (err) {
    next(err);
  }
};


// ---------------------------------------------------------------------------
// @desc    Get available cash balance
// @route   GET /api/portfolio/cash
// @access  Protected
// ---------------------------------------------------------------------------
// Thin read-only endpoint — no price fetch needed.
// ---------------------------------------------------------------------------
const getCash = (req, res) => {
  return res.status(200).json({
    success: true,
    data: { cashBalance: req.user.balance },
  });
};


// ---------------------------------------------------------------------------
// @desc    Get portfolio performance snapshot history
// @route   GET /api/portfolio/snapshots
// @access  Protected
// ---------------------------------------------------------------------------
// Two responsibilities:
//   1. Write today's snapshot (via isolated takeSnapshot helper) — non-fatal
//      if it fails.  Can be moved to a cron/trigger without changing this
//      endpoint's response shape.
//   2. Return the last 90 days of snapshots for the performance chart.
//
// The first visit of the day creates the snapshot; subsequent visits upsert
// the same document with updated prices (idempotent).
// ---------------------------------------------------------------------------
const getSnapshots = async (req, res, next) => {
  try {
    const cashBalance = req.user.balance;
    const holdings    = await Holding.find({ userId: req.user._id }).lean();

    // Only write a snapshot when the user actually holds something
    if (holdings.length > 0) {
      const quoteResults = await fetchQuotes(holdings);

      // Non-fatal: snapshot failure must never break the chart response
      takeSnapshot(req.user._id, cashBalance, holdings, quoteResults).catch((snapErr) => {
        console.error('[portfolioController] snapshot write failed:', snapErr.message);
      });
    } else {
      // No holdings — record cash-only snapshot so the chart starts immediately
      takeSnapshot(req.user._id, cashBalance, [], []).catch((snapErr) => {
        console.error('[portfolioController] snapshot write failed:', snapErr.message);
      });
    }

    // Return historical snapshots (last 90 days), sorted oldest-first for the chart
    const since = new Date();
    since.setDate(since.getDate() - 90);
    since.setUTCHours(0, 0, 0, 0);

    const snapshots = await PortfolioSnapshot.find({
      userId: req.user._id,
      date:   { $gte: since },
    })
      .sort({ date: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: snapshots.length,
      data: snapshots.map((s) => ({
        date:         s.date,
        totalValue:   s.totalValue,
        cashBalance:  s.cashBalance,
      })),
    });
  }
  catch (err) {
    next(err);
  }
};


module.exports = { getHoldings, getSummary, getCash, getSnapshots };
