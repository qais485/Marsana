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
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <header className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center gap-4 h-14 sm:h-16">
            <Link to="/admin/products" className="text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-all duration-300">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-white">Export Products</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 sm:p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Export Options</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">
            Export your product catalog as a CSV file. Apply filters below to export a subset of products.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Status</label>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="input-premium w-full px-3 py-2 text-sm"
              >
                <option value="">All Products</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Category ID</label>
              <input
                type="text"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                placeholder="Leave empty for all"
                className="input-premium w-full px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="btn-marsana flex items-center justify-center gap-2 text-sm min-h-[44px]"
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
