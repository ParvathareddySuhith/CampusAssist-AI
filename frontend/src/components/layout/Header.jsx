import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { NotificationBell } from "../notifications";

function Header({ toggleSidebar }) {
  const location = useLocation();
  const [username, setUsername] = useState("Suhith");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Determine current page title
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/assistant":
        return "AI Assistant";
      case "/documents":
        return "Academic Documents";
      case "/profile":
        return "User Profile";
      case "/settings":
        return "Settings";
      default:
        return "CampusAssist AI";
    }
  };

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

      {/* Right: Notification & User Avatar */}
      <div className="flex items-center space-x-4">
        {/* Notification Icon */}
        <NotificationBell />

        {/* User Info & Avatar */}
        <div className="flex items-center space-x-3 pl-2 border-l border-neutral-900">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">{username}</p>
            <p className="text-[10px] text-neutral-500">Student</p>
          </div>
          {/* Avatar circle */}
          <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm shadow-inner">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
