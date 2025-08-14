const { ZodError } = require('zod');

// Unified error handler returning consistent shape { success:false, message, errors?, request_id }
// Must be added AFTER all routes
const errorHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map(e => ({ path: e.path, message: e.message })),
      request_id: req.id,
    });
  }

  const status = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
  if (status >= 500) {
    console.error('Unhandled error', { request_id: req.id, err });
  }
  res.status(status).json({
    success: false,
    message: err.publicMessage || err.message || 'Internal Server Error',
    request_id: req.id,
  });
};

module.exports = errorHandler;