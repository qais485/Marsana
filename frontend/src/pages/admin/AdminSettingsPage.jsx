import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Settings, Store, DollarSign, Globe, Clock,
  Receipt, Truck, CreditCard, Search, Mail, Shield, Database,
  Loader2, Save, RotateCcw, Zap, Menu, X
} from 'lucide-react';
import { adminSettingsService } from '../../services/api/adminSettingsService';

const CATEGORIES = [
  { id: 'store_information', label: 'Store Information', icon: Store },
  { id: 'currency', label: 'Currency', icon: DollarSign },
  { id: 'language', label: 'Language', icon: Globe },
  { id: 'timezone', label: 'Timezone', icon: Clock },
  { id: 'taxes', label: 'Taxes', icon: Receipt },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payment_gateways', label: 'Payment Gateways', icon: CreditCard },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'email_templates', label: 'Email Templates', icon: Mail },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'backup', label: 'Backup', icon: Database },
  { id: 'performance', label: 'Performance', icon: Zap },
];

export default function AdminSettingsPage() {
  const [activeCategory, setActiveCategory] = useState('store_information');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await adminSettingsService.getAllSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [activeCategory]: prev[activeCategory]?.map(s =>
        s.key === key ? { ...s, value } : s
      ) || [],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const categorySettings = settings[activeCategory] || [];
      const settingsToUpdate = categorySettings.map(s => ({
        key: s.key,
        value: s.value,
      }));
      await adminSettingsService.updateSettingsBulk(settingsToUpdate);
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInitialize = async () => {
    if (!window.confirm('Initialize default settings? This will add missing settings but won\'t overwrite existing ones.')) return;
    try {
      await adminSettingsService.initializeDefaultSettings();
      fetchSettings();
      setSuccess('Default settings initialized');
    } catch {
      setError('Failed to initialize settings');
    }
  };

  const renderSettingInput = (setting) => {
    const { key, value, description, status } = setting;

    const statusBadge = status && (activeCategory === 'security' || activeCategory === 'performance') && (
      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        status === 'existing' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
        status === 'partial' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
      }`}>
        {status === 'existing' ? 'Implemented' :
         status === 'partial' ? 'Partial' : 'Not Implemented'}
      </span>
    );

    if (typeof value === 'boolean') {
      return (
        <div key={key} className="flex items-center justify-between py-3 border-b border-surface-100 dark:border-surface-800">
          <div>
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300 capitalize">
              {key.replace(/_/g, ' ')}
              {statusBadge}
            </label>
            {description && (
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleSettingChange(key, !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-marsana-600' : 'bg-surface-200 dark:bg-surface-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      );
    }

    if (typeof value === 'number') {
      return (
        <div key={key} className="py-3 border-b border-surface-100 dark:border-surface-800">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 capitalize mb-1">
            {key.replace(/_/g, ' ')}
            {statusBadge}
          </label>
          {description && (
            <p className="text-xs text-surface-500 dark:text-surface-400 mb-2">{description}</p>
          )}
          <input
            type="number"
            value={value}
            onChange={(e) => handleSettingChange(key, parseFloat(e.target.value) || 0)}
            className="input-premium w-full px-3 py-2"
          />
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} className="py-3 border-b border-surface-100 dark:border-surface-800">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 capitalize mb-1">
            {key.replace(/_/g, ' ')}
            {statusBadge}
          </label>
          {description && (
            <p className="text-xs text-surface-500 dark:text-surface-400 mb-2">{description}</p>
          )}
          <textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                handleSettingChange(key, JSON.parse(e.target.value));
              } catch {}
            }}
            rows={6}
            className="input-premium w-full px-3 py-2 font-mono text-sm"
          />
        </div>
      );
    }

    return (
      <div key={key} className="py-3 border-b border-surface-100 dark:border-surface-800">
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 capitalize mb-1">
          {key.replace(/_/g, ' ')}
          {statusBadge}
        </label>
        {description && (
          <p className="text-xs text-surface-500 dark:text-surface-400 mb-2">{description}</p>
        )}
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleSettingChange(key, e.target.value)}
          className="input-premium w-full px-3 py-2"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-marsana-600 dark:text-marsana-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Link to="/admin" className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-300 self-start">
            <ArrowLeft className="w-5 h-5 text-surface-500 dark:text-surface-400" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">Store Settings</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Configure your store settings</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleInitialize}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-700 transition-all duration-300 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Initialize Defaults</span>
              <span className="sm:hidden">Init</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-marsana flex items-center justify-center gap-2 text-sm min-h-[44px]"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm">{success}</div>
        )}

        <div className="flex gap-6">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800 overflow-hidden">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-300 ${
                      activeCategory === cat.id
                        ? 'bg-marsana-50 dark:bg-marsana-900/30 text-marsana-700 dark:text-marsana-400 border-l-4 border-marsana-600'
                        : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {mobileSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileSidebarOpen(false)}>
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-surface-900 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
                  <span className="font-semibold text-surface-900 dark:text-white">Categories</span>
                  <button onClick={() => setMobileSidebarOpen(false)} className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setActiveCategory(cat.id); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-300 ${
                        activeCategory === cat.id
                          ? 'bg-marsana-50 dark:bg-marsana-900/30 text-marsana-700 dark:text-marsana-400 border-l-4 border-marsana-600'
                          : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex-1">
            <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">
                {CATEGORIES.find(c => c.id === activeCategory)?.label}
              </h2>
              <div className="space-y-1">
                {(settings[activeCategory] || []).map(renderSettingInput)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
