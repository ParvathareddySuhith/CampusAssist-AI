import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaSync } from "react-icons/fa";
import { getDashboardSummary } from "../../services/dashboardService";

// Import Utilities
import { buildTrendSeries } from "../../utils/timeSeries";
import {
  getMostStudiedTopic,
  getWeakestTopic,
  getAverageQuestionsPerDay,
  getMostActiveIntent,
  getCurrentStudyGoal,
  getProgressPercentage
} from "../../utils/dashboardInsights";

// Import Components
import StudentProfileCard from "./cards/StudentProfileCard";
import LearningProfileCard from "./cards/LearningProfileCard";
import AnalyticsOverview from "./cards/AnalyticsOverview";
import ProgressOverview from "./cards/ProgressOverview";
import RecommendationPanel from "./sections/RecommendationPanel";
import RecentActivityTimeline from "./sections/RecentActivityTimeline";

// Visualizations
import IntentDistributionChart from "./visualizations/IntentDistributionChart";
import StudyTrendChart from "./visualizations/StudyTrendChart";
import ProgressSummaryChart from "./visualizations/ProgressSummaryChart";
import LearningInsights from "./visualizations/LearningInsights";
import GoalProgressWidget from "./visualizations/GoalProgressWidget";

// Loading Skeleton placeholders matching card/grid structures to prevent layout shifts
const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse select-none" aria-hidden="true">
    {/* Profile Grid Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-[210px] bg-neutral-900/30 border border-neutral-800/60 rounded-xl" />
      <div className="h-[210px] bg-neutral-900/30 border border-neutral-800/60 rounded-xl" />
    </div>

    {/* Analytics Grid Skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-[105px] bg-neutral-900/30 border border-neutral-800/60 rounded-xl" />
      ))}
    </div>

    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-[260px] bg-neutral-900/30 border border-neutral-800/60 rounded-xl" />
      <div className="h-[260px] bg-neutral-900/30 border border-neutral-800/60 rounded-xl" />
    </div>

    {/* Progress & Goal Widget Skeletons */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-[220px] bg-neutral-900/30 border border-neutral-800/60 rounded-xl" />
      <div className="h-[220px] bg-neutral-900/30 border border-neutral-800/60 rounded-xl" />
    </div>

    {/* Insights Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-[140px] bg-neutral-900/30 border border-neutral-800/60 rounded-xl" />
      ))}
    </div>
  </div>
);

function LearningDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeAgo, setTimeAgo] = useState("just now");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      // Parallel loading orchestration supporting future widgets scalability
      const [summaryResponse] = await Promise.all([
        getDashboardSummary()
      ]);
      setData(summaryResponse);
      setLastUpdated(new Date());
      setTimeAgo("just now");
    } catch (err) {
      console.error("[LearningDashboardPage] Load failure:", err);
      let friendlyMsg = "Unable to connect. Please check your network connection and try again.";
      if (err.response) {
        if (err.response.status === 401) {
          friendlyMsg = "Your session has expired. Please log in again to view your stats.";
        } else if (err.response.status === 500) {
          friendlyMsg = "The dashboard service is temporarily unavailable. Please try again later.";
        }
      }
      setError(friendlyMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Update time-ago text periodically
  useEffect(() => {
    if (!lastUpdated) return;
    const interval = setInterval(() => {
      const seconds = Math.floor((new Date() - lastUpdated) / 1000);
      if (seconds < 60) {
        setTimeAgo("just now");
      } else {
        const mins = Math.floor(seconds / 60);
        setTimeAgo(`${mins}m ago`);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Memoize all derived data transformations once
  const memoizedMetrics = useMemo(() => {
    if (!data) return null;

    const recentActivity = data.recent_activity || [];
    const progressList = data.progress || [];
    const learningProfile = data.learning_profile || {};
    const analytics = data.analytics || {};

    const trendSeries = buildTrendSeries(recentActivity);
    const progressPercentage = getProgressPercentage(progressList);
    const currentStudyGoal = getCurrentStudyGoal(progressList);

    const insightsObj = {
      mostStudiedTopic: getMostStudiedTopic(recentActivity, progressList),
      weakestTopic: getWeakestTopic(learningProfile),
      averageQuestionsPerDay: getAverageQuestionsPerDay(recentActivity),
      mostActiveIntent: getMostActiveIntent(analytics),
      progressPercentage
    };

    return {
      trendSeries,
      progressPercentage,
      currentStudyGoal,
      insightsObj
    };
  }, [data]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
        <header className="space-y-1">
          <div className="h-9 w-64 bg-neutral-800/60 rounded animate-pulse" />
          <div className="h-4 w-96 bg-neutral-800/40 rounded animate-pulse mt-2" />
        </header>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <main className="max-w-xl mx-auto py-24 px-4 text-center select-none">
        <div className="p-8 bg-neutral-900/40 border border-neutral-850 rounded-2xl space-y-5">
          <div className="text-4xl" role="presentation">⚠️</div>
          <h2 className="text-lg font-bold text-white">Failed to load Dashboard</h2>
          <p className="text-sm text-neutral-400 leading-relaxed">{error}</p>
          <button
            onClick={() => loadDashboard(false)}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer select-none active:scale-95 shadow-md shadow-blue-600/10"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  // Determine empty state (new users with no questions asked)
  const isEmptyState = !data?.analytics || data.analytics.questions === 0;

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 space-y-8 select-none text-white">
      {/* Title Header with Refresh Controls */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Learning Dashboard</h1>
          <p className="text-neutral-450 text-sm">
            Monitor study trends, active progress tracks, and personalized insights.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs text-neutral-450 font-medium">
          {lastUpdated && <span>Updated {timeAgo}</span>}
          <button
            onClick={() => loadDashboard(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-900/60 hover:bg-neutral-850 border border-neutral-850 hover:border-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-all cursor-pointer shadow-sm active:scale-95 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Refresh dashboard data summary"
          >
            <FaSync className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {isEmptyState ? (
        <section aria-label="Welcome greeting" className="p-10 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-center space-y-4 shadow-md">
          <div className="text-5xl" role="presentation">🎓</div>
          <h2 className="text-2xl font-bold text-white">Welcome to CampusAssist!</h2>
          <p className="text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Start asking academic or career-related questions to build your personalized learning dashboard, monitor progress, and receive customized study tools.
          </p>
        </section>
      ) : (
        <>
          {/* Section 1: Academic & Learning Profiles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StudentProfileCard student={data?.student} />
            <LearningProfileCard learningProfile={data?.learning_profile} />
          </div>

          {/* Section 2: Analytics Cards Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-450 uppercase tracking-wider">
              Quick Statistics
            </h3>
            <AnalyticsOverview analytics={data?.analytics} />
          </div>

          {/* Section 3: Visual Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IntentDistributionChart data={data?.analytics} />
            <StudyTrendChart series={memoizedMetrics?.trendSeries} />
          </div>

          {/* Section 4: Progress Summaries & Goal widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressSummaryChart progressList={data?.progress} />
            <GoalProgressWidget 
              percentage={memoizedMetrics?.progressPercentage} 
              currentGoal={memoizedMetrics?.currentStudyGoal} 
            />
          </div>

          {/* Section 5: Learning Insights list */}
          <LearningInsights 
            insights={memoizedMetrics?.insightsObj} 
            streak={data?.learning_profile?.study_streak || 0}
            mode={data?.learning_profile?.preferred_mode || "Quiz"}
          />

          {/* Section 6: Recommendations & Activity timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RecommendationPanel 
                recommendations={data?.recommendations} 
                error={data?.recommendations?.error} 
              />
            </div>
            <div>
              <RecentActivityTimeline activities={data?.recent_activity} />
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default LearningDashboardPage;
export { DashboardSkeleton };
