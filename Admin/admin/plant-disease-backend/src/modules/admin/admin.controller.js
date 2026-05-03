const adminService = require('./admin.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

class AdminController {
  async createAdmin(req, res) {
    try {
      const admin = await adminService.createAdmin(req.body);
      sendSuccess(res, 201, 'Admin created successfully', admin);
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  }

  async getAllAdmins(req, res) {
    try {
      const { page, limit, sortBy, sortOrder, search, role, isActive } = req.query;
      const pagination = { page, limit, sortBy, sortOrder };
      const filters = { search, role, isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined };
      const result = await adminService.getAllAdmins(filters, pagination);
      sendSuccess(res, 200, 'Admins fetched successfully', result);
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  }

  async getAdminById(req, res) {
    try {
      const admin = await adminService.getAdminById(req.params.id);
      sendSuccess(res, 200, 'Admin fetched successfully', admin);
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  }

  async updateAdmin(req, res) {
    try {
      const admin = await adminService.updateAdmin(req.params.id, req.body);
      sendSuccess(res, 200, 'Admin updated successfully', admin);
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  }

  async deleteAdmin(req, res) {
    try {
      const result = await adminService.deleteAdmin(req.params.id);
      sendSuccess(res, 200, 'Admin deleted successfully', result);
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  }

  async updateAdminStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const admin = await adminService.updateAdminStatus(id, isActive);
      sendSuccess(res, 200, 'Admin status updated successfully', admin);
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  }

  async updatePermissions(req, res) {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      const admin = await adminService.updatePermissions(id, permissions);
      sendSuccess(res, 200, 'Admin permissions updated successfully', admin);
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  }

  async getAdminStats(req, res) {
    try {
      const stats = await adminService.getAdminStats();
      sendSuccess(res, 200, 'Admin stats fetched successfully', stats);
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  }
}

module.exports = new AdminController();