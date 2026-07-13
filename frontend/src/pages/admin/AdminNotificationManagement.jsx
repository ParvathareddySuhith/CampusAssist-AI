import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaSearch, FaRedoAlt } from 'react-icons/fa';
import NotificationStatsCards from '../../components/admin/NotificationStatsCards';
import NotificationTable from '../../components/admin/NotificationTable';
import BroadcastNotificationDialog from '../../components/admin/BroadcastNotificationDialog';
import GradientText from '../../components/ui/GradientText';
import * as adminNotificationService from '../../services/adminNotificationService';

/**
 * Main Administrative Notification Center view
 */
function AdminNotificationManagement() {
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, page_size: 10, total: 0, pages: 1 });
  
  // Filtering & searching states
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [targetType, setTargetType] = useState('ALL');

  // Loader & Error states
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dialog & Toast states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  // Debounce search input by 300ms
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearch((prev) => {
        if (prev !== searchInput) {
          setPage(1); // Reset page on filter changes
        }
        return searchInput;
      });
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  // Load stats and notifications in parallel
  const loadData = useCallback(async (showFullLoader = false) => {
    if (showFullLoader) setLoading(true);
    else setListLoading(true);
    
    setError('');
    try {
      const [statsData, listData] = await Promise.all([
        adminNotificationService.getNotificationStats(),
        adminNotificationService.getNotifications({
          page,
          page_size: 10,
          search,
          category,
          priority,
          target_type: targetType
        })
      ]);
      
      setStats(statsData);
      setNotifications(listData.notifications || []);
      setPagination(listData.pagination || { page: 1, page_size: 10, total: 0, pages: 1 });

      // Auto-decrement page if deletions emptied the current page
      if (listData.notifications?.length === 0 && page > 1) {
        setPage((p) => p - 1);
      }
    } catch (err) {
      console.error('Failed to load notifications data:', err);
      setError('Failed to retrieve sent notifications feed.');
    } finally {
      setLoading(false);
      setListLoading(false);
    }
  }, [page, search, category, priority, targetType]);

  // Reload when page or filters update
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Delete Action
  const handleDeleteNotification = async (id) => {
    try {
      const res = await adminNotificationService.deleteNotification(id);
      showToast(`Notification removed for ${res.deleted_count || 1} recipients.`, 'success');
      // Parallel Refresh
      await loadData();
    } catch (err) {
      console.error('Failed to delete notification:', err);
      showToast(err.response?.data?.error || 'Failed to delete notification.', 'error');
    }
  };

  // Create Broadcast Success
  const handleBroadcastSuccess = (recipientsCount) => {
    showToast(`Notification sent to ${recipientsCount} recipients.`, 'success');
    setPage(1); // Go to page 1 to see the new notification
    loadData();
  };

  // Reset Filters helper
  const handleResetFilters = () => {
    setSearchInput('');
    setCategory('ALL');
    setPriority('ALL');
    setTargetType('ALL');
    setPage(1);
  };

  return (
    <div className="space-y-6 text-white min-h-full font-sans pb-12 relative">
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center space-x-3 transition-all duration-300 animate-slide-in ${
          toast.type === 'error' 
            ? 'bg-rose-950/90 border-rose-500/35 text-rose-300' 
            : 'bg-emerald-950/90 border-emerald-500/35 text-emerald-300'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <GradientText className="text-2xl font-extrabold tracking-tight">
            Notification Management
          </GradientText>
          <p className="text-xs text-neutral-400 mt-1">
            Dispatch announcements, system notices, placement details, and academic notifications.
          </p>
        </div>

        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-lg hover:shadow-violet-600/25 transition-all text-sm font-semibold cursor-pointer"
        >
          <FaPlus className="text-xs" />
          <span>Create Broadcast</span>
        </button>
      </div>

      {/* Statistics Section */}
      <NotificationStatsCards stats={stats} loading={loading} />

      {/* Listings & Controls Section */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 p-4 rounded-2xl bg-neutral-900/30 border border-neutral-900 backdrop-blur-xl">
          {/* Search Box */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-sm" />
            <input
              type="text"
              placeholder="Search notifications by title or body..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-850 bg-neutral-950 placeholder-neutral-600 text-white rounded-xl focus:outline-none focus:border-violet-500/60 transition-colors text-sm"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Scope Filter */}
            <div className="flex flex-col space-y-1">
              <select
                aria-label="Scope Filter"
                value={targetType}
                onChange={(e) => { setTargetType(e.target.value); setPage(1); }}
                className="px-3 py-1.5 border border-neutral-850 bg-neutral-950 text-white rounded-xl focus:outline-none focus:border-violet-500/60 transition-colors text-xs font-semibold"
              >
                <option value="ALL">Scope: All</option>
                <option value="ALL_SCOPE">ALL Broadcasts</option>
                <option value="DEPARTMENT">Departments</option>
                <option value="SEMESTER">Semesters</option>
                <option value="INDIVIDUAL">Individuals</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col space-y-1">
              <select
                aria-label="Category Filter"
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="px-3 py-1.5 border border-neutral-850 bg-neutral-950 text-white rounded-xl focus:outline-none focus:border-violet-500/60 transition-colors text-xs font-semibold"
              >
                <option value="ALL">Category: All</option>
                <option value="GENERAL">General</option>
                <option value="ACADEMIC">Academic</option>
                <option value="PLACEMENT">Placement</option>
                <option value="SYSTEM">System</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex flex-col space-y-1">
              <select
                aria-label="Priority Filter"
                value={priority}
                onChange={(e) => { setPriority(e.target.value); setPage(1); }}
                className="px-3 py-1.5 border border-neutral-850 bg-neutral-950 text-white rounded-xl focus:outline-none focus:border-violet-500/60 transition-colors text-xs font-semibold"
              >
                <option value="ALL">Priority: All</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            {/* Reset / Refresh buttons */}
            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="px-3 py-1.5 border border-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-colors text-xs font-semibold cursor-pointer"
            >
              Reset
            </button>

            <button
              onClick={() => loadData(true)}
              title="Force Refresh Data"
              className="p-2 border border-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <FaRedoAlt className="text-xs" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-400 text-center font-semibold text-sm select-none">
            {error}
          </div>
        )}

        {/* Listings Table */}
        <NotificationTable
          notifications={notifications}
          loading={loading || listLoading}
          onDelete={handleDeleteNotification}
          onCreateClick={() => setIsDialogOpen(true)}
        />

        {/* Pagination bar */}
        {!loading && notifications.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-neutral-900 select-none">
            <span className="text-xs text-neutral-400 font-semibold">
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1 || listLoading}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-neutral-850 bg-neutral-900/50 hover:bg-neutral-800 text-xs font-bold text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.pages || listLoading}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-neutral-850 bg-neutral-900/50 hover:bg-neutral-800 text-xs font-bold text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Broadcast Modal Form Dialog */}
      <BroadcastNotificationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleBroadcastSuccess}
      />
    </div>
  );
}

export default AdminNotificationManagement;
