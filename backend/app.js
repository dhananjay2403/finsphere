const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Just the Express app, no DB connection or listen() — kept separate from
// server.js so app construction isn't tangled up with process bootstrap.
const app = express();

// Comma-separated allowlist, e.g. the Vercel frontend URL. Falls back to '*'
// so nothing breaks if CORS_ORIGIN hasn't been set yet.
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: corsOrigin ? corsOrigin.split(',').map((origin) => origin.trim()) : '*',
}));
app.use(express.json({ limit: '10kb' })); // Parse JSON bodies — cap at 10 KB to prevent abuse

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));                 // Log HTTP requests (dev only — noisy in production)
}

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'FinSphere API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/demo',      require('./routes/demo'));
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/trades',    require('./routes/trades'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/stocks',    require('./routes/stocks'));


// 404 handler — must come after all route definitions
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler — must be last middleware
app.use(errorHandler);

module.exports = app;
