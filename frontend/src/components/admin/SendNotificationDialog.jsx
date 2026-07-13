import React, { useState } from "react";
import { FaPaperPlane, FaTimes, FaBell, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import * as userService from "../../services/adminUserService";

function SendNotificationDialog({ isOpen, userId, studentName, onCancel }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [priority, setPriority] = useState("MEDIUM");
  
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!title.trim() || !message.trim()) {
      setError("Title and message are required.");
      return;
    }

    setSending(true);
    try {
      await userService.sendNotification(userId, {
        title: title.trim(),
        message: message.trim(),
        category,
        priority
      });
      
      setSuccess(true);
      setTitle("");
      setMessage("");
      setCategory("GENERAL");
      setPriority("MEDIUM");

      // Auto close after 1.5 seconds
      setTimeout(() => {
        setSuccess(false);
        if (onCancel) onCancel();
      }, 1500);

    } catch (err) {
      console.error("Failed to send notification:", err);
      setError(err.response?.data?.error || "Failed to dispatch alert announcement.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        onClick={onCancel}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-2xl z-10 text-white transform transition-all duration-300">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <FaBell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Send Alert Notification</h3>
              <p className="text-xs text-neutral-400">Dispatch alert announcement to {studentName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-neutral-500 hover:text-white p-1 rounded-full hover:bg-neutral-850 transition-all cursor-pointer"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold flex items-center space-x-2">
              <FaExclamationTriangle className="flex-shrink-0 w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold flex items-center space-x-2">
              <FaCheckCircle className="flex-shrink-0 w-3.5 h-3.5" />
              <span>✓ Notification sent successfully!</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Title</label>
              <input
                disabled={sending || success}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement Title"
                className="w-full px-3 py-2 border border-neutral-800 placeholder-neutral-600 text-white bg-neutral-950 rounded-lg focus:outline-none focus:border-violet-500/80 transition-colors text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Category</label>
                <select
                  disabled={sending || success}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-800 text-white bg-neutral-950 rounded-lg focus:outline-none focus:border-violet-500/80 transition-colors text-sm cursor-pointer"
                >
                  <option value="GENERAL">General</option>
                  <option value="ACADEMIC">Academic</option>
                  <option value="SYSTEM">System</option>
                  <option value="PLACEMENT">Placement</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Priority</label>
                <select
                  disabled={sending || success}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-800 text-white bg-neutral-950 rounded-lg focus:outline-none focus:border-violet-500/80 transition-colors text-sm cursor-pointer"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Message</label>
              <textarea
                disabled={sending || success}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter alert message details..."
                rows={4}
                className="w-full px-3 py-2 border border-neutral-800 placeholder-neutral-600 text-white bg-neutral-950 rounded-lg focus:outline-none focus:border-violet-500/80 transition-colors text-sm resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              disabled={sending || success}
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-800 hover:text-white text-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={sending || success || !title.trim() || !message.trim()}
              type="submit"
              className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-lg text-sm transition-all duration-200 flex items-center space-x-2 cursor-pointer shadow-md hover:shadow-violet-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane className="w-3.5 h-3.5" />
                  <span>Send Alert</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SendNotificationDialog;
