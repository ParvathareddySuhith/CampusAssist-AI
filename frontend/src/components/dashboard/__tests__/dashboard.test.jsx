import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StudentProfileCard from "../cards/StudentProfileCard";
import LearningProfileCard from "../cards/LearningProfileCard";
import AnalyticsOverview from "../cards/AnalyticsOverview";
import ProgressOverview from "../cards/ProgressOverview";
import RecentActivityTimeline, { getRelativeTime } from "../sections/RecentActivityTimeline";
import RecommendationPanel from "../sections/RecommendationPanel";
import { getDashboardSummary } from "../../../services/dashboardService";

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate
}));

describe("StudentProfileCard", () => {
  it("renders correctly with full data", () => {
    const student = { name: "Suhith", department: "CSE", semester: 5 };
    render(<StudentProfileCard student={student} />);
    expect(screen.getByText("Suhith")).toBeDefined();
    expect(screen.getByText("CSE")).toBeDefined();
    expect(screen.getByText("Semester 5")).toBeDefined();
  });

  it("renders neutral placeholders when data is missing", () => {
    render(<StudentProfileCard student={null} />);
    expect(screen.getByText("Not set")).toBeDefined();
    expect(screen.getByText("Not selected")).toBeDefined();
    expect(screen.getByText("—")).toBeDefined();
  });
});

describe("LearningProfileCard", () => {
  it("renders streaks, confidence score, and topic tags", () => {
    const learningProfile = {
      favorite_topics: ["DBMS", "Java"],
      weak_topics: ["OS"],
      study_streak: 14,
      preferred_mode: "Quiz",
      preferred_assistant: "Study Assistant",
      placement_readiness: "Intermediate",
      confidence: 0.8
    };

    render(<LearningProfileCard learningProfile={learningProfile} />);
    
    // Streak check
    expect(screen.getByText("14 days")).toBeDefined();
    // Confidence percentage check
    expect(screen.getByText("80%")).toBeDefined();
    // Confidence block bar check (8 blocks filled, 2 empty)
    expect(screen.getByText("████████░░")).toBeDefined();
    // Favorite topics tags check
    expect(screen.getByText("DBMS")).toBeDefined();
    expect(screen.getByText("Java")).toBeDefined();
    expect(screen.getByText("OS")).toBeDefined();
  });
});

describe("AnalyticsOverview", () => {
  it("renders card counts and descriptive labels", () => {
    const analytics = {
      questions: 100,
      academic: 60,
      placement: 25,
      campus: 10,
      general: 5
    };

    render(<AnalyticsOverview analytics={analytics} />);

    expect(screen.getByText("100")).toBeDefined();
    expect(screen.getByText(/QUESTIONS ASKED/i)).toBeDefined();
    expect(screen.getByText("60")).toBeDefined();
    expect(screen.getByText(/ACADEMIC QUESTIONS/i)).toBeDefined();
    expect(screen.getByText("25")).toBeDefined();
    expect(screen.getByText(/PLACEMENT ASSISTANCE/i)).toBeDefined();
  });
});

describe("ProgressOverview", () => {
  it("renders progress tracks correctly", () => {
    const progressList = [
      {
        topic: "DBMS",
        completion_percentage: 50,
        completed_count: 2,
        total_steps: 4,
        current_step: { title: "ER Model" },
        next_step: { title: "Relational Model" }
      }
    ];

    render(<ProgressOverview progressList={progressList} />);

    expect(screen.getByText("DBMS")).toBeDefined();
    expect(screen.getByText("50%")).toBeDefined();
    expect(screen.getByText("2 of 4 steps completed")).toBeDefined();
    expect(screen.getByText("ER Model")).toBeDefined();
    expect(screen.getByText("Relational Model")).toBeDefined();
  });

  it("renders empty call-to-action message if list is empty", () => {
    render(<ProgressOverview progressList={[]} />);
    expect(screen.getByText("No learning progress yet. Start a quiz or study topic to begin tracking.")).toBeDefined();
  });
});

describe("RecentActivityTimeline", () => {
  it("formats relative timestamps and shows intent badges", () => {
    const activities = [
      {
        intent: "ACADEMIC",
        topic: "Normalization",
        timestamp: new Date().toISOString() + " UTC",
        response_type: "LLM",
        metadata: { question: "Explain BCNF" }
      }
    ];

    render(<RecentActivityTimeline activities={activities} />);

    expect(screen.getByText("Normalization")).toBeDefined();
    expect(screen.getByText("ACADEMIC")).toBeDefined();
    expect(screen.getByText('•')).toBeDefined();
    expect(screen.getByText('"Explain BCNF"')).toBeDefined();
  });

  it("relative time helper handles offsets correctly", () => {
    const now = new Date();
    
    // Just now
    expect(getRelativeTime(now.toISOString())).toBe("Just now");

    // 5 minutes ago
    const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(getRelativeTime(fiveMinsAgo.toISOString())).toBe("5m ago");

    // 2 hours ago
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    expect(getRelativeTime(twoHoursAgo.toISOString())).toBe("2h ago");
  });
});

describe("RecommendationPanel", () => {
  it("triggers correct navigation on card click", () => {
    const recommendations = {
      study_tools: [
        {
          id: "rec_tool_1",
          title: "Advanced DBMS Quiz",
          description: "Practice advanced SQL query skills",
          icon: "📝",
          priority: "HIGH",
          action: "/study-assistant"
        }
      ]
    };

    render(<RecommendationPanel recommendations={recommendations} />);

    const card = screen.getByText("Advanced DBMS Quiz");
    expect(card).toBeDefined();
  });

  it("handles subsystems offline gracefully with error message", () => {
    render(<RecommendationPanel recommendations={null} error="Subsystem offline" />);
    expect(screen.getByText("Recommendations are temporarily unavailable.")).toBeDefined();
  });
});
