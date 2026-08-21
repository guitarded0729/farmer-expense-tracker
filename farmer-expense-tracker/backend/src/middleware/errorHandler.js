/**
 * Global Error Handling Middleware for Express.
 * Catches unhandled errors and outputs clean JSON responses.
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[API ERROR]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`,
  });
};
