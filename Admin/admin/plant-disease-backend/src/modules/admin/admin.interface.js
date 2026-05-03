class IAdminService {
  async createAdmin(adminData) { throw new Error('Method not implemented'); }
  async getAllAdmins(filters, pagination) { throw new Error('Method not implemented'); }
  async getAdminById(id) { throw new Error('Method not implemented'); }
  async updateAdmin(id, updateData) { throw new Error('Method not implemented'); }
  async deleteAdmin(id) { throw new Error('Method not implemented'); }
  async updateAdminStatus(id, status) { throw new Error('Method not implemented'); }
  async updatePermissions(id, permissions) { throw new Error('Method not implemented'); }
}

module.exports = { IAdminService };