const mongoose = require('mongoose');

// One watchlist doc per user. Symbols are embedded rather than their own
// collection since they're always read and written together with the user.
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
