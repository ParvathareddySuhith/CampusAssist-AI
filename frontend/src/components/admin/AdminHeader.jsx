import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import { useAdminAuth } from '../../hooks/useAdminAuth';

function AdminHeader({ toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  const handleAdminLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin/dashboard':
        return 'Admin Dashboard';
      default:
        return 'Admin Portal';
    }
  };

  const adminName = admin?.username || 'Admin';

  return (
    <header className="h-16 border-b border-neutral-900 bg-neutral-950/70 backdrop-blur-md flex justify-between items-center px-6 relative z-30">
      {/* Left: Mobile menu toggle and title */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleSidebar}
          className="md:hidden text-neutral-400 hover:text-white p-1.5 rounded-lg bg-neutral-900 border border-neutral-850 cursor-pointer"
        >
          <FaBars className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-white select-none">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right: User Avatar & Logout */}
      <div className="flex items-center space-x-4">
        {/* User Info & Avatar */}
        <div className="flex items-center space-x-3 pr-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">{adminName}</p>
            <span className="inline-block text-[9px] font-extrabold px-1.5 py-0.5 bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded uppercase tracking-wider">
              {admin?.role || 'ADMIN'}
            </span>
          </div>
          {/* Avatar circle */}
          <div className="w-9 h-9 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center font-bold text-violet-400 text-sm shadow-inner">
            {adminName.charAt(0).toUpperCase()}
          </div>
        </div>

        <button
          onClick={handleAdminLogout}
          className="p-2 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10 transition-all duration-200 cursor-pointer"
          title="Sign Out"
        >
          <FaSignOutAlt className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
