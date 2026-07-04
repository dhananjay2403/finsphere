const express = require('express');
const { body, param } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} = require('../controllers/watchlistController');

const router = express.Router();


const addRules = [
  body('symbol')
    .trim()
    .notEmpty().withMessage('Symbol is required')
    .isLength({ max: 10 }).withMessage('Symbol too long'),

  body('name')
    .trim()
    .notEmpty().withMessage('Stock name is required')
    .isLength({ max: 100 }).withMessage('Stock name too long'),
];

const removeRules = [
  param('symbol')
    .trim()
    .notEmpty().withMessage('Symbol param is required')
    .isLength({ max: 10 }).withMessage('Symbol too long'),
];


// GET    /api/watchlist          — fetch all watchlist symbols
router.get('/', protect, getWatchlist);

// POST   /api/watchlist          — add a symbol
router.post('/', protect, addRules, validate, addToWatchlist);

// DELETE /api/watchlist/:symbol  — remove a symbol
router.delete('/:symbol', protect, removeRules, validate, removeFromWatchlist);


module.exports = router;
