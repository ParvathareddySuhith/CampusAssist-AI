import React, { useState, useEffect, useCallback } from 'react';
import { FaSync, FaSearch } from 'react-icons/fa';
import GradientText from '../../components/ui/GradientText';
import * as convService from '../../services/adminConversationService';
import ConversationTable from '../../components/admin/ConversationTable';
import ConversationDrawer from '../../components/admin/ConversationDrawer';

/**
 * Conversation Explorer view for administrators to audit student-chatbot interactions
 */
function AdminConversationExplorer() {
  const [conversations, setConversations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, page_size: 20, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer / Inspection states
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await convService.getAdminConversations(page, 20, search, department);
      setConversations(data.conversations || []);
      setPagination(data.pagination || { page: 1, page_size: 20, total: 0, pages: 0 });
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Failed to fetch conversation history.');
    } finally {
      setLoading(false);
    }
  }, [page, search, department]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleRefresh = () => {
    fetchConversations();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleDetailsClick = (conv) => {
    setSelectedConvId(conv.id);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Header bar */}
      <div className="flex justify-between items-center select-none">
        <div>
          <GradientText className="text-3xl font-extrabold tracking-tight">
            Conversation Explorer
          </GradientText>
          <p className="text-xs text-neutral-400">
            Inspect, search, and audit student dialogue with the chatbot.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/80 text-xs font-semibold text-neutral-200 transition-all cursor-pointer shadow-lg"
        >
          <FaSync className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/20 backdrop-blur-md select-none">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by user or question content..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-950/80 border border-neutral-800/80 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all font-medium"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center space-x-2">
          <label htmlFor="dept-filter" className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
            Department:
          </label>
          <select
            id="dept-filter"
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm bg-neutral-950/80 border border-neutral-800/80 rounded-lg text-neutral-200 focus:outline-none focus:border-violet-500/50 transition-all font-semibold cursor-pointer min-w-[150px]"
          >
            <option value="">All Departments</option>
            <option value="Computer Science and Engineering">Computer Science (CSE)</option>
            <option value="Information Technology">Information Technology (IT)</option>
            <option value="Electronics and Communication Engineering">ECE</option>
            <option value="Mechanical Engineering">Mechanical</option>
          </select>
        </div>
      </div>

      {/* Main Table view */}
      <div className="relative">
        {error ? (
          <div className="p-8 rounded-xl border border-rose-500/20 bg-rose-500/5 text-center text-rose-400 text-sm font-semibold select-none">
            {error}
          </div>
        ) : loading && conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4 rounded-xl border border-neutral-800/60 bg-neutral-950/20">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
            <span className="text-sm text-neutral-500 font-semibold select-none">Loading conversations...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <ConversationTable 
              conversations={conversations}
              onDetailsClick={handleDetailsClick}
            />

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex justify-between items-center text-xs text-neutral-400 font-semibold select-none pt-2">
                <span>
                  Page {pagination.page} of {pagination.pages} (Total: {pagination.total} conversations)
                </span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conversation history details drawer */}
      <ConversationDrawer
        isOpen={isDrawerOpen}
        conversationId={selectedConvId}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedConvId(null);
        }}
      />
    </div>
  );
}

export default AdminConversationExplorer;
