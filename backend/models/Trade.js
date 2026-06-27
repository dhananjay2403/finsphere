const mongoose = require('mongoose');

/**
 * Immutable record of every buy or sell action.
 * Documents in this collection are NEVER modified after creation.
 *
 * pricePerShare — the actual market price at the time of execution.
 * totalAmount   — pricePerShare × quantity (pre-computed for display and reporting).
 *
 * No timestamps.updatedAt needed — trades are write-once.
 * Using { timestamps: true } still gives us createdAt, which is the trade timestamp.
 */
const tradeSchema = new mongoose.Schema(
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

    type: {
      type: String,
      required: true,
      enum: ['buy', 'sell'],
    },

    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },

    pricePerShare: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },

    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
  },
  {
    timestamps: true, // createdAt = trade execution time
  }
);

module.exports = mongoose.model('Trade', tradeSchema);
