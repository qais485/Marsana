import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileInformation from '../components/profile/ProfileInformation';
import AddressManagement from '../components/profile/AddressManagement';
import WishlistSection from '../components/profile/WishlistSection';
import RecentlyViewedSection from '../components/profile/RecentlyViewedSection';
import NotificationsSection from '../components/profile/NotificationsSection';
import AccountSettingsSection from '../components/profile/AccountSettingsSection';
import PrivacySettingsSection from '../components/profile/PrivacySettingsSection';
import DeleteAccountSection from '../components/profile/DeleteAccountSection';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import {
  User,
  MapPin,
  Heart,
  Clock,
  Bell,
  Settings,
  Shield,
  Trash2,
  LogOut,
  ClipboardList,
  Star,
  Users,
  Menu,
  X,
} from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'recently-viewed', label: 'Recently Viewed', icon: Clock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Account Settings', icon: Settings },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'delete', label: 'Delete Account', icon: Trash2 },
];

export default function ProfilePage() {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileInformation />;
      case 'addresses':
        return <AddressManagement />;
      case 'wishlist':
        return <WishlistSection />;
      case 'recently-viewed':
        return <RecentlyViewedSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'settings':
        return <AccountSettingsSection />;
      case 'privacy':
        return <PrivacySettingsSection />;
      case 'delete':
        return <DeleteAccountSection />;
      default:
        return <ProfileInformation />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 overflow-x-hidden">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">
            My Profile
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
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isDelete = tab.id === 'delete';
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all duration-200 min-h-[44px] ${
                        isActive
                          ? isDelete ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-marsana-100 dark:bg-marsana-900/30 text-marsana-700 dark:text-marsana-300'
                          : isDelete ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
                <div className="pt-4 mt-4 border-t border-surface-100 dark:border-surface-800 space-y-1">
                  <Link to="/orders" onClick={() => setSidebarOpen(false)} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-3 transition-all duration-200 min-h-[44px]">
                    <ClipboardList className="h-4 w-4" /> My Orders
                  </Link>
                  <Link to="/loyalty" onClick={() => setSidebarOpen(false)} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-3 transition-all duration-200 min-h-[44px]">
                    <Star className="h-4 w-4" /> Loyalty Points
                  </Link>
                  <Link to="/referral" onClick={() => setSidebarOpen(false)} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-3 transition-all duration-200 min-h-[44px]">
                    <Users className="h-4 w-4" /> Refer a Friend
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <nav className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
              <div className="space-y-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isDelete = tab.id === 'delete';
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all duration-200 min-h-[44px] ${
                        isActive
                          ? isDelete
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                            : 'bg-marsana-100 dark:bg-marsana-900/30 text-marsana-700 dark:text-marsana-300'
                          : isDelete
                            ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 mt-4 border-t border-surface-100 dark:border-surface-800 space-y-1">
                <Link
                  to="/orders"
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-3 transition-all duration-200 min-h-[44px]"
                >
                  <ClipboardList className="h-4 w-4" />
                  My Orders
                </Link>
                <Link
                  to="/loyalty"
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-3 transition-all duration-200 min-h-[44px]"
                >
                  <Star className="h-4 w-4" />
                  Loyalty Points
                </Link>
                <Link
                  to="/referral"
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-3 transition-all duration-200 min-h-[44px]"
                >
                  <Users className="h-4 w-4" />
                  Refer a Friend
                </Link>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
