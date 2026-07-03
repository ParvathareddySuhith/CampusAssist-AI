import React from "react";
import NavItem from "../navigation/NavItem";
import { FaHome, FaRobot, FaFileAlt, FaBook, FaBriefcase, FaUser, FaCog } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

function Sidebar({ isOpen, toggleSidebar, handleLogout }) {
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
        {/* Top Branding Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2.5">
              <img src="/logo.svg" alt="CampusAssist Logo" className="w-7 h-7" />
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                CampusAssist AI
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
            <NavItem to="/dashboard" icon={<FaHome />} label="Dashboard" />
            <NavItem to="/assistant" icon={<FaRobot />} label="AI Assistant" />
            <NavItem to="/documents" icon={<FaFileAlt />} label="Documents" />
            <NavItem to="#" icon={<FaBook />} label="Study Assistant" disabled={true} />
            <NavItem to="#" icon={<FaBriefcase />} label="Placement Assistant" disabled={true} />
            <NavItem to="/profile" icon={<FaUser />} label="Profile" />
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="space-y-1.5 border-t border-neutral-900 pt-4">
          <NavItem to="/settings" icon={<FaCog />} label="Settings" />
          <NavItem to="#" icon={<span>🚪</span>} label="Logout" onClick={handleLogout} />
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
