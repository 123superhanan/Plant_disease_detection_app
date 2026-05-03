const express = require('express');
const router = express.Router();
const { generateToken } = require('../../utils/jwt');
const Admin = require('../../models/Admin.model');
const { sendSuccess, sendError } = require('../../utils/apiResponse');
const { authLimiter } = require('../../middleware/rateLimit.middleware');
const { protect } = require('../../middleware/auth.middleware');

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password');
    }
    
    const admin = await Admin.findOne({ email }).select('+password');
    
    if (!admin || !(await admin.comparePassword(password))) {
      return sendError(res, 401, 'Invalid email or password');
    }
    
    if (!admin.isActive) {
      return sendError(res, 401, 'Your account has been deactivated');
    }
    
    admin.lastLogin = new Date();
    await admin.save();
    
    const token = generateToken(admin._id);
    
    const adminData = admin.toObject();
    delete adminData.password;
    
    sendSuccess(res, 200, 'Login successful', { user: adminData, token });
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    sendSuccess(res, 200, 'Current admin fetched', req.user);
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const admin = await Admin.findById(req.user.id).select('+password');
    
    if (!(await admin.comparePassword(currentPassword))) {
      return sendError(res, 401, 'Current password is incorrect');
    }
    
    admin.password = newPassword;
    await admin.save();
    
    sendSuccess(res, 200, 'Password changed successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

module.exports = router;