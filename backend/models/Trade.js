const mongoose = require('mongoose');

// Write-once record of a buy or sell. totalAmount is pre-computed for display; createdAt doubles as the trade timestamp.
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
    timestamps: true,
  }
);

// Covers the trade-history query: find by userId (optionally + symbol) sorted by createdAt desc.
tradeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Trade', tradeSchema);
