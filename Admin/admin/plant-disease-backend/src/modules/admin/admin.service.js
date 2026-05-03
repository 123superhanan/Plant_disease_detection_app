const Admin = require('../../models/Admin.model');
const { IAdminService } = require('./admin.interface');
const logger = require('../../config/logger');
const ApiError = require('../../utils/apiError');

class AdminService extends IAdminService {
  async createAdmin(adminData) {
    try {
      const existingAdmin = await Admin.findOne({ email: adminData.email });
      if (existingAdmin) {
        throw new ApiError(400, 'Admin with this email already exists');
      }

      const admin = new Admin(adminData);
      await admin.save();
      
      const adminResponse = admin.toObject();
      delete adminResponse.password;
      
      logger.info(`Admin created successfully: ${admin.email}`);
      return adminResponse;
    } catch (error) {
      logger.error('Error creating admin:', error);
      throw error;
    }
  }

  async getAllAdmins(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      const { search, role, isActive } = filters;
      
      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (role) query.role = role;
      if (isActive !== undefined) query.isActive = isActive;
      
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
      
      const [admins, total] = await Promise.all([
        Admin.find(query).select('-password -refreshToken').sort(sort).skip(skip).limit(limit),
        Admin.countDocuments(query)
      ]);
      
      return {
        data: admins,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      };
    } catch (error) {
      logger.error('Error fetching admins:', error);
      throw error;
    }
  }

  async getAdminById(id) {
    try {
      const admin = await Admin.findById(id).select('-password -refreshToken');
      if (!admin) throw new ApiError(404, 'Admin not found');
      return admin;
    } catch (error) {
      logger.error('Error fetching admin by ID:', error);
      throw error;
    }
  }

  async updateAdmin(id, updateData) {
    try {
      delete updateData.password;
      delete updateData.email;
      delete updateData.refreshToken;
      
      const admin = await Admin.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
        .select('-password -refreshToken');
      
      if (!admin) throw new ApiError(404, 'Admin not found');
      logger.info(`Admin updated successfully: ${admin.email}`);
      return admin;
    } catch (error) {
      logger.error('Error updating admin:', error);
      throw error;
    }
  }

  async deleteAdmin(id) {
    try {
      const admin = await Admin.findByIdAndDelete(id);
      if (!admin) throw new ApiError(404, 'Admin not found');
      logger.info(`Admin deleted successfully: ${admin.email}`);
      return { message: 'Admin deleted successfully' };
    } catch (error) {
      logger.error('Error deleting admin:', error);
      throw error;
    }
  }

  async updateAdminStatus(id, isActive) {
    try {
      const admin = await Admin.findByIdAndUpdate(id, { isActive }, { new: true })
        .select('-password -refreshToken');
      if (!admin) throw new ApiError(404, 'Admin not found');
      logger.info(`Admin status updated: ${admin.email} -> ${isActive}`);
      return admin;
    } catch (error) {
      logger.error('Error updating admin status:', error);
      throw error;
    }
  }

  async updatePermissions(id, permissions) {
    try {
      const admin = await Admin.findByIdAndUpdate(id, { permissions }, { new: true })
        .select('-password -refreshToken');
      if (!admin) throw new ApiError(404, 'Admin not found');
      logger.info(`Admin permissions updated: ${admin.email}`);
      return admin;
    } catch (error) {
      logger.error('Error updating admin permissions:', error);
      throw error;
    }
  }

  async getAdminStats() {
    try {
      const stats = await Admin.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 }, active: { $sum: { $cond: ['$isActive', 1, 0] } }, inactive: { $sum: { $cond: ['$isActive', 0, 1] } } } }
      ]);
      return stats;
    } catch (error) {
      logger.error('Error fetching admin stats:', error);
      throw error;
    }
  }
}

module.exports = new AdminService();