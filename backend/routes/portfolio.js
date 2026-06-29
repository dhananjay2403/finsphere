const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getHoldings, getSummary, getCash, getSnapshots } = require('../controllers/portfolioController');

const router = express.Router();

// All portfolio routes require authentication
// protect middleware: validates JWT → attaches req.user

// GET /api/portfolio/holdings  — full holdings list with live P&L fields
router.get('/holdings',  protect, getHoldings);

// GET /api/portfolio/summary   — cash, total invested, live current value, total return
router.get('/summary',   protect, getSummary);

// GET /api/portfolio/cash      — available cash balance only
router.get('/cash',      protect, getCash);

// GET /api/portfolio/snapshots — portfolio value history for the performance chart
// Also upserts today's snapshot (non-fatal, isolated, can be moved to cron later)
router.get('/snapshots', protect, getSnapshots);

module.exports = router;
