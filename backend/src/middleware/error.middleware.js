export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('[Error Middleware]', err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An internal server error occurred';

  res.status(statusCode).json({
    error: message,
    statusCode
  });
}