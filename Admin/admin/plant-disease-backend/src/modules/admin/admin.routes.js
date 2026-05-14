const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { validate } = require('../../middleware/validate.middleware');
const { protect, authorize } = require('../../middleware/auth.middleware');
const {
  createAdminSchema,
  updateAdminSchema,
  updateStatusSchema,
  updatePermissionsSchema,
  getAdminsQuerySchema,
} = require('./admin.validation');

router.use(protect);
router.use(authorize('super_admin'));

router.post('/', validate(createAdminSchema), adminController.createAdmin);
router.get('/', validate(getAdminsQuerySchema, 'query'), adminController.getAllAdmins);
router.get('/stats', adminController.getAdminStats);
router.get('/:id', adminController.getAdminById);
router.put('/:id', validate(updateAdminSchema), adminController.updateAdmin);
router.delete('/:id', adminController.deleteAdmin);
router.patch('/:id/status', validate(updateStatusSchema), adminController.updateAdminStatus);
router.patch(
  '/:id/permissions',
  validate(updatePermissionsSchema),
  adminController.updatePermissions
);

// ==========  SIMPLE ENDPOINTS (add at bottom) ==========

// Get all users (for admin to see)
router.get('/users-list', async (req, res) => {
  const users = await sql`
    SELECT id, email, created_at,
      (SELECT COUNT(*) FROM detection_history WHERE user_id = users.id) as scan_count
    FROM users
    ORDER BY created_at DESC
  `;
  res.json(users);
});

// Get all detections (for admin to see)
router.get('/all-detections', async (req, res) => {
  const detections = await sql`
    SELECT d.*, u.email
    FROM detection_history d
    JOIN users u ON d.user_id = u.id
    ORDER BY d.created_at DESC
  `;
  res.json(detections);
});

// Get unread count for user
router.get('/notifications/unread-count', async (req, res) => {
  const userId = req.auth?.userId;
  const result = await sql`
    SELECT COUNT(*) as count 
    FROM notifications 
    WHERE user_id = (SELECT id FROM users WHERE clerk_id = ${userId})
    AND is_read = false
  `;
  res.json({ unreadCount: result[0]?.count || 0 });
});

// Mark notification as read
router.patch('/notifications/:id/read', async (req, res) => {
  await sql`
    UPDATE notifications 
    SET is_read = true 
    WHERE id = ${req.params.id}
  `;
  res.json({ success: true });
});
module.exports = router;
