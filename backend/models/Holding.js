const mongoose = require('mongoose');

// A user's current position in one stock — one doc per user+symbol, deleted
// when quantity hits 0. avgCostPrice is a weighted average, recomputed on every buy:
//   newAvg = (currentQty*currentAvg + buyQty*buyPrice) / (currentQty+buyQty)
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
