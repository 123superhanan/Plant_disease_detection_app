import React, { useEffect, useState } from 'react';
import { adminService } from '../services/admin.service';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaPlus, FaSearch, FaFilter } from 'react-icons/fa';

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    permissions: []
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await adminService.getAll();
      setAdmins(response.data.data.data);
    } catch (error) {
      toast.error('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        await adminService.update(editingAdmin._id, formData);
        toast.success('Admin updated successfully');
      } else {
        await adminService.create(formData);
        toast.success('Admin created successfully');
      }
      fetchAdmins();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await adminService.delete(id);
        toast.success('Admin deleted successfully');
        fetchAdmins();
      } catch (error) {
        toast.error('Failed to delete admin');
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      await adminService.updateStatus(id, !currentStatus);
      toast.success('Admin status updated');
      fetchAdmins();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      permissions: []
    });
    setEditingAdmin(null);
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      permissions: admin.permissions
    });
    setShowModal(true);
  };

  const permissionOptions = ['manage_users', 'manage_diseases', 'manage_predictions', 'manage_notifications', 'view_reports'];
  
  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading admins...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Management</h1>
          <p className="text-gray-600 mt-1">Manage system administrators and their permissions</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Add Admin
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmins.map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-medium">
                          {admin.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                        <div className="text-sm text-gray-500">ID: {admin._id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{admin.email}</div>
                    <div className="text-sm text-gray-500">Joined {new Date(admin.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      admin.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {admin.permissions.slice(0, 2).map((perm, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {perm.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {admin.permissions.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{admin.permissions.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleStatusToggle(admin._id, admin.isActive)}
                      className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                        admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {admin.isActive ? <FaCheck size={10} /> : <FaTimes size={10} />}
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(admin._id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="label">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  required
                />
              </div>
              {!editingAdmin && (
                <div className="mb-4">
                  <label className="label">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input"
                    required={!editingAdmin}
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="label">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input"
                >
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="label">Permissions</label>
                <div className="space-y-2 border rounded-lg p-3 max-h-40 overflow-y-auto">
                  {permissionOptions.map(perm => (
                    <label key={perm} className="flex items-center hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, permissions: [...formData.permissions, perm] });
                          } else {
                            setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm) });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{perm.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingAdmin ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;