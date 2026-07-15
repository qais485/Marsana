import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api/authService';
import { Shield, Smartphone, Monitor, Trash2, LogOut, Key, Mail, User, Home, LayoutDashboard, ArrowLeft, ClipboardList, Search, Star, Users } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Home
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <nav className="hidden sm:flex items-center gap-4">
                <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </nav>
            </div>
            <button onClick={handleLogout} className="btn-secondary flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'overview' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'security' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('devices')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'devices' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Devices
              </button>
              <div className="pt-2 mt-2 border-t border-gray-200 space-y-1">
                <Link
                  to="/orders"
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <ClipboardList className="h-4 w-4" />
                  My Orders
                </Link>
                <Link
                  to="/track-order"
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <Search className="h-4 w-4" />
                  Track Order
                </Link>
                <Link
                  to="/loyalty"
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <Star className="h-4 w-4" />
                  Loyalty Points
                </Link>
                <Link
                  to="/referral"
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <Users className="h-4 w-4" />
                  Refer a Friend
                </Link>
              </div>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="w-full text-left px-3 py-2 rounded-lg text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email verified</p>
                      <p className="font-medium">
                        {user?.is_email_verified ? (
                          <span className="text-green-600">Verified</span>
                        ) : (
                          <span className="text-yellow-600">Not verified</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">2FA</p>
                      <p className="font-medium">
                        {user?.is_2fa_enabled ? (
                          <span className="text-green-600">Enabled</span>
                        ) : (
                          <span className="text-gray-500">Disabled</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate('/profile')}
                      className="btn-secondary flex items-center gap-2 justify-center"
                    >
                      <User className="h-4 w-4" />
                      Edit profile
                    </button>
                    <button
                      onClick={() => navigate('/change-password')}
                      className="btn-secondary flex items-center gap-2 justify-center"
                    >
                      <Key className="h-4 w-4" />
                      Change password
                    </button>
                    <button
                      onClick={() => navigate('/2fa-setup')}
                      className="btn-secondary flex items-center gap-2 justify-center"
                    >
                      <Shield className="h-4 w-4" />
                      {user?.is_2fa_enabled ? 'Manage 2FA' : 'Enable 2FA'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Email verification</p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                      </div>
                    </div>
                    <span className={`text-sm ${user?.is_email_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {user?.is_email_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Two-factor authentication</p>
                        <p className="text-sm text-gray-600">
                          {user?.is_2fa_enabled ? 'Enabled' : 'Not enabled'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/2fa-setup')}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      {user?.is_2fa_enabled ? 'Manage' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'devices' && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Devices</h2>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : devices.length === 0 ? (
                  <p className="text-gray-500">No devices found</p>
                ) : (
                  <div className="space-y-3">
                    {devices.map((device) => (
                      <div key={device.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {device.device_type === 'mobile' ? (
                            <Smartphone className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Monitor className="h-5 w-5 text-gray-500" />
                          )}
                          <div>
                            <p className="font-medium">{device.device_name}</p>
                            <p className="text-sm text-gray-600">
                              {device.device_os} &middot; {device.browser}
                            </p>
                            <p className="text-xs text-gray-500">
                              Last active: {new Date(device.last_active_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevokeDevice(device.id)}
                          className="text-red-500 hover:text-red-700"
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
    </div>
  );
}
