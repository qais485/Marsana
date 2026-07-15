import { useState, useRef } from 'react';
import { adminProductService } from '../../services/api/adminProductService';
import {
  Loader2,
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';

const REQUIRED_COLUMNS = ['name', 'price'];

export default function AdminProductImportExport() {
  const fileInputRef = useRef(null);
  const [activeSection, setActiveSection] = useState('import');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [filterActive, setFilterActive] = useState('');

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setErrors([]);
    setImportResult(null);

    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const lines = e.target.result.split('\n').filter((l) => l.trim());
        // NOTE: This is a naive CSV parser. For production use, consider a proper
        // CSV parsing library (e.g., PapaParse) to handle quoted fields, escaped
        // commas, and edge cases correctly.
        if (lines.length < 2) {
          setErrors(['File is empty or has no data rows']);
          return;
        }
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
        const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
        if (missing.length > 0) {
          setErrors([`Missing required columns: ${missing.join(', ')}`]);
          return;
        }
        const rows = lines.slice(1).map((line, idx) => {
          const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
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
        const headers = Object.keys(data[0]).map((h) => h.toLowerCase().trim());
        const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
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
        category: rest.category || undefined,
        brand: rest.brand || undefined,
        is_active: rest.is_active !== undefined ? rest.is_active !== 'false' && rest.is_active !== '0' : undefined,
        is_featured: rest.is_featured !== undefined ? rest.is_featured === 'true' || rest.is_featured === '1' : undefined,
      }));

      const response = await adminProductService.importProducts({ products });
      if (response.success) {
        setImportResult(response.data);
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

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (filterActive !== '') params.is_active = filterActive === 'true';
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
      setErrors(['Export failed']);
    } finally {
      setExporting(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    setImportResult(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveSection('import')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'import'
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Upload className="h-4 w-4" />
          Import
        </button>
        <button
          onClick={() => setActiveSection('export')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'export'
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="font-medium text-red-700 text-sm">Errors</span>
          </div>
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-red-600">{err}</p>
          ))}
        </div>
      )}

      {activeSection === 'import' ? (
        <div className="space-y-4">
          {importResult ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Import Complete</h4>
              <div className="flex justify-center gap-6 mb-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{importResult.total_products}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{importResult.successful_imports}</p>
                  <p className="text-sm text-gray-500">Imported</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{importResult.failed_imports}</p>
                  <p className="text-sm text-gray-500">Failed</p>
                </div>
              </div>
              <button onClick={resetImport} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
                Import More
              </button>
            </div>
          ) : (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
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
                    <FileText className="h-8 w-8 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{preview.length} rows</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); resetImport(); }} className="text-gray-400 hover:text-gray-600">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">Drop CSV/XLSX file or click to browse</p>
                  </>
                )}
              </div>

              {preview.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Preview ({preview.length} rows)</h4>
                  <div className="overflow-x-auto max-h-48">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          {Object.keys(preview[0]).filter((k) => !k.startsWith('_')).slice(0, 5).map((h) => (
                            <th key={h} className="px-2 py-1 text-left text-gray-500 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {preview.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            {Object.keys(row).filter((k) => !k.startsWith('_')).slice(0, 5).map((h) => (
                              <td key={h} className="px-2 py-1 text-gray-700">{row[h]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleImport}
                      disabled={importing}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50"
                    >
                      {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Import {preview.length} Products
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h4 className="font-medium text-gray-900 mb-3">Export Products as CSV</h4>
          <p className="text-sm text-gray-500 mb-4">Download your product catalog. Apply filters to export a subset.</p>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-gray-700">Status:</label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Products</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50"
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
      )}
    </div>
  );
}
