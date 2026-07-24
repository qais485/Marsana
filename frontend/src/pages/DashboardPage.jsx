import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api/authService';
import { Shield, Smartphone, Monitor, Trash2, LogOut, Key, Mail, User, Home, LayoutDashboard, ArrowLeft, ClipboardList, Search, Star, Users, Menu, X } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const devicesRes = await authService.getDevices();
        setDevices(devicesRes.data?.data || devicesRes.data || []);
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRevokeDevice = async (deviceId) => {
    try {
      await authService.revokeDevice(deviceId);
      setDevices(devices.filter(d => d.id !== deviceId));
    } catch {
      // Handle error
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'security', label: 'Security' },
    { id: 'devices', label: 'Devices' },
  ];

  const navLinks = [
    { to: '/orders', icon: ClipboardList, label: 'My Orders' },
    { to: '/track-order', icon: Search, label: 'Track Order' },
    { to: '/loyalty', icon: Star, label: 'Loyalty Points' },
    { to: '/referral', icon: Users, label: 'Refer a Friend' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 overflow-x-hidden">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Link
            to="/"
            className="text-sm text-surface-500 hover:text-marsana-600 dark:text-surface-400 dark:hover:text-marsana-400 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">
            Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="btn-outline flex items-center gap-2 w-fit"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>

        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden mb-4 p-2 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <Menu className="h-5 w-5 text-surface-600 dark:text-surface-400" />
        </button>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-surface-900 shadow-xl overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Menu</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <X className="h-5 w-5 text-surface-500" />
                </button>
              </div>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all duration-200 min-h-[44px] ${
                      activeTab === tab.id
                        ? 'bg-marsana-100 dark:bg-marsana-900/30 text-marsana-700 dark:text-marsana-300'
                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                <div className="pt-4 mt-4 border-t border-surface-100 dark:border-surface-800 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setSidebarOpen(false)}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-3 transition-all duration-200 min-h-[44px]"
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  ))}
                </div>
                {user?.role === 'admin' && (
                  <div className="pt-4 mt-4 border-t border-surface-100 dark:border-surface-800">
                    <Link to="/admin" onClick={() => setSidebarOpen(false)} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 flex items-center gap-3 transition-all duration-200 min-h-[44px]">
                      <LayoutDashboard className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <nav className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all duration-200 min-h-[44px] ${
                      activeTab === tab.id
                        ? 'bg-marsana-100 dark:bg-marsana-900/30 text-marsana-700 dark:text-marsana-300'
                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="pt-4 mt-4 border-t border-surface-100 dark:border-surface-800 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-3 transition-all duration-200 min-h-[44px]"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </div>

              {user?.role === 'admin' && (
                <div className="pt-4 mt-4 border-t border-surface-100 dark:border-surface-800">
                  <Link
                    to="/admin"
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 flex items-center gap-3 transition-all duration-200 min-h-[44px]"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                </div>
              )}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                    Account Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-surface-500 dark:text-surface-400">Name</p>
                      <p className="font-medium text-surface-900 dark:text-white">
                        {user?.first_name} {user?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-surface-500 dark:text-surface-400">Email</p>
                      <p className="font-medium text-surface-900 dark:text-white">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-surface-500 dark:text-surface-400">Email verified</p>
                      <p className="font-medium">
                        {user?.is_email_verified ? (
                          <span className="text-emerald-600 dark:text-emerald-400">Verified</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400">Not verified</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-surface-500 dark:text-surface-400">2FA</p>
                      <p className="font-medium">
                        {user?.is_2fa_enabled ? (
                          <span className="text-emerald-600 dark:text-emerald-400">Enabled</span>
                        ) : (
                          <span className="text-surface-400 dark:text-surface-500">Disabled</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate('/profile')}
                      className="btn-outline flex items-center gap-2 justify-center"
                    >
                      <User className="h-4 w-4" />
                      Edit profile
                    </button>
                    <button
                      onClick={() => navigate('/change-password')}
                      className="btn-outline flex items-center gap-2 justify-center"
                    >
                      <Key className="h-4 w-4" />
                      Change password
                    </button>
                    <button
                      onClick={() => navigate('/2fa-setup')}
                      className="btn-outline flex items-center gap-2 justify-center"
                    >
                      <Shield className="h-4 w-4" />
                      {user?.is_2fa_enabled ? 'Manage 2FA' : 'Enable 2FA'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                  Security Settings
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-surface-500 dark:text-surface-400" />
                      </div>
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">
                          Email verification
                        </p>
                        <p className="text-sm text-surface-500 dark:text-surface-400">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${user?.is_email_verified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {user?.is_email_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-surface-500 dark:text-surface-400" />
                      </div>
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">
                          Two-factor authentication
                        </p>
                        <p className="text-sm text-surface-500 dark:text-surface-400">
                          {user?.is_2fa_enabled ? 'Enabled' : 'Not enabled'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/2fa-setup')}
                      className="text-sm text-marsana-600 dark:text-marsana-400 hover:text-marsana-700 dark:hover:text-marsana-300 font-medium"
                    >
                      {user?.is_2fa_enabled ? 'Manage' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'devices' && (
              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                  Active Devices
                </h2>
                {loading ? (
                  <p className="text-surface-500 dark:text-surface-400">Loading...</p>
                ) : devices.length === 0 ? (
                  <p className="text-surface-500 dark:text-surface-400">No devices found</p>
                ) : (
                  <div className="space-y-3">
                    {devices.map((device) => (
                      <div
                        key={device.id}
                        className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                            {device.device_type === 'mobile' ? (
                              <Smartphone className="h-5 w-5 text-surface-500 dark:text-surface-400" />
                            ) : (
                              <Monitor className="h-5 w-5 text-surface-500 dark:text-surface-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-surface-900 dark:text-white">
                              {device.device_name}
                            </p>
                            <p className="text-sm text-surface-500 dark:text-surface-400">
                              {device.device_os} &middot; {device.browser}
                            </p>
                            <p className="text-xs text-surface-400 dark:text-surface-500">
                              Last active: {new Date(device.last_active_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevokeDevice(device.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
