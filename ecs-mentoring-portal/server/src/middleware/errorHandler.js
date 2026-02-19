const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation Error', errors: Object.values(err.errors).map(e => e.message) });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `${field} already exists` });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal server error' });
};

module.exports = errorHandler;
