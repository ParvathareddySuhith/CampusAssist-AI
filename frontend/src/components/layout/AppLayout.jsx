import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Squares from "../ui/Squares";
import { getProfile } from "../../services/profileService";

function AppLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const refreshProfile = async () => {
    const token = localStorage.getItem("userToken");
    if (token) {
      try {
        const data = await getProfile();
        if (data && data.department && data.semester) {
          setProfile(data);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Error loading layout profile:", err);
      }
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

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
        profile={profile}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:pl-64 overflow-hidden relative z-10">
        {/* Top Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <Outlet context={{ profile, refreshProfile }} />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
