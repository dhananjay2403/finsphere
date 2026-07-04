const express = require('express');
const { param, query } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { quote, profile, search, news, history, marketNews } = require('../controllers/stocksController');

const router = express.Router();


const symbolParam = [
  param('symbol')
    .trim()
    .notEmpty().withMessage('Symbol is required')
    .isLength({ max: 10 }).withMessage('Symbol too long')
    .toUpperCase(),
];

const searchQuery = [
  query('q')
    .trim()
    .notEmpty().withMessage('Query parameter "q" is required')
    .isLength({ min: 1, max: 50 }).withMessage('Query must be between 1 and 50 characters'),
];


// GET /api/stocks/quote/:symbol
router.get('/quote/:symbol', protect, symbolParam, validate, quote);

// GET /api/stocks/profile/:symbol
router.get('/profile/:symbol', protect, symbolParam, validate, profile);

// GET /api/stocks/search?q=
router.get('/search', protect, searchQuery, validate, search);

// GET /api/stocks/news/:symbol
router.get('/news/:symbol', protect, symbolParam, validate, news);

// GET /api/stocks/history/:symbol?resolution=D&from=&to=
router.get('/history/:symbol', protect, symbolParam, validate, history);

// GET /api/stocks/market-news?category=general
router.get('/market-news', protect, marketNews);


module.exports = router;
