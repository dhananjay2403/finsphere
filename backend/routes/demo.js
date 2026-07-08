const express = require('express');
const { resetDemo, demoLogin } = require('../controllers/demoController');

const router = express.Router();

// POST /api/demo/login — one-shot demo entry: ensures the account exists, resets it, returns a JWT. Public (demo only).
router.post('/login', demoLogin);

// POST /api/demo/reset — resets the shared demo account to its initial state. Public — only touches demo@finsphere.com.
router.post('/reset', resetDemo);

module.exports = router;
