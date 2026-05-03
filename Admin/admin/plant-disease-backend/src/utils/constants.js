module.exports = {
  USER_ROLES: {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    MODERATOR: 'moderator'
  },
  
  PERMISSIONS: {
    MANAGE_USERS: 'manage_users',
    MANAGE_DISEASES: 'manage_diseases',
    MANAGE_PREDICTIONS: 'manage_predictions',
    MANAGE_NOTIFICATIONS: 'manage_notifications',
    VIEW_REPORTS: 'view_reports'
  },
  
  NOTIFICATION_TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    ALERT: 'alert'
  },
  
  NOTIFICATION_PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },
  
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  }
};