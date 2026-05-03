const notificationService = require('./notification.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

class NotificationController {
  async createNotification(req, res) {
    try {
      const notification = await notificationService.createNotification(req.body);
      sendSuccess(res, 201, 'Notification created successfully', notification);
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  }

  async sendNotification(req, res) {
    try {
      const { id } = req.params;
      const result = await notificationService.sendNotification(id);
      sendSuccess(res, 200, 'Notification sent successfully', result);
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  }

  async getNotifications(req, res) {
    try {
      const { page, limit, sortBy, sortOrder, type, status, priority, adminId, isRead } = req.query;
      const pagination = { page, limit, sortBy, sortOrder };
      const filters = { type, status, priority, adminId, isRead };
      const result = await notificationService.getNotifications(filters, pagination);
      sendSuccess(res, 200, 'Notifications fetched successfully', result);
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  }

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const notification = await notificationService.markAsRead(id, adminId);
      sendSuccess(res, 200, 'Notification marked as read', notification);
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  }

  async getUnreadCount(req, res) {
    try {
      const adminId = req.user.id;
      const count = await notificationService.getUnreadCount(adminId);
      sendSuccess(res, 200, 'Unread count fetched successfully', count);
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  }

  async archiveNotification(req, res) {
    try {
      const { id } = req.params;
      const notification = await notificationService.archiveNotification(id);
      sendSuccess(res, 200, 'Notification archived successfully', notification);
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  }
}

module.exports = new NotificationController();