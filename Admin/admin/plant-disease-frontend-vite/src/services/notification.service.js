import api from './api';

export const notificationService = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  create: (data) => api.post('/notifications', data),
  send: (id) => api.post(`/notifications/${id}/send`),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  archive: (id) => api.patch(`/notifications/${id}/archive`),
};