import { useEffect, useState } from 'react';
import {
  FaBars,
  FaBell,
  FaLeaf,
  FaSignOutAlt,
  FaTachometerAlt,
  FaTimes,
  FaUsers,
} from 'react-icons/fa';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notification.service';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/admins', label: 'Admins', icon: FaUsers },
    { path: '/notifications', label: 'Notifications', icon: FaBell, badge: unreadCount },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed lg:relative z-20 transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64 bg-white shadow-lg h-full overflow-y-auto`}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-green-100 p-2 rounded-lg">
              <FaLeaf className="text-green-600 text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">ArgoVision ltd</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition duration-200 ${
                    isActive ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-64 p-6 border-t">
          <div className="mb-4">
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="font-semibold text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 w-full p-2 rounded-lg hover:bg-red-50 transition"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            <div className="flex items-center gap-4">
              <div className="relative">
                <FaBell className="text-gray-600 text-xl cursor-pointer" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
