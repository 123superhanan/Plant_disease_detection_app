const logger = require('../config/logger');
const { sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return sendError(res, 400, `Duplicate value for ${field}. Please use another value`);
  }
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return sendError(res, 400, 'Validation error', errors);
  }
  
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token');
  }
  
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired');
  }
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  sendError(res, statusCode, message);
};

const notFound = (req, res, next) => {
  sendError(res, 404, `Cannot ${req.method} ${req.url}`);
};

module.exports = { errorHandler, notFound };