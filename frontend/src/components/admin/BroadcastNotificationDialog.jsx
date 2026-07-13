import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import * as adminNotificationService from '../../services/adminNotificationService';

/**
 * Modal form dialog for broadcasting new notifications with duplicate-click protection and validations
 */
function BroadcastNotificationDialog({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    target_type: 'ALL',
    target_value: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    title: '',
    message: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTargetTypeChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      target_type: val,
      target_value: '' // Reset target value on scope changes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submits

    setError('');

    // Central validations
    if (!formData.title.trim()) {
      setError('Notification title cannot be empty.');
      return;
    }
    if (!formData.message.trim()) {
      setError('Notification message cannot be empty.');
      return;
    }
    if (formData.target_type !== 'ALL' && !formData.target_value.trim()) {
      setError('Recipient target value is required for this scope.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        target_type: formData.target_type,
        target_value: formData.target_value.trim(),
        category: formData.category,
        priority: formData.priority,
        title: formData.title.trim(),
        message: formData.message.trim()
      };

      const res = await adminNotificationService.createNotification(payload);
      
      // Success Callback
      onSuccess(res.recipients || 1);
      
      // Reset State
      setFormData({
        target_type: 'ALL',
        target_value: '',
        category: 'GENERAL',
        priority: 'MEDIUM',
        title: '',
        message: ''
      });
      onClose();
    } catch (err) {
      console.error('Failed to broadcast notification:', err);
      setError(err.response?.data?.error || 'Failed to send notification broadcast.');
    } finally {
      setLoading(false);
    }
  };

  const maxMessageLength = 500;
  const messageLength = formData.message.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Card container */}
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl z-10 text-white flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-neutral-800 mb-4">
          <h3 className="text-lg font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            Create Notification Broadcast
          </h3>
          <button 
            disabled={loading}
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 cursor-pointer disabled:opacity-50 transition-colors"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-center text-xs font-semibold select-none">
              {error}
            </div>
          )}

          {/* Recipient Target Type Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Recipient Scope
              </label>
              <select
                name="target_type"
                value={formData.target_type}
                onChange={handleTargetTypeChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-neutral-800 bg-neutral-950 text-white rounded-lg focus:outline-none focus:border-violet-500/60 transition-colors text-sm font-semibold"
              >
                <option value="ALL">All Students</option>
                <option value="DEPARTMENT">Entire Department</option>
                <option value="SEMESTER">Entire Semester</option>
                <option value="INDIVIDUAL">Individual Student</option>
              </select>
            </div>

            {/* Recipient Target Value Field */}
            {formData.target_type !== 'ALL' && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  {formData.target_type === 'DEPARTMENT' && 'Department (e.g., CSE)'}
                  {formData.target_type === 'SEMESTER' && 'Semester (e.g., 5)'}
                  {formData.target_type === 'INDIVIDUAL' && 'Username or Email'}
                </label>
                {formData.target_type === 'SEMESTER' ? (
                  <select
                    name="target_value"
                    value={formData.target_value}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-neutral-800 bg-neutral-950 text-white rounded-lg focus:outline-none focus:border-violet-500/60 transition-colors text-sm font-semibold"
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="target_value"
                    value={formData.target_value}
                    onChange={handleInputChange}
                    disabled={loading}
                    placeholder={
                      formData.target_type === 'DEPARTMENT' 
                        ? 'e.g., CSE, ECE' 
                        : 'e.g., student123'
                    }
                    className="w-full px-3 py-2 border border-neutral-800 bg-neutral-950 placeholder-neutral-600 text-white rounded-lg focus:outline-none focus:border-violet-500/60 transition-colors text-sm"
                  />
                )}
              </div>
            )}
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-neutral-800 bg-neutral-950 text-white rounded-lg focus:outline-none focus:border-violet-500/60 transition-colors text-sm font-semibold"
              >
                <option value="GENERAL">General</option>
                <option value="ACADEMIC">Academic</option>
                <option value="PLACEMENT">Placement</option>
                <option value="SYSTEM">System</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-neutral-800 bg-neutral-950 text-white rounded-lg focus:outline-none focus:border-violet-500/60 transition-colors text-sm font-semibold"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Enter notification title"
              maxLength={100}
              className="w-full px-3 py-2 border border-neutral-800 bg-neutral-950 placeholder-neutral-600 text-white rounded-lg focus:outline-none focus:border-violet-500/60 transition-colors text-sm"
            />
          </div>

          {/* Message Area */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Message Content
              </label>
              <span className={`text-[10px] font-semibold ${messageLength > maxMessageLength ? 'text-rose-400' : 'text-neutral-500'}`}>
                {messageLength}/{maxMessageLength}
              </span>
            </div>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Write broadcast message content here..."
              rows={4}
              maxLength={maxMessageLength}
              className="w-full px-3 py-2 border border-neutral-800 bg-neutral-950 placeholder-neutral-600 text-white rounded-lg focus:outline-none focus:border-violet-500/60 transition-colors text-sm resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-neutral-850">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors text-sm font-semibold cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors text-sm font-semibold flex items-center justify-center cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed shadow-lg hover:shadow-violet-600/25"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Broadcast'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BroadcastNotificationDialog;
