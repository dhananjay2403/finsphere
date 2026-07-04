const Holding          = require('../models/Holding');
const PortfolioSnapshot = require('../models/PortfolioSnapshot');
const stockService     = require('../services/stockService');


// Fetches a live quote per holding. Promise.allSettled so one bad quote
// doesn't block the rest — callers get the settled results and decide how
// to handle the failures.
const fetchQuotes = async (holdings) => {
  const results = await Promise.allSettled(
    holdings.map((h) => stockService.getQuote(h.symbol))
  );

  // log failures without crashing the request
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


// Computes today's portfolio value and upserts a snapshot for it. Kept as
// its own function so it's easy to call from a cron job or after every
// trade later, not just from GET /snapshots as it is today.
const takeSnapshot = async (userId, cashBalance, holdings, quoteResults, quotesSucceeded) => {
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

  // Only overwrite today's snapshot if at least one quote actually
  // succeeded. If Finnhub is down or rate-limited and every quote fails,
  // every holding falls back to cost price and totalValue collapses to
  // roughly the starting balance — $setOnInsert means that degraded value
  // can only create today's snapshot if none exists yet, never overwrite
  // one already written with real prices.
  if (quotesSucceeded) {
    await PortfolioSnapshot.findOneAndUpdate(
      { userId, date: today },
      { $set: { totalValue, cashBalance } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } else {
    await PortfolioSnapshot.findOneAndUpdate(
      { userId, date: today },
      { $setOnInsert: { totalValue, cashBalance } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};


// GET /api/portfolio/holdings — if a quote fails, price/value fields come
// back null rather than dropping the position; the UI handles that case.
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


// GET /api/portfolio/summary — currentValue sums quantity × live price,
// falling back to cost basis per-symbol if a quote fails. portfolioValue
// is just cash + currentValue.
const getSummary = async (req, res, next) => {
  try {
    const cashBalance = req.user.balance;
    const holdings    = await Holding.find({ userId: req.user._id }).lean();

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
        currentValue += costBasis; // quote failed — fall back to cost so the total stays consistent
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


// GET /api/portfolio/cash
const getCash = (req, res) => {
  return res.status(200).json({
    success: true,
    data: { cashBalance: req.user.balance },
  });
};


// GET /api/portfolio/snapshots — writes today's snapshot (best-effort) and
// returns the last 90 days for the performance chart. Idempotent: the first
// visit each day creates the snapshot, later visits just update it.
const getSnapshots = async (req, res, next) => {
  try {
    const cashBalance = req.user.balance;
    const holdings    = await Holding.find({ userId: req.user._id }).lean();

    if (holdings.length > 0) {
      const quoteResults = await fetchQuotes(holdings);
      // passed to takeSnapshot so it knows whether it's safe to overwrite today's value
      const quotesSucceeded = quoteResults.some((r) => r.status === 'fulfilled');

      // non-fatal — a snapshot write failure must never break the chart response
      takeSnapshot(req.user._id, cashBalance, holdings, quoteResults, quotesSucceeded).catch((snapErr) => {
        console.error('[portfolioController] snapshot write failed:', snapErr.message);
      });
    } else {
      // no holdings, so no quotes to fetch — trivially "succeeded"
      takeSnapshot(req.user._id, cashBalance, [], [], true).catch((snapErr) => {
        console.error('[portfolioController] snapshot write failed:', snapErr.message);
      });
    }

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
