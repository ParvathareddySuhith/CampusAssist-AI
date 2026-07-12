import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import Squares from "../ui/Squares";

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="h-screen w-screen bg-neutral-950 flex overflow-hidden relative text-white">
      {/* Background animation Grid */}
      <div className="absolute inset-0 z-0">
        <Squares
          speed={0.15}
          squareSize={55}
          direction="down"
          borderColor="rgba(255, 255, 255, 0.02)"
          hoverFillColor="rgba(139, 92, 246, 0.02)"
        />
      </div>

      {/* Sidebar Navigation */}
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:pl-64 overflow-hidden relative z-10">
        {/* Top Header */}
        <AdminHeader toggleSidebar={toggleSidebar} />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
