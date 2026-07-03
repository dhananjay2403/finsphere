const mongoose = require('mongoose');
const User = require('../models/User');
const Holding = require('../models/Holding');
const Trade = require('../models/Trade');
const stockService = require('../services/stockService');


// ---------------------------------------------------------------------------
// @desc    Buy shares of a stock
// @route   POST /api/trades/buy
// @access  Protected
// ---------------------------------------------------------------------------
// Body: { symbol, name, quantity, pricePerShare }
//
// pricePerShare is still required by route validation for API-contract
// compatibility, but is intentionally NOT used for money math — the server
// independently fetches the live market price and treats it as the single
// source of truth. If a valid live price cannot be obtained, the trade is
// aborted before any database write (no stale/cached/client/fallback price
// is ever used to execute a trade).
//
// Steps:
//   1. Fetch live price from stockService — abort if unavailable/invalid
//   2. Fast, non-authoritative balance pre-check
//   3. Atomic transaction: conditional balance debit, atomic holding upsert
//      (weighted average cost), immutable Trade record — all succeed or
//      all roll back together
// ---------------------------------------------------------------------------
const buyStock = async (req, res, next) => {

  try {
    const { symbol, name, quantity } = req.body;
    const symbolUpper = symbol.trim().toUpperCase();
    const qty = Number(quantity);

    // 1. Server-authoritative price
    const quote = await stockService.getQuote(symbolUpper);

    if (!Number.isFinite(quote?.price) || quote.price <= 0) {
      const err = new Error(`Market data temporarily unavailable for ${symbolUpper} — please try again shortly.`);
      err.statusCode = 503;
      throw err;
    }

    const price = quote.price;
    const totalAmount = parseFloat((qty * price).toFixed(2));

    // 2. Fast, non-authoritative pre-check
    // Avoids opening a transaction in the common insufficient-funds case.
    // The atomic conditional update inside the transaction is the real guard.
    if (req.user.balance < totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Required: $${totalAmount.toFixed(2)}, Available: $${req.user.balance.toFixed(2)}`,
      });
    }

    // 3. Atomic transaction
    const session = await mongoose.startSession();
    let output;

    try {
      output = await session.withTransaction(async () => {

        // Atomic conditional debit — the balance:{$gte:totalAmount} guard,
        // not the pre-check above, is what actually prevents a negative
        // balance under a concurrent-request race.
        const updatedUser = await User.findOneAndUpdate(
          { _id: req.user._id, balance: { $gte: totalAmount } },
          { $inc: { balance: -totalAmount } },
          { new: true, session, runValidators: true }
        );

        if (!updatedUser) {
          const err = new Error('Insufficient funds — balance changed, please try again.');
          err.statusCode = 400;
          throw err;
        }

        // Atomic upsert with weighted-average cost recompute in a single
        // conditional operation. This avoids a read-then-write race on
        // first-time buys of a brand-new symbol — two concurrent first
        // buys could otherwise both attempt Holding.create and collide on
        // the unique {userId, symbol} index.
        //   newAvg = ((currentQty * currentAvg) + (buyQty * buyPrice)) / (currentQty + buyQty)
        await Holding.findOneAndUpdate(
          { userId: req.user._id, symbol: symbolUpper },
          [{
            $set: {
              userId: req.user._id, // pipeline-style upserts don't
              symbol: symbolUpper,  // auto-populate query-filter fields
              name,
              quantity: { $add: [{ $ifNull: ['$quantity', 0] }, qty] },
              avgCostPrice: {
                $round: [{
                  $cond: {
                    if: { $eq: [{ $ifNull: ['$quantity', 0] }, 0] },
                    then: price,
                    else: {
                      $divide: [
                        { $add: [{ $multiply: ['$quantity', '$avgCostPrice'] }, qty * price] },
                        { $add: ['$quantity', qty] },
                      ],
                    },
                  },
                }, 6],
              },
            },
          }],
          { upsert: true, new: true, session, runValidators: true, updatePipeline: true }
        );

        // 4. Create immutable Trade record
        const [trade] = await Trade.create([{
          userId: req.user._id,
          symbol: symbolUpper,
          name,
          type: 'buy',
          quantity: qty,
          pricePerShare: price,
          totalAmount,
        }], { session });

        return { trade, cashBalance: updatedUser.balance };
      });
    } finally {
      await session.endSession();
    }

    return res.status(201).json({
      success: true,
      message: `Successfully bought ${qty} share${qty > 1 ? 's' : ''} of ${symbolUpper}`,
      data: {
        trade: {
          _id: output.trade._id,
          symbol: output.trade.symbol,
          name: output.trade.name,
          type: output.trade.type,
          quantity: output.trade.quantity,
          pricePerShare: output.trade.pricePerShare,
          totalAmount: output.trade.totalAmount,
          executedAt: output.trade.createdAt,
        },
        cashBalance: output.cashBalance,
      },
    });
  }

  catch (err) {
    next(err);
  }
};


// ---------------------------------------------------------------------------
// @desc    Sell shares of a stock
// @route   POST /api/trades/sell
// @access  Protected
// ---------------------------------------------------------------------------
// Body: { symbol, quantity, pricePerShare }
//
// pricePerShare is still required by route validation for API-contract
// compatibility, but is intentionally NOT used for money math — trusting a
// client-supplied SELL price is the more dangerous direction (it would let
// a user fabricate cash from nothing). The server independently fetches the
// live market price and treats it as the single source of truth. If a valid
// live price cannot be obtained, the trade is aborted before any database
// write.
//
// Steps:
//   1. Fetch live price from stockService — abort if unavailable/invalid
//   2. Atomic transaction: conditional holding decrement (the core race
//      fix — quantity:{$gte:qty} ensures concurrent sells of the same
//      holding can't both pass the check and both credit the balance),
//      balance credit, immutable Trade record — all succeed or all roll
//      back together
// ---------------------------------------------------------------------------
const sellStock = async (req, res, next) => {

  try {
    const { symbol, quantity } = req.body;
    const symbolUpper = symbol.trim().toUpperCase();
    const qty = Number(quantity);

    // 1. Server-authoritative price
    const quote = await stockService.getQuote(symbolUpper);

    if (!Number.isFinite(quote?.price) || quote.price <= 0) {
      const err = new Error(`Market data temporarily unavailable for ${symbolUpper} — please try again shortly.`);
      err.statusCode = 503;
      throw err;
    }

    const price = quote.price;
    const totalAmount = parseFloat((qty * price).toFixed(2));

    // 2. Atomic transaction
    const session = await mongoose.startSession();
    let output;

    try {
      output = await session.withTransaction(async () => {

        // Atomic conditional decrement — this single operation IS the race
        // fix. Two concurrent sell requests against the same holding can no
        // longer both read "quantity: 10", both pass a check, and both
        // credit the balance: MongoDB serializes the $gte-guarded update,
        // so only the requests that actually have enough remaining shares
        // succeed.
        const updatedHolding = await Holding.findOneAndUpdate(
          { userId: req.user._id, symbol: symbolUpper, quantity: { $gte: qty } },
          { $inc: { quantity: -qty } },
          { new: true, session, runValidators: true }
        );

        if (!updatedHolding) {
          // Disambiguate "doesn't exist" vs "insufficient quantity" —
          // error path only, no extra cost on the success path.
          const existing = await Holding.findOne({ userId: req.user._id, symbol: symbolUpper }).session(session);

          const err = new Error(
            !existing
              ? `You do not own any shares of ${symbolUpper}`
              : `Insufficient shares. You own ${existing.quantity}, tried to sell ${qty}`
          );
          err.statusCode = !existing ? 404 : 400;
          throw err;
        }

        if (updatedHolding.quantity === 0) {
          // Position fully closed — remove the holding document
          await Holding.findByIdAndDelete(updatedHolding._id, { session });
        }

        // Credit balance — no $gte guard needed, a credit can't drive
        // balance negative.
        const updatedUser = await User.findByIdAndUpdate(
          req.user._id,
          { $inc: { balance: totalAmount } },
          { new: true, session, runValidators: true }
        );

        // Create immutable Trade record
        const [trade] = await Trade.create([{
          userId: req.user._id,
          symbol: symbolUpper,
          name: updatedHolding.name,
          type: 'sell',
          quantity: qty,
          pricePerShare: price,
          totalAmount,
        }], { session });

        return { trade, cashBalance: updatedUser.balance };
      });
    } finally {
      await session.endSession();
    }

    return res.status(201).json({
      success: true,
      message: `Successfully sold ${qty} share${qty > 1 ? 's' : ''} of ${symbolUpper}`,
      data: {
        trade: {
          _id: output.trade._id,
          symbol: output.trade.symbol,
          name: output.trade.name,
          type: output.trade.type,
          quantity: output.trade.quantity,
          pricePerShare: output.trade.pricePerShare,
          totalAmount: output.trade.totalAmount,
          executedAt: output.trade.createdAt,
        },
        cashBalance: output.cashBalance,
      },
    });
  }

  catch (err) {
    next(err);
  }
};


// ---------------------------------------------------------------------------
// @desc    Get trade history for the authenticated user
// @route   GET /api/trades/history
// @access  Protected
// ---------------------------------------------------------------------------
// Query params:
//   limit  — number of records to return (default: 20, max: 100)
//   page   — page number for pagination (default: 1)
//   symbol — optional symbol filter (e.g. ?symbol=AAPL)
// ---------------------------------------------------------------------------
const getTradeHistory = async (req, res, next) => {

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    // Build filter — optionally narrow to a specific symbol
    const filter = { userId: req.user._id };
    if (req.query.symbol) {
      filter.symbol = req.query.symbol.toUpperCase();
    }

    const [trades, total] = await Promise.all([
      Trade.find(filter)
        .sort({ createdAt: -1 }) // Most recent first
        .skip(skip)
        .limit(limit)
        .lean(),
      Trade.countDocuments(filter),
    ]);

    // Normalise field name: expose createdAt as executedAt for clarity
    const payload = trades.map((t) => ({
      _id: t._id,
      symbol: t.symbol,
      name: t.name,
      type: t.type,
      quantity: t.quantity,
      pricePerShare: t.pricePerShare,
      totalAmount: t.totalAmount,
      executedAt: t.createdAt,
    }));

    return res.status(200).json({
      success: true,
      count: payload.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: payload,
    });
  }

  catch (err) {
    next(err);
  }
};


module.exports = { buyStock, sellStock, getTradeHistory };
