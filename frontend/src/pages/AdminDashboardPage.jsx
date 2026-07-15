import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api/adminService';
import { adminCategoryService } from '../services/api/adminCategoryService';
import AdminProductList from '../components/admin/AdminProductList';
import AdminProductForm from '../components/admin/AdminProductForm';
import AdminProductInventory from '../components/admin/AdminProductInventory';
import AdminProductImportExport from '../components/admin/AdminProductImportExport';
import AdminCategoryList from '../components/admin/AdminCategoryList';
import AdminCategoryForm from '../components/admin/AdminCategoryForm';
import AdminOrderList from '../components/admin/AdminOrderList';
import AdminOrderDetail from '../components/admin/AdminOrderDetail';
import AdminNotificationStats from '../components/admin/AdminNotificationStats';
import AdminTemplateList from '../components/admin/AdminTemplateList';
import AdminTemplateForm from '../components/admin/AdminTemplateForm';
import AdminNotificationList from '../components/admin/AdminNotificationList';
import AdminNotificationForm from '../components/admin/AdminNotificationForm';
import AdminNotificationBroadcast from '../components/admin/AdminNotificationBroadcast';
import AdminContactMessageList from '../components/admin/AdminContactMessageList';
import AdminFAQList from '../components/admin/AdminFAQList';
import AdminFAQForm from '../components/admin/AdminFAQForm';
import AdminHelpArticleList from '../components/admin/AdminHelpArticleList';
import AdminHelpArticleForm from '../components/admin/AdminHelpArticleForm';
import {
  Loader2,
  Users,
  Package,
  DollarSign,
  Star,
  TrendingUp,
  ShoppingCart,
  ArrowLeft,
  BarChart3,
  AlertTriangle,
  UserPlus,
  List,
  Plus,
  Database,
  ArrowUpDown,
  FolderTree,
  Tag,
  Zap,
  Bell,
  Send,
  Radio,
  FileText,
  Headphones,
  MessageSquare,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
      {sub && <p className="text-xs text-gray-400 mt-2">{sub}</p>}
    </div>
  );
}

