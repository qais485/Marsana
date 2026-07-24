import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  AlertTriangle,
  X,
  Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { adminProductService } from '../../services/api/adminProductService';

const REQUIRED_COLUMNS = ['name', 'price'];

export default function AdminProductImportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setErrors([]);
    setResult(null);

    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const lines = e.target.result.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
          setErrors(['File is empty or has no data rows']);
          return;
        }
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const missing = REQUIRED_COLUMNS.filter(c => !headers.includes(c));
        if (missing.length > 0) {
          setErrors([`Missing required columns: ${missing.join(', ')}`]);
          return;
        }
        const rows = lines.slice(1).map((line, idx) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row = {};
          headers.forEach((h, i) => { row[h] = values[i] || ''; });
          return { ...row, _rowNum: idx + 2 };
        });
        setPreview(rows);
      };
      reader.readAsText(selectedFile);
    } else if (ext === 'xlsx') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (data.length === 0) {
          setErrors(['File is empty or has no data rows']);
          return;
        }
        const headers = Object.keys(data[0]).map(h => h.toLowerCase().trim());
        const missing = REQUIRED_COLUMNS.filter(c => !headers.includes(c));
        if (missing.length > 0) {
          setErrors([`Missing required columns: ${missing.join(', ')}`]);
          return;
        }
        setPreview(data.map((row, idx) => ({ ...row, _rowNum: idx + 2 })));
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      setErrors(['Unsupported file format. Use CSV or XLSX.']);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    setImporting(true);
    setErrors([]);
    try {
      const products = preview.map(({ _rowNum, ...rest }) => ({
        name: rest.name,
        description: rest.description || undefined,
        short_description: rest.short_description || undefined,
        price: parseFloat(rest.price) || 0,
        discount_price: rest.discount_price !== '' && rest.discount_price !== undefined ? parseFloat(rest.discount_price) : undefined,
        sku: rest.sku || undefined,
        barcode: rest.barcode || undefined,
        stock_quantity: rest.stock_quantity !== undefined ? parseInt(rest.stock_quantity) || 0 : undefined,
        category_name: rest.category || undefined,
        brand_name: rest.brand || undefined,
        is_active: rest.is_active !== undefined ? rest.is_active !== 'false' && rest.is_active !== '0' : undefined,
      }));

      const response = await adminProductService.importProducts({ products });
      if (response.success) {
        setResult(response.data);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setErrors(detail);
      } else {
        setErrors([detail || 'Import failed']);
      }
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ['name', 'price', 'description', 'short_description', 'sku', 'barcode', 'stock_quantity', 'category', 'brand', 'is_active', 'is_featured', 'discount_price'];
    const csv = headers.join(',') + '\n' + 'Example Product,29.99,A great product,Short desc,SKU-001,123456789,100,Electronics,Brand A,true,false,';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
        <header className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex items-center gap-4 h-14 sm:h-16">
              <Link to="/admin/products" className="text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-all duration-300">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-white">Import Results</h1>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 sm:p-5 shadow-sm text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Import Complete</h2>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-surface-900 dark:text-white">{result.total_products}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400">Total</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{result.successful_imports}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400">Imported</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{result.failed_imports}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400">Failed</p>
              </div>
            </div>
            {result.errors?.length > 0 && (
              <div className="mt-6 text-left max-w-md mx-auto">
                <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Errors:</p>
                {result.errors.map((err, i) => (
                  <p key={i} className="text-sm text-red-600 dark:text-red-400">{err}</p>
                ))}
              </div>
            )}
            <button onClick={() => navigate('/admin/products')} className="btn-marsana mt-8">
              Back to Products
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <header className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center gap-4 h-14 sm:h-16">
            <Link to="/admin/products" className="text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-all duration-300">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-white">Import Products</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 sm:p-5 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-surface-900 dark:text-white">Upload File</h2>
            <button onClick={downloadTemplate} className="btn-outline text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Download Template</span>
              <span className="sm:hidden">Template</span>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 mb-4">
            Supported formats: CSV and Excel (.xlsx). Required columns: <strong>name</strong>, <strong>price</strong>.
          </p>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 ${
              dragActive ? 'border-marsana-500 bg-marsana-50 dark:bg-marsana-900/20' : 'border-surface-300 dark:border-surface-600 hover:border-surface-400 dark:hover:border-surface-500'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => handleFile(e.target.files[0])}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-marsana-600 dark:text-marsana-400" />
                <div>
                  <p className="font-medium text-surface-900 dark:text-white">{file.name}</p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">{preview.length} rows found</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview([]); }} className="text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300">
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
                <p className="text-surface-600 dark:text-surface-400">Drop a file here or click to browse</p>
                <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">CSV or XLSX</p>
              </div>
            )}
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-red-200 dark:border-red-800 p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <h3 className="font-medium text-red-700 dark:text-red-400">Import Errors</h3>
            </div>
            {errors.map((err, i) => (
              <p key={i} className="text-sm text-red-600 dark:text-red-400">{err}</p>
            ))}
          </div>
        )}

        {preview.length > 0 && (
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Preview ({preview.length} rows)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-surface-50 dark:bg-surface-800">
                  <tr>
                    {Object.keys(preview[0]).filter(k => !k.startsWith('_')).slice(0, 6).map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                  {preview.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-300">
                      {Object.keys(row).filter(k => !k.startsWith('_')).slice(0, 6).map((h) => (
                        <td key={h} className="px-3 py-2 text-surface-700 dark:text-surface-300">{row[h]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 10 && (
                <p className="text-sm text-surface-500 dark:text-surface-400 text-center py-2">...and {preview.length - 10} more rows</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <button
                onClick={handleImport}
                disabled={importing}
                className="btn-marsana flex items-center justify-center gap-2 text-sm min-h-[44px]"
              >
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Import {preview.length} Products
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
