const mongoose = require('mongoose');

const app = require('./app');
const connectDB = require('./config/db');
const redis = require('./config/redis');

// Fail fast on a missing critical secret rather than throwing a 500 on the first request.
if (!process.env.JWT_SECRET) {
  console.error('✗ JWT_SECRET is not set — refusing to start');
  process.exit(1);
}

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
    ])
      .then(() => console.log('✓ MongoDB connection closed'))
      .catch((err) => console.error('✗ Error during shutdown:', err.message))
      .finally(() => process.exit(0));
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Last-resort safety nets — log async errors that escaped a try/catch instead of dying silently.
process.on('unhandledRejection', (reason) => {
  console.error('✗ Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('✗ Uncaught exception:', err);
  process.exit(1);
});
