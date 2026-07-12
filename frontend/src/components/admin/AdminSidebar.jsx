import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaFileAlt, FaUsers, FaBell, FaChartPie, FaCog, FaSignOutAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useAdminAuth } from "../../hooks/useAdminAuth";

function AdminNavItem({ to, icon, label, disabled, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  if (disabled) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg text-neutral-600 opacity-50 cursor-not-allowed select-none font-sans">
        <div className="flex items-center space-x-3">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-[10px] bg-neutral-950 px-2 py-0.5 rounded-full text-neutral-500 font-semibold border border-neutral-900">
          Soon
        </span>
      </div>
    );
  }

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center space-x-3 p-3 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 cursor-pointer text-left font-sans"
      >
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </button>
    );
  }

  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 border font-sans ${
        isActive 
          ? "bg-violet-600/15 text-violet-400 border-violet-500/30" 
          : "text-neutral-400 hover:text-white hover:bg-neutral-900 border-transparent hover:border-neutral-850"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

function AdminSidebar({ isOpen, toggleSidebar }) {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleAdminLogout = async () => {
    await logout();
    navigate("/admin");
  };

  const adminName = admin?.username || "Admin";

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 bg-neutral-950 border-r border-neutral-900 flex flex-col justify-between z-50 transition-transform duration-300 w-64 p-5 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Branding and Nav section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2.5">
              <img src="/logo.svg" alt="CampusAssist Logo" className="w-7 h-7" />
              <span className="text-lg font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                Admin Control
              </span>
            </div>
            {/* Mobile close button */}
            <button 
              onClick={toggleSidebar}
              className="md:hidden text-neutral-400 hover:text-white p-1 rounded bg-neutral-900 border border-neutral-850 cursor-pointer"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-4">
            <AdminNavItem to="/admin/dashboard" icon={<FaHome />} label="Dashboard" />
            <AdminNavItem to="#" icon={<FaFileAlt />} label="Document Management" disabled />
            <AdminNavItem to="#" icon={<FaUsers />} label="User Management" disabled />
            <AdminNavItem to="#" icon={<FaBell />} label="Notification Center" disabled />
            <AdminNavItem to="#" icon={<FaChartPie />} label="Analytics" disabled />
            <AdminNavItem to="#" icon={<FaCog />} label="System Settings" disabled />
          </nav>
        </div>

        {/* Bottom User Section */}
        <div className="space-y-4 border-t border-neutral-900 pt-4">
          {admin && (
            <div className="px-3 py-2.5 bg-neutral-900/50 rounded-lg border border-neutral-900 flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center font-bold text-violet-400 text-xs shadow-inner">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {adminName}
                </p>
                <p className="text-[9px] text-violet-400 font-bold uppercase tracking-wider truncate">
                  {admin.role}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <AdminNavItem to="#" icon={<FaSignOutAlt />} label="Logout" onClick={handleAdminLogout} />
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
export { AdminNavItem };
