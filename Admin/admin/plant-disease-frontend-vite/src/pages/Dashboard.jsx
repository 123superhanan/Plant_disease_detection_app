import React, { useEffect, useState } from 'react';
import { adminService } from '../services/admin.service';
import { notificationService } from '../services/notification.service';
import { FaUsers, FaBell, FaChartLine, FaCheckCircle, FaUserShield, FaEnvelope } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, unreadRes] = await Promise.all([
        adminService.getStats(),
        notificationService.getUnreadCount()
      ]);
      setStats(statsRes.data.data);
      setUnreadCount(unreadRes.data.data.unreadCount);
      
      // Mock recent activity (you can replace with actual API)
      setRecentActivity([
        { action: 'Admin login', time: '2 minutes ago', user: 'System' },
        { action: 'New notification created', time: '1 hour ago', user: 'Admin' },
        { action: 'User registered', time: '3 hours ago', user: 'John Doe' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalAdmins = stats?.reduce((acc, curr) => acc + curr.count, 0) || 0;
  const activeAdmins = stats?.reduce((acc, curr) => acc + curr.active, 0) || 0;

  const statsCards = [
    { title: 'Total Admins', value: totalAdmins, icon: FaUsers, color: 'bg-blue-500', change: '+12%' },
    { title: 'Active Admins', value: activeAdmins, icon: FaCheckCircle, color: 'bg-green-500', change: '+5%' },
    { title: 'Unread Notifications', value: unreadCount, icon: FaBell, color: 'bg-yellow-500', change: unreadCount > 0 ? '+3' : '0' },
    { title: 'Total Roles', value: stats?.length || 0, icon: FaUserShield, color: 'bg-purple-500', change: '0%' },
  ];

  const pieData = stats?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div key={index} className="card hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
                <p className="text-xs text-green-600 mt-1">{card.change} from last month</p>
              </div>
              <div className={`${card.color} p-3 rounded-full`}>
                <card.icon className="text-white text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Admin Roles Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-500">by {activity.user}</p>
                </div>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/admins'} 
            className="bg-blue-50 text-blue-700 p-4 rounded-lg hover:bg-blue-100 transition"
          >
            <FaUsers className="text-2xl mx-auto mb-2" />
            <p className="font-medium">Manage Admins</p>
          </button>
          <button 
            onClick={() => window.location.href = '/notifications'} 
            className="bg-purple-50 text-purple-700 p-4 rounded-lg hover:bg-purple-100 transition"
          >
            <FaBell className="text-2xl mx-auto mb-2" />
            <p className="font-medium">Send Notification</p>
          </button>
          <button className="bg-green-50 text-green-700 p-4 rounded-lg hover:bg-green-100 transition">
            <FaChartLine className="text-2xl mx-auto mb-2" />
            <p className="font-medium">View Reports</p>
          </button>
          <button className="bg-yellow-50 text-yellow-700 p-4 rounded-lg hover:bg-yellow-100 transition">
            <FaEnvelope className="text-2xl mx-auto mb-2" />
            <p className="font-medium">Email Settings</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;