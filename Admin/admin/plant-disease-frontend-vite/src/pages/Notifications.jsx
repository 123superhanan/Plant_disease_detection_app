import React, { useEffect, useState } from 'react';
import { notificationService } from '../services/notification.service';
import toast from 'react-hot-toast';
import { 
  FaBell, 
  FaCheck, 
  FaPaperPlane,  // Fixed: Changed from FaSend to FaPaperPlane
  FaArchive, 
  FaPlus, 
  FaEye,
  FaTrash
} from 'react-icons/fa';
import { FiFilter } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    recipients: ['all_admins']
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getAll();
      setNotifications(response.data.data.data);
    } catch (error) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await notificationService.create(formData);
      toast.success('Notification created successfully');
      fetchNotifications();
      setShowModal(false);
      setFormData({ title: '', message: '', type: 'info', priority: 'medium', recipients: ['all_admins'] });
    } catch (error) {
      toast.error('Failed to create notification');
    }
  };

  const handleSend = async (id) => {
    try {
      await notificationService.send(id);
      toast.success('Notification sent');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to send notification');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleArchive = async (id) => {
    try {
      await notificationService.archive(id);
      toast.success('Notification archived');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to archive notification');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      alert: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || colors.info;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800 animate-pulse'
    };
    return colors[priority] || colors.medium;
  };

  const getTypeIcon = (type) => {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      alert: '🚨'
    };
    return icons[type] || '📢';
  };

  const getAdminId = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') {
      const adminId = getAdminId();
      return !notif.readBy?.some(r => r.adminId === adminId);
    }
    if (filter === 'sent') return notif.status === 'sent';
    if (filter === 'pending') return notif.status === 'pending';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600 mt-1">Manage and send system notifications</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <FaPlus /> Create Notification
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'unread', 'sent', 'pending'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize transition ${
              filter === f 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="card text-center py-12">
            <FaBell className="text-gray-400 text-5xl mx-auto mb-4" />
            <p className="text-gray-500">No notifications found</p>
            <button onClick={() => setShowModal(true)} className="btn-primary mt-4">
              Create your first notification
            </button>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div key={notification._id} className="card hover:shadow-lg transition-shadow transform hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                    <h3 className="text-lg font-semibold">{notification.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(notification.type)}`}>
                      {notification.type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                      {notification.priority}
                    </span>
                    {notification.status === 'sent' && (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        ✓ Sent
                      </span>
                    )}
                    {notification.status === 'pending' && (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        ⏳ Pending
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{notification.message}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>📅 {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                    <span>👥 {notification.recipients?.join(', ') || 'all_admins'}</span>
                    {notification.sentAt && <span>📨 Sent {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true })}</span>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {notification.status !== 'sent' && (
                    <button
                      onClick={() => handleSend(notification._id)}
                      className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition"
                      title="Send"
                    >
                      <FaPaperPlane /> {/* Fixed: Changed from FaSend to FaPaperPlane */}
                    </button>
                  )}
                  {!notification.readBy?.some(r => r.adminId === getAdminId()) && notification.status === 'sent' && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition"
                      title="Mark as Read"
                    >
                      <FaCheck />
                    </button>
                  )}
                  <button
                    onClick={() => handleArchive(notification._id)}
                    className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-50 rounded-lg transition"
                    title="Archive"
                  >
                    <FaArchive />
                  </button>
                  <button 
                    className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-50 rounded-lg transition" 
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create Notification</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="label">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  placeholder="Enter notification title"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="label">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input"
                  rows="4"
                  placeholder="Enter notification message"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="label">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input"
                >
                  <option value="info">ℹ️ Info</option>
                  <option value="success">✅ Success</option>
                  <option value="warning">⚠️ Warning</option>
                  <option value="error">❌ Error</option>
                  <option value="alert">🚨 Alert</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="label">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="label">Recipients</label>
                <select
                  value={formData.recipients[0]}
                  onChange={(e) => setFormData({ ...formData, recipients: [e.target.value] })}
                  className="input"
                >
                  <option value="all_admins">All Admins</option>
                  <option value="all_users">All Users</option>
                  <option value="system">System Only</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Create</button>
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

export default Notifications;