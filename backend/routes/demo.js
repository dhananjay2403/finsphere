const express = require('express');
const { resetDemo, demoLogin } = require('../controllers/demoController');

const router = express.Router();

// POST /api/demo/login
// One-shot demo entry: ensures the demo account exists, resets it, and returns
// a JWT — all in a single request. Intentionally public (demo account only).
router.post('/login', demoLogin);

// POST /api/demo/reset
// Resets the shared demo account to its initial state.
// Intentionally public — it only touches demo@finsphere.com.
router.post('/reset', resetDemo);

module.exports = router;
