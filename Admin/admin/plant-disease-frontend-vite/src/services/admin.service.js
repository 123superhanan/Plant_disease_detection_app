import api from './api';

export const adminService = {
  getAll: (params = {}) => api.get('/admin', { params }),
  getById: (id) => api.get(`/admin/${id}`),
  create: (data) => api.post('/admin', data),
  update: (id, data) => api.put(`/admin/${id}`, data),
  delete: (id) => api.delete(`/admin/${id}`),
  updateStatus: (id, isActive) => api.patch(`/admin/${id}/status`, { isActive }),
  updatePermissions: (id, permissions) => api.patch(`/admin/${id}/permissions`, { permissions }),
  getStats: () => api.get('/admin/stats'),
};