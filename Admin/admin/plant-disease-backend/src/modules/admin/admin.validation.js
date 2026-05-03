const Joi = require('joi');

const createAdminSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('super_admin', 'admin', 'moderator'),
  permissions: Joi.array().items(Joi.string().valid('manage_users', 'manage_diseases', 'manage_predictions', 'manage_notifications', 'view_reports'))
});

const updateAdminSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  role: Joi.string().valid('super_admin', 'admin', 'moderator'),
  permissions: Joi.array().items(Joi.string().valid('manage_users', 'manage_diseases', 'manage_predictions', 'manage_notifications', 'view_reports')),
  profilePicture: Joi.string().uri()
});

const updateStatusSchema = Joi.object({
  isActive: Joi.boolean().required()
});

const updatePermissionsSchema = Joi.object({
  permissions: Joi.array().items(Joi.string().valid('manage_users', 'manage_diseases', 'manage_predictions', 'manage_notifications', 'view_reports')).required()
});

const getAdminsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  sortBy: Joi.string().valid('name', 'email', 'role', 'createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc'),
  search: Joi.string(),
  role: Joi.string().valid('super_admin', 'admin', 'moderator'),
  isActive: Joi.boolean()
});

module.exports = {
  createAdminSchema,
  updateAdminSchema,
  updateStatusSchema,
  updatePermissionsSchema,
  getAdminsQuerySchema
};