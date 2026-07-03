import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Squares from "./ui/Squares";
import ChatBox from "./ChatBox";
import GradientText from "./ui/GradientText";
import SpotlightCard from "./ui/SpotlightCard";
import { 
  FaUserGraduate, 
  FaBook, 
  FaBriefcase, 
  FaFileAlt, 
  FaHistory, 
  FaChevronRight, 
  FaUpload,
  FaArrowRight
} from "react-icons/fa";
import { FiLogOut, FiLogIn } from "react-icons/fi";
import { IoMdSettings } from "react-icons/io";
import { getChatHistory } from "../lib/api";

function Portal() {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("Suhith");
  const [recentChats, setRecentChats] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    const adminToken = localStorage.getItem("adminToken");
    const storedUsername = localStorage.getItem("username");

    if (userToken) {
      setIsLoggedIn(true);
      if (storedUsername) {
        setUsername(storedUsername);
      }
      
      // Load recent chats if logged in
      getChatHistory(userToken)
        .then(res => {
          if (res.history) {
            setRecentChats(res.history.slice(0, 3)); // show top 3
          }
        })
        .catch(err => console.log("Error loading recent chats:", err));
    }
    
    if (adminToken) {
      setIsAdmin(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setRecentChats([]);
    setUsername("Suhith"); // Fallback default
  };

  return (
    <div className="h-screen w-screen bg-neutral-950 relative overflow-hidden flex flex-col font-sans select-none text-white">
      {/* Premium background grid */}
      <div className="absolute inset-0 z-0">
        <Squares
          speed={0.3}
          squareSize={45}
          direction="down"
          borderColor="rgba(255, 255, 255, 0.05)"
          hoverFillColor="rgba(59, 130, 246, 0.1)"
        />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 p-5 border-b border-neutral-900 bg-neutral-950/70 backdrop-blur-md flex justify-between items-center px-8">
        <div className="flex items-center space-x-3">
          <img src="/logo.svg" alt="CampusAssist Logo" className="w-8 h-8" />
          <GradientText
            colors={["#3b82f6", "#6366f1", "#10b981"]}
            animationSpeed={4}
            showBorder={false}
            className="text-xl font-bold tracking-tight"
          >
            CampusAssist AI
          </GradientText>
        </div>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 text-sm text-neutral-400 hover:text-red-400 transition-colors bg-neutral-900 hover:bg-red-500/10 px-4 py-2 rounded-lg border border-neutral-800 hover:border-red-500/20 cursor-pointer"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          ) : (
            <button 
              onClick={() => navigate("/login")}
              className="flex items-center space-x-2 text-sm text-neutral-300 hover:text-white transition-colors bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer"
            >
              <FiLogIn className="w-4 h-4" />
              <span>User Sign In</span>
            </button>
          )}

          <button 
            onClick={() => navigate("/admin")}
            className="flex items-center space-x-2 text-sm text-neutral-400 hover:text-yellow-400 transition-colors bg-neutral-900 hover:bg-yellow-500/10 px-4 py-2 rounded-lg border border-neutral-800 hover:border-yellow-500/20 cursor-pointer"
            title="Admin Dashboard"
          >
            <IoMdSettings className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 relative z-10 p-8 flex gap-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Left Side: greeting and cards grid */}
        <div className="flex-1 space-y-8">
          {/* Greeting banner */}
          <div className="space-y-2">
            <h2 className="text-4xl font-extrabold tracking-tight">
              Hello {username} 👋
            </h2>
            <p className="text-neutral-400 text-lg">
              Your intelligent campus companion.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Card 1: AI Assistant */}
            <SpotlightCard 
              className="p-6 bg-neutral-900/60 border border-neutral-800 rounded-xl hover:border-blue-500/30 transition-all flex flex-col justify-between h-48"
              spotlightColor="rgba(59, 130, 246, 0.15)"
            >
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">💬</span>
                  <h3 className="text-lg font-bold text-white">AI Assistant</h3>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Ask academic or campus-related questions.
                </p>
              </div>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="w-fit mt-4 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-medium transition-all cursor-pointer shadow-md flex items-center space-x-1.5"
              >
                <span>Open Assistant</span>
                <FaChevronRight className="w-3 h-3" />
              </button>
            </SpotlightCard>

            {/* Card 2: Documents */}
            <SpotlightCard 
              className="p-6 bg-neutral-900/60 border border-neutral-800 rounded-xl hover:border-emerald-500/30 transition-all flex flex-col justify-between h-48"
              spotlightColor="rgba(16, 185, 129, 0.15)"
            >
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">📄</span>
                  <h3 className="text-lg font-bold text-white">Documents</h3>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Browse uploaded academic documents.
                </p>
              </div>
              <button 
                onClick={() => setIsDocsOpen(true)}
                className="w-fit mt-4 px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white rounded-lg text-sm font-medium transition-all cursor-pointer shadow-md flex items-center space-x-1.5"
              >
                <span>Browse Documents</span>
                <FaChevronRight className="w-3 h-3" />
              </button>
            </SpotlightCard>

            {/* Card 3: Study Assistant (Coming Soon) */}
            <SpotlightCard 
              className="p-6 bg-neutral-900/30 border border-neutral-950 rounded-xl opacity-65 flex flex-col justify-between h-48 cursor-not-allowed"
              spotlightColor="rgba(255, 255, 255, 0.05)"
            >
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">📚</span>
                  <h3 className="text-lg font-bold text-white">Study Assistant</h3>
                </div>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Personalized revision plans and lecture summaries.
                </p>
              </div>
              <span className="w-fit px-3 py-1 bg-neutral-950/60 text-neutral-500 border border-neutral-900 rounded-full text-xs font-semibold">
                Coming Soon
              </span>
            </SpotlightCard>

            {/* Card 4: Placement Assistant (Coming Soon) */}
            <SpotlightCard 
              className="p-6 bg-neutral-900/30 border border-neutral-950 rounded-xl opacity-65 flex flex-col justify-between h-48 cursor-not-allowed"
              spotlightColor="rgba(255, 255, 255, 0.05)"
            >
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">💼</span>
                  <h3 className="text-lg font-bold text-white">Placement Assistant</h3>
                </div>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Resume templates, mock interviews, and drive announcements.
                </p>
              </div>
              <span className="w-fit px-3 py-1 bg-neutral-950/60 text-neutral-500 border border-neutral-900 rounded-full text-xs font-semibold">
                Coming Soon
              </span>
            </SpotlightCard>
          </div>
        </div>

        {/* Right Side: Recent chats & quick actions */}
        <aside className="w-80 space-y-8 flex flex-col">
          {/* Recent Conversations */}
          <div className="bg-neutral-900/40 border border-neutral-900/80 p-5 rounded-xl flex-1 flex flex-col min-h-[220px]">
            <h3 className="text-md font-semibold text-neutral-300 border-b border-neutral-900 pb-3 flex items-center space-x-2">
              <FaHistory className="w-4 h-4 text-neutral-400" />
              <span>Recent Conversations</span>
            </h3>
            <div className="flex-1 flex flex-col justify-center mt-4">
              {isLoggedIn ? (
                recentChats.length > 0 ? (
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {recentChats.map((chat) => (
                      <div 
                        key={chat._id} 
                        onClick={() => setIsChatOpen(true)}
                        className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors cursor-pointer text-sm"
                      >
                        <p className="text-white font-medium truncate">{chat.question}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {new Date(chat.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-sm text-neutral-500 py-6">
                    No recent conversations.
                  </div>
                )
              ) : (
                <div className="text-center text-sm text-neutral-500 py-6 px-4">
                  Please log in as a User to keep track of your query history.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-neutral-900/40 border border-neutral-900/80 p-5 rounded-xl space-y-4">
            <h3 className="text-md font-semibold text-neutral-300 border-b border-neutral-900 pb-3">
              Quick Actions
            </h3>
            <ul className="space-y-2.5">
              <li>
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 text-sm text-left transition-all text-blue-400 font-medium cursor-pointer"
                >
                  <span>• Ask a Question</span>
                  <FaArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setIsDocsOpen(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 text-sm text-left transition-all text-emerald-400 font-medium cursor-pointer"
                >
                  <span>• Browse Documents</span>
                  <FaArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/admin")}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 text-sm text-left transition-all text-yellow-500 font-medium cursor-pointer"
                >
                  <span>• Upload PDF (Admin)</span>
                  <FaArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
            </ul>
          </div>
        </aside>
      </main>

      {/* Floating ChatBox View */}
      {isChatOpen && (
        <ChatBox onClose={() => setIsChatOpen(false)} />
      )}

      {/* Document Browser Modal */}
      {isDocsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-neutral-850 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FaFileAlt className="text-emerald-400 w-5 h-5" />
                <h3 className="text-lg font-bold text-white">Academic Documents</h3>
              </div>
              <button 
                onClick={() => setIsDocsOpen(false)}
                className="text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-750 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto flex flex-col justify-center items-center">
              {isAdmin ? (
                <div className="w-full space-y-4">
                  <p className="text-sm text-neutral-400 text-center">
                    You are logged in as Administrator. Navigate to the Admin Dashboard to manage files.
                  </p>
                  <button
                    onClick={() => navigate("/admin/dashboard")}
                    className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-neutral-950 font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer text-sm shadow-md"
                  >
                    <FaUpload className="w-4 h-4" />
                    <span>Go to Admin Document Dashboard</span>
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-neutral-950/60 rounded-full border border-neutral-850 flex items-center justify-center mx-auto shadow-inner text-emerald-400 text-2xl">
                    🔒
                  </div>
                  <h4 className="text-white font-semibold text-md">Access Restricted</h4>
                  <p className="text-neutral-400 text-sm max-w-md leading-relaxed">
                    Direct access to browse and download individual PDF source documents is restricted to administrators to preserve intellectual integrity.
                  </p>
                  <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3 text-emerald-400 text-xs">
                    💡 Suggestion: Open the AI Assistant to query the contents of these documents instantly!
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setIsDocsOpen(false);
                        setIsChatOpen(true);
                      }}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer text-sm shadow-md"
                    >
                      Open AI Assistant
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Portal;
