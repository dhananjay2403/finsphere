const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { buyStock, sellStock, getTradeHistory } = require('../controllers/tradeController');

const router = express.Router();


const symbolRule = body('symbol')
  .trim()
  .notEmpty().withMessage('Symbol is required')
  .isLength({ max: 10 }).withMessage('Symbol too long');

// required on buy only — sell reads the name from the existing Holding
const nameRule = body('name')
  .trim()
  .notEmpty().withMessage('Stock name is required')
  .isLength({ max: 100 }).withMessage('Stock name too long');

const quantityRule = body('quantity')
  .notEmpty().withMessage('Quantity is required')
  .isInt({ min: 1 }).withMessage('Quantity must be a whole number of at least 1');

// still required for the request shape, but the controller fetches its own
// live price rather than trusting this value
const priceRule = body('pricePerShare')
  .notEmpty().withMessage('Price per share is required')
  .isFloat({ gt: 0 }).withMessage('Price per share must be greater than 0');

// POST /api/trades/buy
router.post(
  '/buy',
  protect,
  [symbolRule, nameRule, quantityRule, priceRule],
  validate,
  buyStock
);

// POST /api/trades/sell
router.post(
  '/sell',
  protect,
  [symbolRule, quantityRule, priceRule],
  validate,
  sellStock
);

// GET /api/trades/history
router.get('/history', protect, getTradeHistory);


module.exports = router;
