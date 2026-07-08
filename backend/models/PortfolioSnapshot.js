const mongoose = require('mongoose');

// Daily portfolio value snapshot for the dashboard performance chart; written on-demand on dashboard visits, not via cron.
// totalValue = cashBalance + sum(quantity × price at snapshot time)
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
