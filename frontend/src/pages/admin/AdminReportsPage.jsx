import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Loader2,
  TrendingUp,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import { reportService } from '../../services/api/reportService';

const REPORT_TABS = [
  { id: 'sales', label: 'Sales Reports', icon: ShoppingCart },
  { id: 'products', label: 'Product Reports', icon: Package },
  { id: 'customers', label: 'Customer Reports', icon: Users },
  { id: 'inventory', label: 'Inventory Reports', icon: BarChart3 },
  { id: 'financial', label: 'Financial Reports', icon: DollarSign },
];

function StatCard({ label, value, icon: Icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-surface-600 dark:text-surface-400">{label}</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function DataTable({ columns, data, emptyMessage = 'No data available' }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-surface-500 dark:text-surface-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-surface-50 dark:bg-surface-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-300">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-surface-900 dark:text-white">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SalesReport({ data }) {
  if (!data) return null;

  const statusColors = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    processing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Orders" value={data.total_orders} icon={ShoppingCart} />
        <StatCard label="Total Revenue" value={`$${data.total_revenue.toLocaleString()}`} icon={DollarSign} color="green" />
        <StatCard label="Avg Order Value" value={`$${data.average_order_value.toFixed(2)}`} icon={TrendingUp} color="purple" />
        <StatCard label="Items Sold" value={data.total_items_sold} icon={Package} color="blue" />
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Orders by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(data.orders_by_status).map(([status, count]) => (
            <div key={status} className="text-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300'}`}>
                {status}
              </span>
              <p className="mt-1 text-xl font-bold text-surface-900 dark:text-white">{count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Revenue by Day</h3>
        <DataTable
          columns={[
            { key: 'date', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString() : '-' },
            { key: 'orders', label: 'Orders' },
            { key: 'revenue', label: 'Revenue', render: (val) => `$${val.toLocaleString()}` },
          ]}
          data={data.revenue_by_period}
          emptyMessage="No revenue data for this period"
        />
      </div>
    </div>
  );
}

function ProductReport({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Products" value={data.total_products} icon={Package} />
        <StatCard label="Active Products" value={data.active_products} icon={CheckCircle} color="green" />
        <StatCard label="Avg Price" value={`$${data.average_price.toFixed(2)}`} icon={DollarSign} color="purple" />
        <StatCard label="Avg Rating" value={data.average_rating.toFixed(1)} icon={Star} color="yellow" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Top Selling Products</h3>
          <DataTable
            columns={[
              { key: 'name', label: 'Product' },
              { key: 'total_sold', label: 'Units Sold' },
            ]}
            data={data.top_selling}
            emptyMessage="No sales data"
          />
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Category Distribution</h3>
          <DataTable
            columns={[
              { key: 'name', label: 'Category' },
              { key: 'count', label: 'Products' },
            ]}
            data={data.category_distribution}
            emptyMessage="No category data"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Revenue by Product</h3>
        <DataTable
          columns={[
            { key: 'name', label: 'Product' },
            { key: 'revenue', label: 'Revenue', render: (val) => `$${val.toLocaleString()}` },
          ]}
          data={data.revenue_by_product}
          emptyMessage="No revenue data"
        />
      </div>
    </div>
  );
}

function CustomerReport({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Customers" value={data.total_customers} icon={Users} />
        <StatCard label="Active Customers" value={data.active_customers} icon={CheckCircle} color="green" />
        <StatCard label="Avg Lifetime Value" value={`$${data.average_lifetime_value.toFixed(2)}`} icon={DollarSign} color="purple" />
        <StatCard label="New Customers" value={data.new_customers} icon={TrendingUp} color="blue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Top Customers</h3>
          <DataTable
            columns={[
              { key: 'name', label: 'Customer' },
              { key: 'email', label: 'Email' },
              { key: 'order_count', label: 'Orders' },
              { key: 'total_spent', label: 'Total Spent', render: (val) => `$${val.toLocaleString()}` },
            ]}
            data={data.top_customers}
            emptyMessage="No customer data"
          />
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Registration Trend</h3>
          <DataTable
            columns={[
              { key: 'date', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString() : '-' },
              { key: 'count', label: 'New Customers' },
            ]}
            data={data.registration_trend}
            emptyMessage="No registration data"
          />
        </div>
      </div>
    </div>
  );
}

function InventoryReport({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Items" value={data.total_items} icon={Package} />
        <StatCard label="Total Value" value={`$${data.total_value.toLocaleString()}`} icon={DollarSign} color="green" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Low Stock Items</h3>
          <DataTable
            columns={[
              { key: 'name', label: 'Product' },
              { key: 'stock_quantity', label: 'Stock', render: (val) => <span className={val <= 5 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-yellow-600 dark:text-yellow-400 font-semibold'}>{val}</span> },
              { key: 'price', label: 'Price', render: (val) => `$${val}` },
            ]}
            data={data.low_stock_items}
            emptyMessage="No low stock items"
          />
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Out of Stock Items</h3>
          <DataTable
            columns={[
              { key: 'name', label: 'Product' },
              { key: 'price', label: 'Price', render: (val) => `$${val}` },
            ]}
            data={data.out_of_stock_items}
            emptyMessage="No out of stock items"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Stock by Category</h3>
        <DataTable
          columns={[
            { key: 'name', label: 'Category' },
            { key: 'total_stock', label: 'Total Stock' },
            { key: 'total_value', label: 'Value', render: (val) => `$${val.toLocaleString()}` },
          ]}
          data={data.stock_by_category}
          emptyMessage="No category data"
        />
      </div>
    </div>
  );
}

function FinancialReport({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Revenue" value={`$${data.total_revenue.toLocaleString()}`} icon={DollarSign} color="green" />
        <StatCard label="Total Costs" value={`$${data.total_costs.toLocaleString()}`} icon={TrendingDown} color="yellow" />
        <StatCard label="Gross Profit" value={`$${data.gross_profit.toLocaleString()}`} icon={TrendingUp} color="green" />
        <StatCard label="Profit Margin" value={`${data.profit_margin.toFixed(1)}%`} icon={BarChart3} color="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Revenue by Day</h3>
          <DataTable
            columns={[
              { key: 'date', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString() : '-' },
              { key: 'revenue', label: 'Revenue', render: (val) => `$${val.toLocaleString()}` },
            ]}
            data={data.revenue_by_period}
            emptyMessage="No revenue data"
          />
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Refund Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-surface-600 dark:text-surface-400">Total Refunds</span>
              <span className="font-semibold text-surface-900 dark:text-white">{data.refund_summary.total_refunds}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-600 dark:text-surface-400">Refund Amount</span>
              <span className="font-semibold text-red-600 dark:text-red-400">${data.refund_summary.refund_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({ start_date: '', end_date: '' });

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (dateRange.start_date) params.start_date = dateRange.start_date;
      if (dateRange.end_date) params.end_date = dateRange.end_date;

      let response;
      switch (activeTab) {
        case 'sales':
          response = await reportService.getSalesReport(params);
          break;
        case 'products':
          response = await reportService.getProductReport(params);
          break;
        case 'customers':
          response = await reportService.getCustomerReport(params);
          break;
        case 'inventory':
          response = await reportService.getInventoryReport(params);
          break;
        case 'financial':
          response = await reportService.getFinancialReport(params);
          break;
        default:
          response = await reportService.getSalesReport(params);
      }

      if (response.success) {
        setReportData(response.data);
      } else {
        setError(response.message || 'Failed to load report');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateRange]);

  useEffect(() => {
    fetchReport();
  }, [activeTab, dateRange, fetchReport]);

  const renderReport = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-marsana-600 dark:text-marsana-400" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
          {error}
        </div>
      );
    }

    switch (activeTab) {
      case 'sales':
        return <SalesReport data={reportData} />;
      case 'products':
        return <ProductReport data={reportData} />;
      case 'customers':
        return <CustomerReport data={reportData} />;
      case 'inventory':
        return <InventoryReport data={reportData} />;
      case 'financial':
        return <FinancialReport data={reportData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Link to="/admin" className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-300 self-start">
            <ArrowLeft className="w-5 h-5 text-surface-500 dark:text-surface-400" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">Reports</h1>
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">Analytics and insights for your business</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm mb-6">
          <div className="border-b border-surface-200 dark:border-surface-800">
            <nav className="flex overflow-x-auto">
              {REPORT_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'border-marsana-500 text-marsana-600 dark:text-marsana-400'
                        : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300 hover:border-surface-300 dark:hover:border-surface-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-b border-surface-200 dark:border-surface-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-surface-500 dark:text-surface-400" />
                <span className="text-sm text-surface-600 dark:text-surface-400">Date Range:</span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                  className="input-premium px-3 py-2 text-sm min-h-[44px]"
                />
                <span className="text-surface-500 dark:text-surface-400 hidden sm:inline">to</span>
                <span className="text-surface-500 dark:text-surface-400 sm:hidden">to</span>
                <input
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                  className="input-premium px-3 py-2 text-sm min-h-[44px]"
                />
              </div>
              <button
                onClick={() => setDateRange({ start_date: '', end_date: '' })}
                className="px-3 py-2 min-h-[44px] text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-all duration-300"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {renderReport()}
      </div>
    </div>
  );
}
