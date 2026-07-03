import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaArrowLeft } from "react-icons/fa";

function DocumentsPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      setIsAdmin(true);
    }
  }, []);

  return (
    <div className="flex items-center justify-center p-6 min-h-[calc(100vh-8rem)]">
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl w-full max-w-2xl p-10 flex flex-col justify-center items-center shadow-2xl backdrop-blur-md">
        {isAdmin ? (
          <div className="w-full text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 text-3xl">
              📄
            </div>
            <h3 className="text-2xl font-bold text-white">Administrator Access Available</h3>
            <p className="text-neutral-400 text-sm max-w-md mx-auto leading-relaxed">
              You are logged in with administrative privileges. Please open the admin document management console to upload, list, or delete the university reference files.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-neutral-950 font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer text-sm shadow-md mx-auto"
              >
                <FaUpload className="w-4 h-4" />
                <span>Go to Admin Document Dashboard</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-neutral-950/60 rounded-full border border-neutral-850 flex items-center justify-center mx-auto shadow-inner text-emerald-400 text-3xl">
              🔒
            </div>
            <h3 className="text-2xl font-bold text-white">Document Access Restricted</h3>
            <p className="text-neutral-400 text-sm max-w-md mx-auto leading-relaxed">
              Direct access to browse, inspect, or download individual PDF source documents is restricted to university administrators to preserve institutional data privacy and security.
            </p>
            
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-4 text-emerald-400 text-sm max-w-md mx-auto">
              💡 Tip: You can ask the AI Assistant questions about course syllabi, fee structures, library rules, or placement criteria, and it will search these files for you.
            </div>

            <div className="pt-4 flex justify-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-lg font-medium transition-colors cursor-pointer text-sm"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate("/assistant")}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer text-sm shadow-md"
              >
                Ask AI Assistant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentsPage;
