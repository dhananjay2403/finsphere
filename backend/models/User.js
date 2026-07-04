const mongoose = require('mongoose');
const { INITIAL_BALANCE } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      maxlength: [128, 'Password cannot exceed 128 characters'],
      select: false, // Never returned in queries by default
    },

    balance: {
      type: Number,
      default: INITIAL_BALANCE,
      min: [0, 'Balance cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);

