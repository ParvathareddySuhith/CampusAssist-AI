import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Squares from "../ui/Squares";

function AppLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="h-screen w-screen bg-neutral-950 flex overflow-hidden relative text-white">
      {/* Background animation Grid */}
      <div className="absolute inset-0 z-0">
        <Squares
          speed={0.2}
          squareSize={50}
          direction="down"
          borderColor="rgba(255, 255, 255, 0.03)"
          hoverFillColor="rgba(59, 130, 246, 0.03)"
        />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        handleLogout={handleLogout} 
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:pl-64 overflow-hidden relative z-10">
        {/* Top Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