function SimpleBarChart({ data, maxVal }) {
  const max = maxVal || Math.max(...data.map((d) => d.count || d.revenue || 0), 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((item, i) => {
        const val = item.count || item.revenue || 0;
        const pct = (val / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-500">
              {typeof val === 'number' && val >= 1000
                ? `${(val / 1000).toFixed(1)}k`
                : val}
            </span>
            <div
              className="w-full bg-primary-500 rounded-t min-h-[2px]"
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            <span className="text-[9px] text-gray-400 truncate w-full text-center">
              {item.month?.split(' ')[0] || ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [productSubTab, setProductSubTab] = useState('stats');
  const [editingProduct, setEditingProduct] = useState(undefined);
  const [categorySubTab, setCategorySubTab] = useState('list');
  const [editingCategory, setEditingCategory] = useState(undefined);
  const [allCategories, setAllCategories] = useState([]);
  const [orderSubTab, setOrderSubTab] = useState('list');
  const [viewingOrder, setViewingOrder] = useState(null);
  const [notificationSubTab, setNotificationSubTab] = useState('stats');
  const [supportSubTab, setSupportSubTab] = useState('messages');
  const [editingFAQ, setEditingFAQ] = useState(undefined);
  const [editingHelpArticle, setEditingHelpArticle] = useState(undefined);
  const [editingTemplate, setEditingTemplate] = useState(undefined);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTabData = async (tab) => {
    try {
      setLoading(true);
      setError(null);
      let response;
      switch (tab) {
        case 'users':
          response = await adminService.getUserStats();
          break;
        case 'products':
          response = await adminService.getProductStats();
          break;
        case 'sales':
          response = await adminService.getSalesStats();
          break;
        case 'revenue':
          response = await adminService.getRevenueStats();
          break;
        default:
          response = await adminService.getDashboard();
      }
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to load data');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchTabData(activeTab);
    };
    loadData();
  }, [activeTab]);

  const fetchAllCategories = async () => {
    try {
      const response = await adminCategoryService.getCategories();
      if (response.success) {
        setAllCategories(response.data || []);
      }
    } catch {
      // Silently fail for category list
    }
  };

  useEffect(() => {
    if (activeTab === 'categories') {
      let cancelled = false;
      const loadCategories = async () => {
        try {
          const response = await adminCategoryService.getCategories();
          if (!cancelled && response.success) {
            setAllCategories(response.data || []);
          }
        } catch {
          // Silently fail for category list
        }
      };
      loadCategories();
      return () => { cancelled = true; };
    }
  }, [activeTab]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'promotions', label: 'Promotions', icon: Tag },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'support', label: 'Support', icon: Headphones },
  ];

  const productSubTabs = [
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'list', label: 'Products', icon: List },
    { id: 'create', label: 'Add Product', icon: Plus },
    { id: 'inventory', label: 'Inventory', icon: Database },
    { id: 'import-export', label: 'Import/Export', icon: ArrowUpDown },
  ];

  const categorySubTabs = [
    { id: 'list', label: 'Categories', icon: List },
    { id: 'create', label: 'Add Category', icon: Plus },
  ];

  const orderSubTabs = [
    { id: 'list', label: 'Orders', icon: List },
  ];

  const notificationSubTabs = [
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'list', label: 'Notifications', icon: Bell },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'send', label: 'Send Notification', icon: Send },
    { id: 'broadcast', label: 'Broadcast', icon: Radio },
  ];

  const supportSubTabs = [
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'help', label: 'Help Articles', icon: BookOpen },
  ];

  const handleViewOrder = (order) => {
    setViewingOrder(order);
    setOrderSubTab('detail');
  };

  const handleEditProduct = (product) => {
    if (product === null) {
      setEditingProduct(null);
      setProductSubTab('create');
    } else {
      setEditingProduct(product);
      setProductSubTab('create');
    }
  };

  const handleProductSave = () => {
    setEditingProduct(undefined);
    setProductSubTab('list');
    fetchTabData('products');
  };

  const handleEditCategory = (category) => {
    if (category === null) {
      setEditingCategory(null);
      setCategorySubTab('create');
    } else {
      setEditingCategory(category);
      setCategorySubTab('create');
    }
  };

  const handleCategorySave = () => {
    setEditingCategory(undefined);
    setCategorySubTab('list');
    fetchAllCategories();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="text-sm text-gray-500">
              {user?.first_name} {user?.last_name}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <nav className="lg:w-56 flex-shrink-0">
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchTabData(activeTab)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && data && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatCard
                        icon={Users}
                        label="Total Users"
                        value={data.users?.total || 0}
                        sub={`${data.users?.active || 0} active`}
                        color="blue"
                      />
                      <StatCard
                        icon={Package}
                        label="Total Products"
                        value={data.products?.total || 0}
                        sub={`${data.products?.active || 0} active`}
                        color="primary"
                      />
                      <StatCard
                        icon={DollarSign}
                        label="Est. Revenue"
                        value={`$${(data.revenue?.estimated_total_revenue || 0).toLocaleString()}`}
                        sub={`$${(data.revenue?.estimated_discounted_revenue || 0).toLocaleString()} after discounts`}
                        color="green"
                      />
                      <StatCard
                        icon={Star}
                        label="Avg Rating"
                        value={data.reviews?.average_rating || 0}
                        sub={`${data.reviews?.total || 0} total reviews`}
                        color="yellow"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">New users this month</span>
                            <span className="font-medium">{data.users?.new_this_month || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Products low on stock</span>
                            <span className="font-medium text-yellow-600">{data.products?.low_stock || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Out of stock</span>
                            <span className="font-medium text-red-600">{data.products?.out_of_stock || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Total items sold</span>
                            <span className="font-medium">{data.products?.total_sold || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Inventory value</span>
                            <span className="font-medium">${(data.products?.total_inventory_value || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h3 className="font-semibold text-gray-900 mb-3">Account Health</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Active accounts</span>
                            <span className="font-medium text-green-600">{data.users?.active || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Inactive accounts</span>
                            <span className="font-medium">{data.users?.inactive || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Verified emails</span>
                            <span className="font-medium">{data.users?.verified || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Unverified emails</span>
                            <span className="font-medium text-yellow-600">{data.users?.unverified || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Admin accounts</span>
                            <span className="font-medium">{data.users?.admins || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'users' && data && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatCard icon={Users} label="Total" value={data.stats?.total || 0} color="blue" />
                      <StatCard icon={Users} label="Active" value={data.stats?.active || 0} color="green" />
                      <StatCard icon={UserPlus} label="New This Month" value={data.stats?.new_this_month || 0} color="primary" />
                      <StatCard icon={TrendingUp} label="New This Week" value={data.stats?.new_this_week || 0} color="yellow" />
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                      <h3 className="font-semibold text-gray-900 mb-4">Monthly Registrations</h3>
                      <SimpleBarChart data={data.monthly_registrations || []} />
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                      <h3 className="font-semibold text-gray-900 mb-4">Recent Users</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left py-2 text-gray-500 font-medium">Name</th>
                              <th className="text-left py-2 text-gray-500 font-medium">Email</th>
                              <th className="text-left py-2 text-gray-500 font-medium">Role</th>
                              <th className="text-left py-2 text-gray-500 font-medium">Status</th>
                              <th className="text-left py-2 text-gray-500 font-medium">Joined</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(data.recent_users || []).map((u) => (
                              <tr key={u.id} className="border-b border-gray-50">
                                <td className="py-2.5 font-medium text-gray-900">
                                  {u.first_name} {u.last_name}
                                </td>
                                <td className="py-2.5 text-gray-600">{u.email}</td>
                                <td className="py-2.5">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="py-2.5">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    u.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                  }`}>
                                    {u.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="py-2.5 text-gray-500">
                                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'products' && data && (
                  <div className="space-y-4">
                    <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
                      {productSubTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setProductSubTab(tab.id);
                            if (tab.id !== 'create') setEditingProduct(undefined);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                            productSubTab === tab.id
                              ? 'bg-primary-50 text-primary-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {productSubTab === 'stats' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <StatCard icon={Package} label="Total" value={data.stats?.total || 0} color="primary" />
                          <StatCard icon={Package} label="Active" value={data.stats?.active || 0} color="green" />
                          <StatCard icon={AlertTriangle} label="Low Stock" value={data.stats?.low_stock || 0} color="yellow" />
                          <StatCard icon={AlertTriangle} label="Out of Stock" value={data.stats?.out_of_stock || 0} color="red" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <h3 className="font-semibold text-gray-900 mb-3">Inventory</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total inventory value</span>
                                <span className="font-medium">${(data.stats?.total_inventory_value || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total items sold</span>
                                <span className="font-medium">{data.stats?.total_sold || 0}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Average price</span>
                                <span className="font-medium">${(data.stats?.average_price || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Featured products</span>
                                <span className="font-medium">{data.stats?.featured || 0}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <h3 className="font-semibold text-gray-900 mb-3">Stock Alerts</h3>
                            <div className="space-y-2">
                              {data.stats?.low_stock > 0 && (
                                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                  <span className="text-sm text-yellow-700">
                                    {data.stats.low_stock} products low on stock
                                  </span>
                                </div>
                              )}
                              {data.stats?.out_of_stock > 0 && (
                                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                  <span className="text-sm text-red-700">
                                    {data.stats.out_of_stock} products out of stock
                                  </span>
                                </div>
                              )}
                              {data.stats?.low_stock === 0 && data.stats?.out_of_stock === 0 && (
                                <p className="text-sm text-gray-500 py-2">All products well stocked</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 p-5">
                          <h3 className="font-semibold text-gray-900 mb-4">Top Products by Sales</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-100">
                                  <th className="text-left py-2 text-gray-500 font-medium">Product</th>
                                  <th className="text-right py-2 text-gray-500 font-medium">Price</th>
                                  <th className="text-right py-2 text-gray-500 font-medium">Sold</th>
                                  <th className="text-right py-2 text-gray-500 font-medium">Stock</th>
                                  <th className="text-right py-2 text-gray-500 font-medium">Rating</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(data.top_products || []).map((p) => (
                                  <tr key={p.id} className="border-b border-gray-50">
                                    <td className="py-2.5 font-medium text-gray-900 truncate max-w-[200px]">
                                      {p.name}
                                    </td>
                                    <td className="py-2.5 text-right">
                                      <span className={p.discount_price ? 'text-red-600' : 'text-gray-900'}>
                                        ${p.discount_price || p.price}
                                      </span>
                                    </td>
                                    <td className="py-2.5 text-right font-medium">{p.sold_count}</td>
                                    <td className="py-2.5 text-right">
                                      <span className={p.stock_quantity === 0 ? 'text-red-600' : ''}>
                                        {p.stock_quantity}
                                      </span>
                                    </td>
                                    <td className="py-2.5 text-right">
                                      <span className="flex items-center justify-end gap-1">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        {p.rating}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {productSubTab === 'list' && (
                      <AdminProductList onEdit={handleEditProduct} onRefresh={() => fetchTabData('products')} />
                    )}

                    {productSubTab === 'create' && (
                      <AdminProductForm
                        product={editingProduct === undefined ? null : editingProduct}
                        onSave={handleProductSave}
                        onCancel={() => { setEditingProduct(undefined); setProductSubTab('list'); }}
                      />
                    )}

                    {productSubTab === 'inventory' && (
                      <AdminProductInventory />
                    )}

                    {productSubTab === 'import-export' && (
                      <AdminProductImportExport />
                    )}
                  </div>
                )}

                {activeTab === 'categories' && (
                  <div className="space-y-4">
                    <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
                      {categorySubTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setCategorySubTab(tab.id);
                            if (tab.id !== 'create') setEditingCategory(undefined);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                            categorySubTab === tab.id
                              ? 'bg-primary-50 text-primary-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {categorySubTab === 'list' && (
                      <AdminCategoryList onEdit={handleEditCategory} onRefresh={fetchAllCategories} />
                    )}

                    {categorySubTab === 'create' && (
                      <AdminCategoryForm
                        category={editingCategory === undefined ? null : editingCategory}
                        allCategories={allCategories}
                        onSave={handleCategorySave}
                        onCancel={() => { setEditingCategory(undefined); setCategorySubTab('list'); }}
                      />
                    )}
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    {orderSubTab === 'list' && (
                      <AdminOrderList
                        onView={handleViewOrder}
                        onRefresh={() => {}}
                      />
                    )}

                    {orderSubTab === 'detail' && viewingOrder && (
                      <AdminOrderDetail
                        order={viewingOrder}
                        onClose={() => { setViewingOrder(null); setOrderSubTab('list'); }}
                        onRefresh={() => {}}
                      />
                    )}
                  </div>
                )}

                {activeTab === 'sales' && data && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4">Sales by Category</h3>
                        {(data.by_category || []).length === 0 ? (
                          <p className="text-sm text-gray-500">No sales data</p>
                        ) : (
                          <div className="space-y-3">
                            {(data.by_category || []).slice(0, 8).map((item, i) => {
                              const maxSold = Math.max(...data.by_category.map((c) => c.sold), 1);
                              return (
                                <div key={i}>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700">{item.category}</span>
                                    <span className="font-medium">{item.sold} sold</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                      className="bg-primary-500 rounded-full h-2"
                                      style={{ width: `${(item.sold / maxSold) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4">Sales by Brand</h3>
                        {(data.by_brand || []).length === 0 ? (
                          <p className="text-sm text-gray-500">No sales data</p>
                        ) : (
                          <div className="space-y-3">
                            {(data.by_brand || []).slice(0, 8).map((item, i) => {
                              const maxSold = Math.max(...data.by_brand.map((b) => b.sold), 1);
                              return (
                                <div key={i}>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700">{item.brand}</span>
                                    <span className="font-medium">{item.sold} sold</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                      className="bg-blue-500 rounded-full h-2"
                                      style={{ width: `${(item.sold / maxSold) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                      <h3 className="font-semibold text-gray-900 mb-4">Top Products</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left py-2 text-gray-500 font-medium">#</th>
                              <th className="text-left py-2 text-gray-500 font-medium">Product</th>
                              <th className="text-right py-2 text-gray-500 font-medium">Price</th>
                              <th className="text-right py-2 text-gray-500 font-medium">Sold</th>
                              <th className="text-right py-2 text-gray-500 font-medium">Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(data.top_products || []).map((p, i) => (
                              <tr key={p.id} className="border-b border-gray-50">
                                <td className="py-2.5 text-gray-500">{i + 1}</td>
                                <td className="py-2.5 font-medium text-gray-900 truncate max-w-[200px]">
                                  {p.name}
                                </td>
                                <td className="py-2.5 text-right">${p.discount_price || p.price}</td>
                                <td className="py-2.5 text-right font-medium">{p.sold_count}</td>
                                <td className="py-2.5 text-right font-medium text-green-600">
                                  ${((p.discount_price || p.price) * p.sold_count)?.toLocaleString() ?? '0'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'revenue' && data && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <StatCard
                        icon={DollarSign}
                        label="Est. Total Revenue"
                        value={`$${(data.summary?.estimated_total_revenue || 0).toLocaleString()}`}
                        color="green"
                      />
                      <StatCard
                        icon={DollarSign}
                        label="After Discounts"
                        value={`$${(data.summary?.estimated_discounted_revenue || 0).toLocaleString()}`}
                        color="primary"
                      />
                      <StatCard
                        icon={TrendingUp}
                        label="Savings Given"
                        value={`$${(data.summary?.estimated_savings_given || 0).toLocaleString()}`}
                        color="yellow"
                      />
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                      <h3 className="font-semibold text-gray-900 mb-4">Monthly Revenue (Estimated)</h3>
                      {(data.monthly || []).length === 0 ? (
                        <p className="text-sm text-gray-500">No revenue data</p>
                      ) : (
                        <SimpleBarChart
                          data={(data.monthly || []).map((m) => ({ month: m.month, count: m.revenue }))}
                        />
                      )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                      <h3 className="font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left py-2 text-gray-500 font-medium">Month</th>
                              <th className="text-right py-2 text-gray-500 font-medium">Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(data.monthly || []).map((m, i) => (
                              <tr key={i} className="border-b border-gray-50">
                                <td className="py-2.5 text-gray-900">{m.month}</td>
                                <td className="py-2.5 text-right font-medium">
                                  ${m.revenue?.toLocaleString() ?? '0'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'promotions' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link
                        to="/admin/coupons"
                        className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow flex items-center gap-4"
                      >
                        <div className="p-3 bg-primary-50 rounded-lg">
                          <Tag className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Coupon Management</h3>
                          <p className="text-sm text-gray-500">Create and manage discount coupons</p>
                        </div>
                      </Link>
                      <Link
                        to="/admin/flash-sales"
                        className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow flex items-center gap-4"
                      >
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <Zap className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Flash Sales</h3>
                          <p className="text-sm text-gray-500">Create and manage time-limited flash sales</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {notificationSubTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setNotificationSubTab(tab.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                            notificationSubTab === tab.id
                              ? 'bg-primary-50 text-primary-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {notificationSubTab === 'stats' && <AdminNotificationStats />}
                    {notificationSubTab === 'list' && <AdminNotificationList />}
                    {notificationSubTab === 'templates' && (
                      <AdminTemplateList
                        onEdit={(template) => {
                          setEditingTemplate(template);
                          setNotificationSubTab('edit-template');
                        }}
                        onCreate={() => {
                          setEditingTemplate(null);
                          setNotificationSubTab('edit-template');
                        }}
                      />
                    )}
                    {notificationSubTab === 'edit-template' && (
                      <AdminTemplateForm
                        template={editingTemplate}
                        onSave={() => setNotificationSubTab('templates')}
                        onCancel={() => setNotificationSubTab('templates')}
                      />
                    )}
                    {notificationSubTab === 'send' && <AdminNotificationForm />}
                    {notificationSubTab === 'broadcast' && <AdminNotificationBroadcast />}
                  </div>
                )}

                {activeTab === 'support' && (
                  <div className="space-y-6">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {supportSubTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setSupportSubTab(tab.id);
                            if (tab.id === 'faq') setEditingFAQ(undefined);
                            if (tab.id === 'help') setEditingHelpArticle(undefined);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                            supportSubTab === tab.id
                              ? 'bg-primary-50 text-primary-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {supportSubTab === 'messages' && <AdminContactMessageList />}
                    {supportSubTab === 'faq' && !editingFAQ && (
                      <AdminFAQList
                        onEdit={(faq) => setEditingFAQ(faq)}
                        onCreate={() => setEditingFAQ(null)}
                      />
                    )}
                    {supportSubTab === 'faq' && editingFAQ !== undefined && (
                      <AdminFAQForm
                        faq={editingFAQ}
                        onSave={() => { setEditingFAQ(undefined); }}
                        onCancel={() => setEditingFAQ(undefined)}
                      />
                    )}
                    {supportSubTab === 'help' && !editingHelpArticle && (
                      <AdminHelpArticleList
                        onEdit={(article) => setEditingHelpArticle(article)}
                        onCreate={() => setEditingHelpArticle(null)}
                      />
                    )}
                    {supportSubTab === 'help' && editingHelpArticle !== undefined && (
                      <AdminHelpArticleForm
                        article={editingHelpArticle}
                        onSave={() => { setEditingHelpArticle(undefined); }}
                        onCancel={() => setEditingHelpArticle(undefined)}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
