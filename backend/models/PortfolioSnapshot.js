const mongoose = require('mongoose');

/**
 * One document per user per day.
 * Used to render the portfolio performance chart on the Dashboard.
 *
 * totalValue  = cashBalance + sum(holding.quantity × currentPrice)
 * cashBalance = user.balance at snapshot time
 *
 * These are generated either:
 *   a) By a daily cron job (jobs/snapshotJob.js) — preferred for production
 *   b) On-demand when the user visits the dashboard (simpler, good enough for now)
 *
 * Compound unique index: { userId, date } — prevents duplicate snapshots
 * for the same user on the same day (upsert-safe).
 */
const portfolioSnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    totalValue: {
      type: Number,
      required: true,
      min: 0,
    },

    cashBalance: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: false, // date field serves as the timestamp
  }
);

// Prevents two snapshots for the same user on the same day
portfolioSnapshotSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('PortfolioSnapshot', portfolioSnapshotSchema);
