const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');
const { sendError } = require('../utils/apiResponse');
const logger = require('../config/logger');

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return sendError(res, 401, 'You are not logged in. Please log in to access this resource');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return sendError(res, 401, 'The admin belonging to this token no longer exists');
    }
    
    if (!admin.isActive) {
      return sendError(res, 401, 'Your account has been deactivated. Please contact support');
    }
    
    if (admin.changedPasswordAfter(decoded.iat)) {
      return sendError(res, 401, 'Password was changed recently. Please log in again');
    }
    
    req.user = admin;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token. Please log in again');
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired. Please log in again');
    }
    return sendError(res, 500, 'Authentication error');
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'You do not have permission to perform this action');
    }
    next();
  };
};

const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return sendError(res, 403, `You need ${permission} permission to perform this action`);
    }
    next();
  };
};

module.exports = { protect, authorize, hasPermission };