const Joi = require('joi');

const createNotificationSchema = Joi.object({
  title: Joi.string().max(200).required(),
  message: Joi.string().required(),
  type: Joi.string().valid('info', 'success', 'warning', 'error', 'alert'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  recipients: Joi.array().items(Joi.string().valid('all_admins', 'specific_admin', 'all_users', 'specific_user', 'system')).required(),
  specificRecipients: Joi.array().items(Joi.string()),
  specificAdmins: Joi.array().items(Joi.string()),
  metadata: Joi.object(),
  actions: Joi.array().items(Joi.object({ label: Joi.string().required(), url: Joi.string().required(), method: Joi.string() })),
  expiresAt: Joi.date()
});

const getNotificationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  sortBy: Joi.string().valid('title', 'type', 'priority', 'createdAt', 'sentAt'),
  sortOrder: Joi.string().valid('asc', 'desc'),
  type: Joi.string().valid('info', 'success', 'warning', 'error', 'alert'),
  status: Joi.string().valid('pending', 'sent', 'failed', 'partial'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  isRead: Joi.boolean()
});

module.exports = { createNotificationSchema, getNotificationsQuerySchema };