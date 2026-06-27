const mongoose = require('mongoose');

/**
 * Each user has exactly ONE watchlist document.
 * Symbols are stored as an embedded array — they always travel together
 * and are never queried independently, making embedding the right choice
 * over a separate collection.
 *
 * Unique index on userId: enforces the 1-to-1 relationship at DB level.
 */
const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one watchlist per user
    },

    symbols: [
      {
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
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Watchlist', watchlistSchema);
