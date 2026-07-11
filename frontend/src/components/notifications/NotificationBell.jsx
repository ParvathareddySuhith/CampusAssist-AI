import React, { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import useNotifications from '../../hooks/useNotifications';
import UnreadBadge from './UnreadBadge';
import NotificationDropdown from './NotificationDropdown';

/**
 * Main trigger and container for Notification Center. Handles lazy loading,
 * keyboard accessibility, focus trapping, and click outside dismissal.
 */
const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const {
    notifications,
    unreadCount,
    loading,
    error,
    isLoaded,
    actionPending,
    loadNotifications,
    markRead,
    deleteNotification,
    markAllRead,
    clearAll
  } = useNotifications();

  // Lazy loading: fetch notifications on first open
  const handleToggle = () => {
    setIsOpen(prev => !prev);
    if (!isLoaded) {
      loadNotifications();
    }
  };

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && 
          dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          bellRef.current && !bellRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        // Return focus to bell button
        if (buttonRef.current) {
          buttonRef.current.focus();
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus trap logic inside open dropdown
  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return;

    const dropdown = dropdownRef.current;
    
    // Find all focusable elements inside dropdown
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    const handleFocusTrap = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = dropdown.querySelectorAll(focusableSelector);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: if on first element, wrap to last
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    dropdown.addEventListener('keydown', handleFocusTrap);
    return () => {
      dropdown.removeEventListener('keydown', handleFocusTrap);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={bellRef}>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-850 cursor-pointer relative transition-colors ${
          isOpen ? 'bg-neutral-900 border-neutral-850 text-white' : ''
        }`}
        title="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Notifications"
      >
        <FaBell className="w-4 h-4" />
        <UnreadBadge count={unreadCount} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          error={error}
          actionPending={actionPending}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onDelete={deleteNotification}
          onClearAll={clearAll}
          onRetry={() => loadNotifications(true)}
          dropdownRef={dropdownRef}
        />
      )}
    </div>
  );
};

export default NotificationBell;
