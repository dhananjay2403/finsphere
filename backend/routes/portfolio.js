const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getHoldings, getSummary, getCash } = require('../controllers/portfolioController');

const router = express.Router();

// All portfolio routes require authentication
// protect middleware: validates JWT → attaches req.user

// GET /api/portfolio/holdings — full holdings list with P&L fields
router.get('/holdings', protect, getHoldings);

// GET /api/portfolio/summary  — cash, total invested, current value, total return
router.get('/summary', protect, getSummary);

// GET /api/portfolio/cash     — available cash balance only
router.get('/cash', protect, getCash);

module.exports = router;
