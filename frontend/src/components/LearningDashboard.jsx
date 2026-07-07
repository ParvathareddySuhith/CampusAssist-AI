import React, { useState, useEffect, useCallback } from "react";
import { getSummary } from "../services/analyticsService";
import { mapSummaryToDashboardModel } from "../utils/analyticsMapper";
import { generateInsights } from "../utils/learningInsights";
import KPIGrid from "./analytics/KPIGrid";
import IntentChart from "./analytics/charts/IntentChart";
import FavoriteTopics from "./analytics/FavoriteTopics";
import InsightCard from "./analytics/InsightCard";
import EmptyDashboard from "./analytics/EmptyDashboard";
import DashboardSkeleton from "./analytics/DashboardSkeleton";
import { FaSync } from "react-icons/fa";

function LearningDashboard() {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeAgo, setTimeAgo] = useState("just now");

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await getSummary();
      const mappedModel = mapSummaryToDashboardModel(data);
      setModel(mappedModel);
      setLastUpdated(new Date());
      setTimeAgo("just now");
    } catch (err) {
      console.error("Dashboard data load failure:", err);
      let friendlyMsg = "Unable to connect. Please check your internet connection and try again.";
      if (err.response) {
        if (err.response.status === 401) {
          friendlyMsg = "Your session has expired. Please log in again to view your stats.";
        } else if (err.response.status === 500) {
          friendlyMsg = "Learning Analytics service is temporarily unavailable. Please try again later.";
        }
      }
      setError(friendlyMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Update time-ago text periodically
  useEffect(() => {
    if (!lastUpdated) return;
    const interval = setInterval(() => {
      const seconds = Math.floor((new Date() - lastUpdated) / 1000);
      if (seconds < 60) {
        setTimeAgo("just now");
      } else {
        const mins = Math.floor(seconds / 60);
        setTimeAgo(`${mins} min${mins > 1 ? "s" : ""} ago`);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
        <h2 className="text-3xl font-extrabold text-white">Learning Analytics</h2>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="p-8 bg-neutral-900/40 border border-rose-500/20 rounded-2xl space-y-4">
          <div className="text-4xl">⚠️</div>
          <h3 className="text-lg font-bold text-white">Failed to load Dashboard</h3>
          <p className="text-sm text-neutral-400">{error}</p>
          <button
            onClick={() => fetchAnalytics(false)}
            className="px-5 py-2 bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const insights = generateInsights(model);
  const isEmpty = model.totalQuestions === 0;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-8 select-none">
      {/* Title Header with Refresh controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Learning Dashboard</h2>
          <p className="text-neutral-450 text-sm">
            Monitor query trends, topics of focus, and study recommendations.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs text-neutral-450 font-medium">
          {lastUpdated && <span>Updated {timeAgo}</span>}
          <button
            onClick={() => fetchAnalytics(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-900/60 hover:bg-neutral-850 border border-neutral-850 hover:border-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
            aria-label="Refresh analytics summary data"
          >
            <FaSync className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <KPIGrid dashboardModel={model} />

      {/* Main Charts & Topics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <IntentChart dashboardModel={model} />
        <FavoriteTopics topics={model.favoriteTopics} />
      </div>

      {/* Personalized Insights Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-3">
          <span className="text-xl">💡</span>
          <span>Study Insights</span>
        </h3>
        <div className="space-y-3.5">
          {insights.map((insight) => (
            <InsightCard
              key={insight.id}
              title={insight.title}
              message={insight.message}
              priority={insight.priority}
            />
          ))}
        </div>
      </div>

      {/* Encouraging empty state if no questions have been asked */}
      {isEmpty && <EmptyDashboard />}
    </div>
  );
}

export default LearningDashboard;
