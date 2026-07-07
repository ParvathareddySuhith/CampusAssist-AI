import React from "react";
import { useNavigate } from "react-router-dom";
import SpotlightCard from "../ui/SpotlightCard";
import { FaArrowRight } from "react-icons/fa";

function EmptyDashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto py-12 px-4 animate-fade-in">
      <SpotlightCard
        className="p-8 bg-neutral-900/40 border border-neutral-900 rounded-2xl text-center space-y-6 flex flex-col items-center justify-center"
        spotlightColor="rgba(59, 130, 246, 0.1)"
      >
        <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-4xl shadow-inner animate-bounce">
          🚀
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white tracking-tight">
            Your learning journey starts here!
          </h3>
          <p className="text-sm text-neutral-450 leading-relaxed max-w-sm">
            Ask your first question to CampusAssist AI. Once you interact with the chatbot, your personalized learning stats, focus summaries, and study insights will show up here.
          </p>
        </div>

        <button
          onClick={() => navigate("/assistant")}
          className="w-fit px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-all cursor-pointer shadow-md hover:shadow-blue-500/20 flex items-center space-x-2"
        >
          <span>Ask Your First Question</span>
          <FaArrowRight className="w-3.5 h-3.5" />
        </button>
      </SpotlightCard>
    </div>
  );
}

export default EmptyDashboard;
