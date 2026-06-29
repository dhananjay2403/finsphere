const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Initialise app
const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());                          // Allow cross-origin requests
app.use(express.json({ limit: '10kb' })); // Parse JSON bodies — cap at 10 KB to prevent abuse

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));                 // Log HTTP requests (dev only — noisy in production)
}

// Health-check route
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'FinSphere API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Routes
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

// Start server
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running on 0.0.0.0:${PORT} [${process.env.NODE_ENV}]`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully`);
  server.close(() => {
    mongoose.connection.close(false).then(() => {
      console.log('✓ MongoDB connection closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
