const mongoose = require('mongoose');

const app = require('./app');
const connectDB = require('./config/db');
const redis = require('./config/redis');

connectDB();

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running on 0.0.0.0:${PORT} [${process.env.NODE_ENV}]`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully`);
  server.close(() => {
    Promise.all([
      mongoose.connection.close(false),
      redis.disconnect(),
    ]).then(() => {
      console.log('✓ MongoDB connection closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
