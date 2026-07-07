import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SpotlightCard from "./ui/SpotlightCard";
import { 
  FaFileAlt, 
  FaHistory, 
  FaChevronRight, 
  FaArrowRight,
  FaChartLine
} from "react-icons/fa";
import { getChatHistory } from "../lib/api";

function Portal() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("Suhith");
  const [recentChats, setRecentChats] = useState([]);

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
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
  }, []);

  return (
    <div className="w-full flex flex-col font-sans select-none text-white relative z-10 space-y-8">
      {/* Greeting banner */}
      <div className="space-y-2">
        <h2 className="text-4xl font-extrabold tracking-tight">
          Hello {username} 👋
        </h2>
        <p className="text-neutral-450 text-lg">
          Your intelligent campus companion.
        </p>
      </div>

      {/* Main Grid Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Cards Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <p className="text-neutral-450 text-sm leading-relaxed">
                Ask academic or campus-related questions.
              </p>
            </div>
            <button 
              onClick={() => navigate("/assistant")}
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
              <p className="text-neutral-450 text-sm leading-relaxed">
                Browse uploaded academic documents.
              </p>
            </div>
            <button 
              onClick={() => navigate("/documents")}
              className="w-fit mt-4 px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white rounded-lg text-sm font-medium transition-all cursor-pointer shadow-md flex items-center space-x-1.5"
            >
              <span>Browse Documents</span>
              <FaChevronRight className="w-3 h-3" />
            </button>
          </SpotlightCard>

          {/* Card 3: Study Assistant */}
          <SpotlightCard 
            className="p-6 bg-neutral-900/60 border border-neutral-800 rounded-xl hover:border-violet-500/30 transition-all flex flex-col justify-between h-48"
            spotlightColor="rgba(139, 92, 246, 0.15)"
          >
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">📚</span>
                <h3 className="text-lg font-bold text-white">Study Assistant</h3>
              </div>
              <p className="text-neutral-450 text-sm leading-relaxed">
                Generate quizzes, flashcards, revision notes, and custom study guides.
              </p>
            </div>
            <button 
              onClick={() => navigate("/study-assistant")}
              className="w-fit mt-4 px-4 py-2 bg-violet-600/20 text-violet-400 border border-violet-500/30 hover:bg-violet-600 hover:text-white rounded-lg text-sm font-medium transition-all cursor-pointer shadow-md flex items-center space-x-1.5"
            >
              <span>Open Study Assistant</span>
              <FaChevronRight className="w-3 h-3" />
            </button>
          </SpotlightCard>

          {/* Card 4: Placement Assistant */}
          <SpotlightCard 
            className="p-6 bg-neutral-900/60 border border-neutral-800 rounded-xl hover:border-emerald-500/30 transition-all flex flex-col justify-between h-48"
            spotlightColor="rgba(16, 185, 129, 0.15)"
          >
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">💼</span>
                <h3 className="text-lg font-bold text-white">Placement Assistant</h3>
              </div>
              <p className="text-neutral-450 text-sm leading-relaxed">
                Resume reviews, mock technical & HR interviews, roadmaps, and company prep.
              </p>
            </div>
            <button 
              onClick={() => navigate("/placement-assistant")}
              className="w-fit mt-4 px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white rounded-lg text-sm font-medium transition-all cursor-pointer shadow-md flex items-center space-x-1.5"
            >
              <span>Open Placement Assistant</span>
              <FaChevronRight className="w-3 h-3" />
            </button>
          </SpotlightCard>

          {/* Card 5: Learning Dashboard */}
          <SpotlightCard 
            className="p-6 bg-neutral-900/60 border border-neutral-800 rounded-xl hover:border-blue-500/30 transition-all flex flex-col justify-between h-48"
            spotlightColor="rgba(59, 130, 246, 0.15)"
          >
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">📈</span>
                <h3 className="text-lg font-bold text-white">Learning Dashboard</h3>
              </div>
              <p className="text-neutral-450 text-sm leading-relaxed">
                View your study focus, question stats, and personalized learning insights.
              </p>
            </div>
            <button 
              onClick={() => navigate("/learning-dashboard")}
              className="w-fit mt-4 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-medium transition-all cursor-pointer shadow-md flex items-center space-x-1.5"
            >
              <span>Open Dashboard</span>
              <FaChevronRight className="w-3 h-3" />
            </button>
          </SpotlightCard>
        </div>

        {/* Right Side: Recent chats & quick actions */}
        <aside className="w-full lg:w-80 space-y-6 flex flex-col">
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
                        onClick={() => navigate("/assistant")}
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
                  onClick={() => navigate("/assistant")}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 text-sm text-left transition-all text-blue-400 font-medium cursor-pointer"
                >
                  <span>• Ask a Question</span>
                  <FaArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/documents")}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 text-sm text-left transition-all text-emerald-400 font-medium cursor-pointer"
                >
                  <span>• Browse Documents</span>
                  <FaArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/study-assistant")}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 text-sm text-left transition-all text-violet-400 font-medium cursor-pointer"
                >
                  <span>• Study Assistant</span>
                  <FaArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/placement-assistant")}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 text-sm text-left transition-all text-emerald-400 font-medium cursor-pointer"
                >
                  <span>• Placement Assistant</span>
                  <FaArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/learning-dashboard")}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 text-sm text-left transition-all text-blue-400 font-medium cursor-pointer"
                >
                  <span>• Learning Dashboard</span>
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
      </div>
    </div>
  );
}

export default Portal;
