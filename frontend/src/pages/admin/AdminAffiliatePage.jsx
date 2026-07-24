import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, Plus, Check, X, DollarSign, BarChart3 } from 'lucide-react';
import marketingService from '../../services/api/marketingService';

export default function AdminAffiliatePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [programForm, setProgramForm] = useState({ name: '', description: '', commission_type: 'percentage', commission_value: '', cookie_duration_days: 30, minimum_payout: 50 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, programsRes, affiliatesRes] = await Promise.all([
        marketingService.getAffiliateSummary(),
        marketingService.getAffiliatePrograms(),
        marketingService.getAffiliates(page, 20, statusFilter || undefined),
      ]);
      if (summaryRes.success) setSummary(summaryRes.data);
      if (programsRes.success) setPrograms(programsRes.data);
      if (affiliatesRes.success) {
        setAffiliates(affiliatesRes.data);
        setPagination(affiliatesRes.pagination);
      }
    } catch {
      setError('Failed to load affiliate data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, statusFilter]);

  const handleCreateProgram = async () => {
    try {
      await marketingService.createAffiliateProgram({ ...programForm, commission_value: parseFloat(programForm.commission_value) });
      setShowProgramForm(false);
      setProgramForm({ name: '', description: '', commission_type: 'percentage', commission_value: '', cookie_duration_days: 30, minimum_payout: 50 });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create program');
    }
  };

  const handleApprove = async (id) => {
    try {
      await marketingService.approveAffiliate(id);
      fetchData();
    } catch {
      setError('Failed to approve affiliate');
    }
  };

  const handleReject = async (id) => {
    try {
      await marketingService.rejectAffiliate(id);
      fetchData();
    } catch {
      setError('Failed to reject affiliate');
    }
  };

  const getStatusBadge = (status) => {
    const badges = { pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', suspended: 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300' };
    return badges[status] || 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300';
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Link to="/admin/marketing" className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-300 self-start"><ArrowLeft className="w-5 h-5 text-surface-500 dark:text-surface-400" /></Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">Affiliate System</h1>
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">Manage affiliate programs and partners</p>
          </div>
        </div>

        {error && <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">{error}</div>}

        <div className="flex gap-3 sm:gap-4 mb-6 overflow-x-auto border-b border-surface-200 dark:border-surface-800">
          <button onClick={() => setActiveTab('overview')} className={`pb-2 px-4 font-medium transition-all duration-300 ${activeTab === 'overview' ? 'border-b-2 border-marsana-500 text-marsana-600 dark:text-marsana-400' : 'text-surface-600 dark:text-surface-400'}`}>Overview</button>
          <button onClick={() => setActiveTab('programs')} className={`pb-2 px-4 font-medium transition-all duration-300 ${activeTab === 'programs' ? 'border-b-2 border-marsana-500 text-marsana-600 dark:text-marsana-400' : 'text-surface-600 dark:text-surface-400'}`}>Programs</button>
          <button onClick={() => setActiveTab('affiliates')} className={`pb-2 px-4 font-medium transition-all duration-300 ${activeTab === 'affiliates' ? 'border-b-2 border-marsana-500 text-marsana-600 dark:text-marsana-400' : 'text-surface-600 dark:text-surface-400'}`}>Affiliates</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-marsana-600 dark:text-marsana-400" /></div>
        ) : (
          <>
            {activeTab === 'overview' && summary && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-4">
                  <p className="text-sm text-surface-600 dark:text-surface-400">Total Affiliates</p>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{summary.total_affiliates}</p>
                </div>
                <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-4">
                  <p className="text-sm text-surface-600 dark:text-surface-400">Active Affiliates</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.active_affiliates}</p>
                </div>
                <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-4">
                  <p className="text-sm text-surface-600 dark:text-surface-400">Total Earnings</p>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">${summary.total_earnings.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-4">
                  <p className="text-sm text-surface-600 dark:text-surface-400">Conversion Rate</p>
                  <p className="text-2xl font-bold text-marsana-600 dark:text-marsana-400">{summary.conversion_rate}%</p>
                </div>
              </div>
            )}

            {activeTab === 'programs' && (
              <>
                <div className="flex justify-end mb-4">
                  <button onClick={() => setShowProgramForm(true)} className="btn-marsana flex items-center justify-center gap-2 min-h-[44px]">
                    <Plus className="w-4 h-4" /> New Program
                  </button>
                </div>
                <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-surface-50 dark:bg-surface-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Commission</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Cookie Days</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Min Payout</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                      {programs.map((program) => (
                        <tr key={program.id} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-300">
                          <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{program.name}</td>
                          <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{program.commission_value}% ({program.commission_type})</td>
                          <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{program.cookie_duration_days}</td>
                          <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">${program.minimum_payout}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${program.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300'}`}>
                              {program.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {programs.length === 0 && (
                    <div className="text-center py-12">
                      <BarChart3 className="w-12 h-12 text-surface-400 dark:text-surface-500 mx-auto mb-4" />
                      <p className="text-surface-600 dark:text-surface-400">No affiliate programs yet</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'affiliates' && (
              <>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-premium px-3 py-2 text-sm min-h-[44px]">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-surface-50 dark:bg-surface-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Earnings</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Pending</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Referrals</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                      {affiliates.map((affiliate) => (
                        <tr key={affiliate.id} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-300">
                          <td className="px-6 py-4">
                            <div className="font-medium text-surface-900 dark:text-white">{affiliate.user_name || 'N/A'}</div>
                            <div className="text-sm text-surface-500 dark:text-surface-400">{affiliate.user_email}</div>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-surface-600 dark:text-surface-400">{affiliate.affiliate_code}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(affiliate.status)}`}>{affiliate.status}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">${affiliate.total_earnings.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-yellow-600 dark:text-yellow-400">${affiliate.pending_balance.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{affiliate.total_referrals}</td>
                          <td className="px-6 py-4">
                            {affiliate.status === 'pending' && (
                              <div className="flex gap-2">
                                <button onClick={() => handleApprove(affiliate.id)} className="p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400 transition-all duration-300"><Check className="w-4 h-4" /></button>
                                <button onClick={() => handleReject(affiliate.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 transition-all duration-300"><X className="w-4 h-4" /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {affiliates.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-surface-400 dark:text-surface-500 mx-auto mb-4" />
                      <p className="text-surface-600 dark:text-surface-400">No affiliates found</p>
                    </div>
                  )}
                  {pagination && pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-surface-200 dark:border-surface-800 flex justify-between items-center">
                      <span className="text-sm text-surface-600 dark:text-surface-400">Page {pagination.page} of {pagination.pages}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border border-surface-200 dark:border-surface-800 rounded-xl disabled:opacity-50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-300">Previous</button>
                        <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-3 py-1 border border-surface-200 dark:border-surface-800 rounded-xl disabled:opacity-50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-300">Next</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {showProgramForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-xl p-6 w-full max-w-lg border border-surface-200 dark:border-surface-800">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">New Affiliate Program</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Program Name</label>
                  <input type="text" value={programForm.name} onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })} className="input-premium w-full px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Description</label>
                  <textarea value={programForm.description} onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })} rows={2} className="input-premium w-full px-3 py-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Commission Type</label>
                    <select value={programForm.commission_type} onChange={(e) => setProgramForm({ ...programForm, commission_type: e.target.value })} className="input-premium w-full px-3 py-2">
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Commission Value</label>
                    <input type="number" value={programForm.commission_value} onChange={(e) => setProgramForm({ ...programForm, commission_value: e.target.value })} className="input-premium w-full px-3 py-2" step="0.01" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Cookie Duration (days)</label>
                    <input type="number" value={programForm.cookie_duration_days} onChange={(e) => setProgramForm({ ...programForm, cookie_duration_days: parseInt(e.target.value) })} className="input-premium w-full px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Minimum Payout ($)</label>
                    <input type="number" value={programForm.minimum_payout} onChange={(e) => setProgramForm({ ...programForm, minimum_payout: parseFloat(e.target.value) })} className="input-premium w-full px-3 py-2" step="0.01" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={handleCreateProgram} className="btn-marsana px-4 py-2">Create</button>
                <button onClick={() => setShowProgramForm(false)} className="btn-outline px-4 py-2">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
