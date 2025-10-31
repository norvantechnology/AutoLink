import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  LogOut, 
  Menu, 
  X, 
  Linkedin,
  History,
  Calendar,
  CreditCard,
  Shield
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useLinkedInStore from '../store/linkedinStore';

function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { connected } = useLinkedInStore();

  // Navigation based on user role
  const userNavigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Topics', href: '/app/topics', icon: FileText },
    { name: 'Scheduled Posts', href: '/app/scheduled', icon: Calendar },
    { name: 'Post History', href: '/app/posts', icon: History },
    { name: 'Payment History', href: '/app/payments', icon: CreditCard },
    { name: 'LinkedIn', href: '/app/linkedin', icon: Linkedin },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/app/admin', icon: LayoutDashboard },
  ];

  const navigation = user?.role === 'admin' ? adminNavigation : userNavigation;

  const isActive = (path) => location.pathname === path;

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Link 
            to="/app/dashboard" 
            className="flex items-center space-x-2"
            onClick={() => setSidebarOpen(false)}
          >
            <Linkedin className="w-8 h-8 text-linkedin" />
            <span className="text-xl font-bold text-gray-900">LinkedOra</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-linkedin text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          {connected && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 font-medium">
                  LinkedIn Connected
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="ml-2 p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:flex-none"></div>
            <div className="flex items-center space-x-4">
              {!connected && (
                <Link
                  to="/app/linkedin"
                  onClick={() => setSidebarOpen(false)}
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-linkedin text-white rounded-lg hover:bg-linkedin-dark transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  <span className="text-sm font-medium">Connect LinkedIn</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
