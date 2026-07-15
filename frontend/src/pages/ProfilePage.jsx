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
  Home,
  LayoutDashboard,
  ClipboardList,
  Star,
  Users,
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
              <nav className="hidden sm:flex items-center gap-4">
                <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
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
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-sm ${
                      activeTab === tab.id
                        ? tab.id === 'delete'
                          ? 'bg-red-50 text-red-700 font-medium'
                          : 'bg-primary-50 text-primary-700 font-medium'
                        : tab.id === 'delete'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
              <div className="pt-2 mt-2 border-t border-gray-200 space-y-1">
                <Link
                  to="/orders"
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center gap-3 text-sm"
                >
                  <ClipboardList className="h-4 w-4" />
                  My Orders
                </Link>
                <Link
                  to="/loyalty"
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center gap-3 text-sm"
                >
                  <Star className="h-4 w-4" />
                  Loyalty Points
                </Link>
                <Link
                  to="/referral"
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center gap-3 text-sm"
                >
                  <Users className="h-4 w-4" />
                  Refer a Friend
                </Link>
              </div>
            </nav>
          </div>

          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
