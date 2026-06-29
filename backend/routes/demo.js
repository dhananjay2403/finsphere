const express = require('express');
const { resetDemo } = require('../controllers/demoController');

const router = express.Router();

// POST /api/demo/reset
// Resets the shared demo account to its initial state.
// Intentionally public — it only touches demo@finsphere.com.
router.post('/reset', resetDemo);

module.exports = router;
