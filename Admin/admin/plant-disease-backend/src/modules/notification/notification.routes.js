const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { validate } = require('../../middleware/validate.middleware');
const { protect } = require('../../middleware/auth.middleware');
const { createNotificationSchema, getNotificationsQuerySchema } = require('./notification.validation');

router.use(protect);

router.post('/', validate(createNotificationSchema), notificationController.createNotification);
router.get('/', validate(getNotificationsQuerySchema, 'query'), notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.post('/:id/send', notificationController.sendNotification);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/:id/archive', notificationController.archiveNotification);

module.exports = router;