import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { groupActivityByDay, fillMissingDates, buildTrendSeries } from "../../../utils/timeSeries";
import {
  getMostStudiedTopic,
  getWeakestTopic,
  getAverageQuestionsPerDay,
  getMostActiveIntent,
  getCurrentStudyGoal,
  getProgressPercentage
} from "../../../utils/dashboardInsights";

import IntentDistributionChart from "../visualizations/IntentDistributionChart";
import StudyTrendChart from "../visualizations/StudyTrendChart";
import ProgressSummaryChart from "../visualizations/ProgressSummaryChart";
import LearningInsights from "../visualizations/LearningInsights";
import GoalProgressWidget from "../visualizations/GoalProgressWidget";

describe("TimeSeries Utility", () => {
  it("groups activity by calendar day", () => {
    const activity = [
      { timestamp: "2026-07-10T12:00:00Z" },
      { timestamp: "2026-07-10T14:30:00Z" },
      { timestamp: "2026-07-09T09:00:00Z" }
    ];
    const grouped = groupActivityByDay(activity);
    expect(grouped["2026-07-10"]).toBe(2);
    expect(grouped["2026-07-09"]).toBe(1);
  });

  it("fills missing dates for continuous series", () => {
    const grouped = {
      [new Date().toISOString().split("T")[0]]: 3
    };
    const dataset = fillMissingDates(grouped, 7);
    expect(dataset.length).toBe(7);
    expect(dataset[6].count).toBe(3); // Today's activity
    expect(dataset[0].count).toBe(0); // 6 days ago activity
  });
});

describe("DashboardInsights Utility", () => {
  it("computes studied topics correctly", () => {
    const activity = [
      { topic: "DBMS" },
      { topic: "DBMS" },
      { topic: "OS" }
    ];
    const progress = [
      { topic: "DBMS", completed_count: 2 },
      { topic: "Java", completed_count: 1 }
    ];
    const topTopic = getMostStudiedTopic(activity, progress);
    expect(topTopic).toBe("DBMS");
  });

  it("handles fallback values cleanly", () => {
    expect(getMostStudiedTopic([], [])).toBe("Not set");
    expect(getWeakestTopic(null)).toBe("None identified");
    expect(getAverageQuestionsPerDay([])).toBe(0);
    expect(getMostActiveIntent({})).toBe("None");
  });
});

describe("IntentDistributionChart", () => {
  it("renders correctly with analytic values", () => {
    const data = { academic: 12, placement: 5, campus: 2, document: 0, general: 1 };
    render(<IntentDistributionChart data={data} />);
    expect(screen.getByText("Academic")).toBeDefined();
    expect(screen.getByText("Placement")).toBeDefined();
    expect(screen.getByText("Campus")).toBeDefined();
  });
});

describe("StudyTrendChart", () => {
  it("renders trend coordinates", () => {
    const series = [
      { date: "2026-07-04", count: 1, label: "Sat" },
      { date: "2026-07-05", count: 2, label: "Sun" },
      { date: "2026-07-06", count: 0, label: "Mon" },
      { date: "2026-07-07", count: 5, label: "Tue" },
      { date: "2026-07-08", count: 3, label: "Wed" },
      { date: "2026-07-09", count: 0, label: "Thu" },
      { date: "2026-07-10", count: 4, label: "Fri" }
    ];
    render(<StudyTrendChart series={series} />);
    expect(screen.getByText("Study Activity Trend")).toBeDefined();
  });
});

describe("GoalProgressWidget", () => {
  it("displays circle circumference, active goals and steps", () => {
    const currentGoal = {
      topic: "DBMS",
      current_step: { title: "Indexing" },
      next_step: { title: "Transactions" }
    };
    render(<GoalProgressWidget percentage={75} currentGoal={currentGoal} />);
    expect(screen.getByText("75%")).toBeDefined();
    expect(screen.getByText("Indexing")).toBeDefined();
    expect(screen.getByText("Transactions")).toBeDefined();
  });
});
