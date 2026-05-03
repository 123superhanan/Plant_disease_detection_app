const Notification = require('../../models/Notification.model');
const Admin = require('../../models/Admin.model');
const { INotificationService } = require('./notification.interface');
const logger = require('../../config/logger');
const ApiError = require('../../utils/apiError');
const notificationEmitter = require('../../services/notificationEmitter.service');

class NotificationService extends INotificationService {
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      logger.info(`Notification created: ${notification._id}`);
      notificationEmitter.emit('notification.created', notification);
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  async sendNotification(notificationId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) throw new ApiError(404, 'Notification not found');
      
      let recipients = [];
      if (notification.recipients.includes('all_admins')) {
        const admins = await Admin.find({ isActive: true }).select('_id email name');
        recipients = admins;
      }
      
      const result = await this.dispatchNotifications(notification, recipients);
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();
      
      logger.info(`Notification sent: ${notificationId}`);
      return result;
    } catch (error) {
      logger.error('Error sending notification:', error);
      notification.status = 'failed';
      notification.errorMessage = error.message;
      await notification.save();
      throw error;
    }
  }

  async dispatchNotifications(notification, recipients) {
    notificationEmitter.emit('notification.dispatch', { notification, recipients });
    return { sent: recipients.length, recipients: recipients.length };
  }

  async getNotifications(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      const { type, status, priority, adminId, isRead } = filters;
      
      const query = {};
      if (type) query.type = type;
      if (status) query.status = status;
      if (priority) query.priority = priority;
      
      if (adminId && isRead !== undefined) {
        const readCondition = isRead === 'true' 
          ? { 'readBy.adminId': adminId }
          : { 'readBy.adminId': { $ne: adminId } };
        Object.assign(query, readCondition);
      }
      
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
      
      const [notifications, total] = await Promise.all([
        Notification.find(query).sort(sort).skip(skip).limit(limit),
        Notification.countDocuments(query)
      ]);
      
      return { data: notifications, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId, adminId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) throw new ApiError(404, 'Notification not found');
      
      const alreadyRead = notification.readBy.some(r => r.adminId.toString() === adminId);
      if (!alreadyRead) {
        notification.readBy.push({ adminId, readAt: new Date() });
        await notification.save();
      }
      
      return notification;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async getUnreadCount(adminId) {
    try {
      const count = await Notification.countDocuments({
        'readBy.adminId': { $ne: adminId },
        status: 'sent'
      });
      return { unreadCount: count };
    } catch (error) {
      logger.error('Error getting unread count:', error);
      throw error;
    }
  }

  async archiveNotification(notificationId) {
    try {
      const notification = await Notification.findByIdAndUpdate(notificationId, { isArchived: true }, { new: true });
      if (!notification) throw new ApiError(404, 'Notification not found');
      return notification;
    } catch (error) {
      logger.error('Error archiving notification:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();