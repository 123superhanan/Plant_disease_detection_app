class INotificationService {
  async createNotification(notificationData) { throw new Error('Method not implemented'); }
  async sendNotification(notificationId) { throw new Error('Method not implemented'); }
  async getNotifications(filters, pagination) { throw new Error('Method not implemented'); }
  async markAsRead(notificationId, adminId) { throw new Error('Method not implemented'); }
  async getUnreadCount(adminId) { throw new Error('Method not implemented'); }
}

module.exports = { INotificationService };