import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminUserService } from '../../services/api/adminUserService';
import {
  Loader2,
  Search,
  Edit2,
  Trash2,
  Users,
  ArrowLeft,
  Filter,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldOff,
  UserCheck,
  UserX,
} from 'lucide-react';

export default function AdminUserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRole, setFilterRole] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [blockConfirm, setBlockConfirm] = useState(null);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page: currentPage, limit: 20 };
      if (search) params.search = search;
      if (filterRole) params.role = filterRole;
      if (filterActive !== '') params.is_active = filterActive === 'true';
      const response = await adminUserService.getUsers(params);
      if (response.success) {
        setUsers(response.data || []);
        setPagination(response.pagination || {});
      }
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, filterRole, filterActive, searchTrigger]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const totalPages = pagination.pages || 1;
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [pagination.pages]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchTrigger(t => t + 1);
  };

  const handleDelete = async (userId) => {
    try {
      await adminUserService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setPagination(prev => {
        const newTotal = (prev.total || 0) - 1;
        const newPages = Math.max(1, Math.ceil(newTotal / (prev.limit || 20)));
        return { ...prev, total: newTotal, pages: newPages };
      });
      setDeleteConfirm(null);
    } catch {
      setError('Failed to delete user');
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      const response = await adminUserService.toggleUserActive(userId);
      if (response.success) {
        setUsers(users.map(u =>
          u.id === userId ? { ...u, is_active: response.data.is_active } : u
        ));
        setBlockConfirm(null);
      }
    } catch {
      setError('Failed to update user status');
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <header className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link to="/admin" className="text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-all duration-300 flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-white truncate">User Management</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 sm:p-5 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 dark:text-surface-500" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-premium w-full pl-10 pr-4 py-2 text-sm"
                />
              </div>
              <button type="submit" className="btn-marsana text-sm min-h-[44px]">
                Search
              </button>
            </form>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-surface-500 dark:text-surface-400 flex-shrink-0" />
                <select
                  value={filterRole}
                  onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); setSearchTrigger(t => t + 1); }}
                  className="input-premium px-3 py-2 text-sm min-h-[44px] flex-1 sm:flex-none min-w-0"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <select
                value={filterActive}
                onChange={(e) => { setFilterActive(e.target.value); setCurrentPage(1); setSearchTrigger(t => t + 1); }}
                className="input-premium px-3 py-2 text-sm min-h-[44px] flex-1 sm:flex-none min-w-0"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-red-200 dark:border-red-800 p-4 mb-6 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-marsana-600 dark:text-marsana-400 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
              <p className="text-surface-500 dark:text-surface-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-800">
                <thead className="bg-surface-50 dark:bg-surface-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Verified</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-surface-900 divide-y divide-surface-200 dark:divide-surface-800">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-300">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-marsana-100 dark:bg-marsana-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-marsana-700 dark:text-marsana-400">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-surface-900 dark:text-white text-sm">{user.first_name} {user.last_name}</p>
                            <p className="text-xs text-surface-500 dark:text-surface-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' : 'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-300'
                        }`}>
                          {user.role === 'admin' && <Shield className="w-3 h-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                        }`}>
                          {user.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {user.is_active ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs ${
                          user.is_email_verified ? 'text-green-600 dark:text-green-400' : 'text-surface-500 dark:text-surface-400'
                        }`}>
                          {user.is_email_verified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-500 dark:text-surface-400">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/users/${user.id}`}
                            className="text-surface-500 dark:text-surface-400 hover:text-marsana-600 dark:hover:text-marsana-400 p-1 transition-all duration-300"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setBlockConfirm(user)}
                            className={`p-1 transition-all duration-300 ${user.is_active ? 'text-surface-500 dark:text-surface-400 hover:text-yellow-600 dark:hover:text-yellow-400' : 'text-surface-500 dark:text-surface-400 hover:text-green-600 dark:hover:text-green-400'}`}
                            title={user.is_active ? 'Block' : 'Unblock'}
                          >
                            {user.is_active ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="text-surface-500 dark:text-surface-400 hover:text-red-600 dark:hover:text-red-400 p-1 transition-all duration-300"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-surface-200 dark:border-surface-800">
              <p className="text-sm text-surface-500 dark:text-surface-400">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.total)} of {pagination.total} users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-surface-200 dark:border-surface-800 disabled:opacity-50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-surface-700 dark:text-surface-300">
                  Page {currentPage} of {pagination.pages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={currentPage === pagination.pages}
                  className="p-2 rounded-xl border border-surface-200 dark:border-surface-800 disabled:opacity-50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 max-w-sm w-full mx-4 border border-surface-200 dark:border-surface-800">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">Delete User</h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline text-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-700 transition-all duration-300">Delete</button>
            </div>
          </div>
        </div>
      )}

      {blockConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 max-w-sm w-full mx-4 border border-surface-200 dark:border-surface-800">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
              {blockConfirm.is_active ? 'Block User' : 'Unblock User'}
            </h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-6">
              {blockConfirm.is_active
                ? `Are you sure you want to block ${blockConfirm.first_name} ${blockConfirm.last_name}? They will not be able to log in.`
                : `Are you sure you want to unblock ${blockConfirm.first_name} ${blockConfirm.last_name}? They will be able to log in again.`
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setBlockConfirm(null)} className="btn-outline text-sm">Cancel</button>
              <button
                onClick={() => handleToggleActive(blockConfirm.id)}
                className={`px-4 py-2 rounded-xl text-sm text-white transition-all duration-300 ${
                  blockConfirm.is_active ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {blockConfirm.is_active ? 'Block' : 'Unblock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
