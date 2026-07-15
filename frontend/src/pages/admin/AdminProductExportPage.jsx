import { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminProductService } from '../../services/api/adminProductService';
import {
  ArrowLeft,
  Download,
  Loader2,
  CheckCircle,
} from 'lucide-react';

export default function AdminProductExportPage() {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [filterActive, setFilterActive] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (filterActive !== '') params.is_active = filterActive === 'true';
      if (filterCategory) params.category_id = filterCategory;

      const response = await adminProductService.exportProductsCsv(params);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch {
      // Export failed silently
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link to="/admin/products" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Export Products</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h2>
          <p className="text-sm text-gray-500 mb-6">
            Export your product catalog as a CSV file. Apply filters below to export a subset of products.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All Products</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
              <input
                type="text"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                placeholder="Leave empty for all"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : exported ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting ? 'Exporting...' : exported ? 'Downloaded!' : 'Export CSV'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
