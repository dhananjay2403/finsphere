/**
 * Global error handler middleware.
 *
 * Catches every error that Express routes / middleware pass to next(err).
 * Returns a consistent JSON shape:
 *   { success: false, message: "..." }
 *
 * In development, includes the error stack for easier debugging.
 */
const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
