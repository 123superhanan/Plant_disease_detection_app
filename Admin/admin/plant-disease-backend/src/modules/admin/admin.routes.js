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
  getAdminsQuerySchema
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
router.patch('/:id/permissions', validate(updatePermissionsSchema), adminController.updatePermissions);

module.exports = router;