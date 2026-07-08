const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getHoldings, getSummary, getCash, getSnapshots } = require('../controllers/portfolioController');

const router = express.Router();

// GET /api/portfolio/holdings  — full holdings list with live P&L fields
router.get('/holdings',  protect, getHoldings);

// GET /api/portfolio/summary   — cash, total invested, live current value, total return
router.get('/summary',   protect, getSummary);

// GET /api/portfolio/cash      — available cash balance only
router.get('/cash',      protect, getCash);

// GET /api/portfolio/snapshots — value history for the chart; also upserts today's snapshot as a side effect
router.get('/snapshots', protect, getSnapshots);

module.exports = router;
