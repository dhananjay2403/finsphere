const mongoose = require('mongoose');

/**
 * One document per user-symbol pair.
 * Represents the user's CURRENT position in a stock.
 *
 * avgCostPrice is updated on every buy using a weighted average:
 *   newAvg = ((currentQty * currentAvg) + (buyQty * buyPrice)) / (currentQty + buyQty)
 *
 * This document is deleted when quantity reaches 0 (full sell).
 *
 * Compound unique index: { userId, symbol } — prevents duplicate holdings
 * for the same user and stock.
 */
const holdingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
    },

    avgCostPrice: {
      type: Number,
      required: true,
      min: [0, 'Average cost price cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user cannot have two holdings for the same stock
holdingSchema.index({ userId: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('Holding', holdingSchema);
