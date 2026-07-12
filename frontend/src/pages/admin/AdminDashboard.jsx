import React from "react";
import { FaFilePdf, FaUsers, FaBell, FaChartLine } from "react-icons/fa";
import SpotlightCard from "../../components/ui/SpotlightCard";
import { useAdminAuth } from "../../hooks/useAdminAuth";

function AdminDashboard() {
  const { admin } = useAdminAuth();
  const adminName = admin?.username || "Administrator";

  const adminModules = [
    {
      title: "Upload Documents",
      description: "Manage PDFs, ingest materials, and update AI RAG vector stores.",
      icon: <FaFilePdf className="w-8 h-8 text-violet-400" />,
      color: "rgba(139, 92, 246, 0.08)",
      borderHover: "hover:border-violet-500/30"
    },
    {
      title: "Manage Users",
      description: "Control student roles, view profile logs, and restrict access parameters.",
      icon: <FaUsers className="w-8 h-8 text-fuchsia-400" />,
      color: "rgba(217, 70, 239, 0.08)",
      borderHover: "hover:border-fuchsia-500/30"
    },
    {
      title: "Notification Center",
      description: "Publish academic announcements and manage real-time alert broadcasts.",
      icon: <FaBell className="w-8 h-8 text-pink-400" />,
      color: "rgba(244, 114, 182, 0.08)",
      borderHover: "hover:border-pink-500/30"
    },
    {
      title: "Student Analytics",
      description: "Analyze question logs, resolution rates, and system workloads.",
      icon: <FaChartLine className="w-8 h-8 text-emerald-400" />,
      color: "rgba(16, 185, 129, 0.08)",
      borderHover: "hover:border-emerald-500/30"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-8 text-white relative">
      {/* Welcome banner */}
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">
          Welcome back, <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{adminName}</span>!
        </h2>
        <p className="text-neutral-400 text-sm">
          Access administrative configuration panels, index study documents, and audit student query histories.
        </p>
      </div>

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {adminModules.map((module, index) => (
          <SpotlightCard
            key={index}
            className={`transition-all duration-300 ${module.borderHover}`}
            spotlightColor={module.color}
          >
            <div className="flex items-start space-x-5">
              <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-900 shadow-inner">
                {module.icon}
              </div>
              <div className="space-y-2 flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white leading-snug">
                  {module.title}
                </h3>
                <p className="text-xs text-neutral-450 leading-relaxed">
                  {module.description}
                </p>
                <div className="pt-2 flex items-center">
                  <span className="text-[10px] bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Coming in upcoming sprints
                  </span>
                </div>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
