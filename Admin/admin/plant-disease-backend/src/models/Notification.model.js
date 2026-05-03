const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'alert'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  recipients: [{
    type: String,
    enum: ['all_admins', 'specific_admin', 'all_users', 'specific_user', 'system'],
    required: true
  }],
  specificRecipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  specificAdmins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  actions: [{
    label: String,
    url: String,
    method: String
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: null
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'partial'],
    default: 'pending'
  },
  errorMessage: String
}, {
  timestamps: true
});

notificationSchema.index({ sentAt: -1 });
notificationSchema.index({ status: 1, sentAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);