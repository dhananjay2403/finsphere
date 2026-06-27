const User    = require('../models/User');
const Holding = require('../models/Holding');
const Trade   = require('../models/Trade');


// ---------------------------------------------------------------------------
// @desc    Buy shares of a stock
// @route   POST /api/trades/buy
// @access  Protected
// ---------------------------------------------------------------------------
// Body: { symbol, name, quantity, pricePerShare }
//
// Steps (ordered — see architecture notes):
//   1. Validate sufficient cash balance
//   2. Debit user.balance
//   3. Upsert Holding — create new OR update avg cost price (weighted average)
//   4. Create immutable Trade record
// ---------------------------------------------------------------------------
const buyStock = async (req, res, next) => {

  try {
    const { symbol, name, quantity, pricePerShare } = req.body;

    const qty   = Number(quantity);
    const price = Number(pricePerShare);
    const totalAmount = parseFloat((qty * price).toFixed(2));

    // ── 1. Check sufficient balance ────────────────────────────────────────
    if (req.user.balance < totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Required: $${totalAmount.toFixed(2)}, Available: $${req.user.balance.toFixed(2)}`,
      });
    }

    // ── 2. Debit balance ───────────────────────────────────────────────────
    // $inc is atomic — cannot go below 0 because User schema has min: 0
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { balance: -totalAmount } },
      { new: true, runValidators: true }
    );

    // Guard: if the balance went negative (concurrent request edge case)
    if (!updatedUser || updatedUser.balance < 0) {
      // Roll back the debit
      await User.findByIdAndUpdate(req.user._id, { $inc: { balance: totalAmount } });
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds — balance update rejected.',
      });
    }

    // ── 3. Upsert Holding (weighted average cost price) ────────────────────
    const existing = await Holding.findOne({ userId: req.user._id, symbol: symbol.toUpperCase() });

    if (existing) {
      // Weighted average: newAvg = ((currentQty * currentAvg) + (buyQty * buyPrice)) / (currentQty + buyQty)
      const newQty = existing.quantity + qty;
      const newAvg = parseFloat(
        ((existing.quantity * existing.avgCostPrice + qty * price) / newQty).toFixed(6)
      );

      await Holding.findByIdAndUpdate(existing._id, {
        quantity:     newQty,
        avgCostPrice: newAvg,
      });
    } else {
      // First buy — create a new holding document
      await Holding.create({
        userId:       req.user._id,
        symbol:       symbol.toUpperCase(),
        name,
        quantity:     qty,
        avgCostPrice: price,
      });
    }

    // ── 4. Create immutable Trade record ───────────────────────────────────
    const trade = await Trade.create({
      userId:       req.user._id,
      symbol:       symbol.toUpperCase(),
      name,
      type:         'buy',
      quantity:     qty,
      pricePerShare: price,
      totalAmount,
    });

    return res.status(201).json({
      success: true,
      message: `Successfully bought ${qty} share${qty > 1 ? 's' : ''} of ${symbol.toUpperCase()}`,
      data: {
        trade: {
          _id:          trade._id,
          symbol:       trade.symbol,
          name:         trade.name,
          type:         trade.type,
          quantity:     trade.quantity,
          pricePerShare: trade.pricePerShare,
          totalAmount:  trade.totalAmount,
          executedAt:   trade.createdAt,
        },
        cashBalance: updatedUser.balance,
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
// Steps:
//   1. Find existing holding — 404 if not owned
//   2. Check holding.quantity >= requested quantity
//   3. Credit user.balance
//   4. Update or delete Holding (delete when fully exited)
//   5. Create immutable Trade record
// ---------------------------------------------------------------------------
const sellStock = async (req, res, next) => {

  try {
    const { symbol, quantity, pricePerShare } = req.body;

    const qty   = Number(quantity);
    const price = Number(pricePerShare);
    const totalAmount = parseFloat((qty * price).toFixed(2));

    // ── 1. Find existing holding ───────────────────────────────────────────
    const holding = await Holding.findOne({ userId: req.user._id, symbol: symbol.toUpperCase() });

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: `You do not own any shares of ${symbol.toUpperCase()}`,
      });
    }

    // ── 2. Check sufficient quantity ───────────────────────────────────────
    if (holding.quantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient shares. You own ${holding.quantity}, tried to sell ${qty}`,
      });
    }

    // ── 3. Credit balance ──────────────────────────────────────────────────
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { balance: totalAmount } },
      { new: true, runValidators: true }
    );

    // ── 4. Update or delete Holding ────────────────────────────────────────
    const remainingQty = holding.quantity - qty;

    if (remainingQty === 0) {
      // Position fully closed — remove the holding document
      await Holding.findByIdAndDelete(holding._id);
    } else {
      // Partial sell — decrement quantity only (avgCostPrice unchanged on sells)
      await Holding.findByIdAndUpdate(holding._id, { quantity: remainingQty });
    }

    // ── 5. Create immutable Trade record ───────────────────────────────────
    const trade = await Trade.create({
      userId:       req.user._id,
      symbol:       symbol.toUpperCase(),
      name:         holding.name,
      type:         'sell',
      quantity:     qty,
      pricePerShare: price,
      totalAmount,
    });

    return res.status(201).json({
      success: true,
      message: `Successfully sold ${qty} share${qty > 1 ? 's' : ''} of ${symbol.toUpperCase()}`,
      data: {
        trade: {
          _id:          trade._id,
          symbol:       trade.symbol,
          name:         trade.name,
          type:         trade.type,
          quantity:     trade.quantity,
          pricePerShare: trade.pricePerShare,
          totalAmount:  trade.totalAmount,
          executedAt:   trade.createdAt,
        },
        cashBalance: updatedUser.balance,
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
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 20);
    const skip   = (page - 1) * limit;

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
      _id:          t._id,
      symbol:       t.symbol,
      name:         t.name,
      type:         t.type,
      quantity:     t.quantity,
      pricePerShare: t.pricePerShare,
      totalAmount:  t.totalAmount,
      executedAt:   t.createdAt,
    }));

    return res.status(200).json({
      success: true,
      count:      payload.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data:       payload,
    });
  }

  catch (err) {
    next(err);
  }
};


module.exports = { buyStock, sellStock, getTradeHistory };
