const mongoose = require('mongoose');
const User = require('../models/User');
const Holding = require('../models/Holding');
const Trade = require('../models/Trade');
const stockService = require('../services/stockService');


// POST /api/trades/buy
//
// pricePerShare in the body is still validated for API-contract reasons but
// never used for the actual math — we fetch the live price ourselves and
// treat it as the only source of truth. If a real price isn't available the
// trade aborts before touching the database. Balance debit, holding upsert,
// and the trade record all happen in one transaction, so they succeed or
// roll back together.
const buyStock = async (req, res, next) => {

  try {
    const { symbol, name, quantity } = req.body;
    const symbolUpper = symbol.trim().toUpperCase();
    const qty = Number(quantity);

    // skipCache: trade execution must always price off a live Finnhub call,
    // never a cached quote — see Milestone 16.
    const quote = await stockService.getQuote(symbolUpper, { skipCache: true });

    if (!Number.isFinite(quote?.price) || quote.price <= 0) {
      const err = new Error(`Market data temporarily unavailable for ${symbolUpper} — please try again shortly.`);
      err.statusCode = 503;
      throw err;
    }

    const price = quote.price;
    const totalAmount = parseFloat((qty * price).toFixed(2));

    // Quick check to skip opening a transaction in the common case — the
    // real guard against a negative balance is the atomic update below.
    if (req.user.balance < totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Required: $${totalAmount.toFixed(2)}, Available: $${req.user.balance.toFixed(2)}`,
      });
    }

    const session = await mongoose.startSession();
    let output;

    try {
      output = await session.withTransaction(async () => {

        // The $gte guard here — not the pre-check above — is what actually
        // stops two concurrent buys from driving the balance negative.
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

        // One atomic upsert instead of read-then-write, otherwise two
        // concurrent first-time buys of the same symbol could both try to
        // create the holding and collide on the unique index.
        //   newAvg = (currentQty*currentAvg + buyQty*buyPrice) / (currentQty+buyQty)
        await Holding.findOneAndUpdate(
          { userId: req.user._id, symbol: symbolUpper },
          [{
            $set: {
              // pipeline upserts don't auto-fill the filter fields, so set them here
              userId: req.user._id,
              symbol: symbolUpper,
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


// POST /api/trades/sell
//
// Same rule as buy, but trusting a client-supplied price here is worse — an
// inflated sell price would let someone fabricate cash. We fetch the real
// price ourselves; if we can't get one, the trade aborts before any write.
const sellStock = async (req, res, next) => {

  try {
    const { symbol, quantity } = req.body;
    const symbolUpper = symbol.trim().toUpperCase();
    const qty = Number(quantity);

    // skipCache: trade execution must always price off a live Finnhub call,
    // never a cached quote — see Milestone 16.
    const quote = await stockService.getQuote(symbolUpper, { skipCache: true });

    if (!Number.isFinite(quote?.price) || quote.price <= 0) {
      const err = new Error(`Market data temporarily unavailable for ${symbolUpper} — please try again shortly.`);
      err.statusCode = 503;
      throw err;
    }

    const price = quote.price;
    const totalAmount = parseFloat((qty * price).toFixed(2));

    const session = await mongoose.startSession();
    let output;

    try {
      output = await session.withTransaction(async () => {

        // This $gte-guarded decrement is the actual race fix — two
        // concurrent sells of the same holding can no longer both read the
        // same quantity, both pass the check, and both credit the balance.
        // Mongo serializes the update, so only a request with enough shares
        // left actually succeeds.
        const updatedHolding = await Holding.findOneAndUpdate(
          { userId: req.user._id, symbol: symbolUpper, quantity: { $gte: qty } },
          { $inc: { quantity: -qty } },
          { new: true, session, runValidators: true }
        );

        if (!updatedHolding) {
          // Only hit the DB again to tell "doesn't exist" apart from "not
          // enough" — no extra cost on the success path above.
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
          // fully sold — nothing left to hold
          await Holding.findByIdAndDelete(updatedHolding._id, { session });
        }

        // no $gte guard needed here — crediting can't push balance negative
        const updatedUser = await User.findByIdAndUpdate(
          req.user._id,
          { $inc: { balance: totalAmount } },
          { new: true, session, runValidators: true }
        );

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


// GET /api/trades/history?page=&limit=(max 100)&symbol=
const getTradeHistory = async (req, res, next) => {

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

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

    // executedAt reads better than createdAt on a trade record
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
