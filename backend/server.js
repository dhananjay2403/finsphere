const mongoose = require('mongoose');

const app = require('./app');
const connectDB = require('./config/db');

connectDB();

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
