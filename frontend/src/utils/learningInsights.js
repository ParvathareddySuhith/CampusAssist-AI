import { DAILY_GOAL } from "../constants/analytics";

/**
 * Generates rule-based learning insights from the normalized dashboardModel.
 * Decouples logic from UI rendering.
 * 
 * @param {Object} model - The normalized dashboard model
 * @returns {Array<Object>} List of insights with { id, title, message, priority }
 */
export const generateInsights = (model) => {
  const insights = [];

  if (!model || model.totalQuestions === 0) {
    insights.push({
      id: "no-activity",
      title: "Begin Your Learning Journey 🚀",
      message: "Start asking questions to CampusAssist AI in the Chat Assistant or Study Assistant to populate your learning statistics.",
      priority: "MEDIUM"
    });
    return insights;
  }

  // 1. Daily goal progress insights
  if (model.todayQuestions >= DAILY_GOAL) {
    insights.push({
      id: "daily-goal-achieved",
      title: "Daily Goal Achieved! 🎉",
      message: `You've asked ${model.todayQuestions} queries today, meeting your daily goal of ${DAILY_GOAL}. Fantastic dedication!`,
      priority: "HIGH"
    });
  } else if (model.todayQuestions > 0) {
    const diff = DAILY_GOAL - model.todayQuestions;
    insights.push({
      id: "daily-goal-progress",
      title: "Keep the Momentum Going! 💪",
      message: `You are ${diff} query${diff > 1 ? 's' : ''} away from hitting your daily goal of ${DAILY_GOAL}. Try asking a question in Study Assistant.`,
      priority: "LOW"
    });
  }

  // 2. Focus distribution insights
  const { academicQuestions, placementQuestions, campusQuestions, documentQuestions, generalQuestions } = model;
  const categories = [
    { name: "Academic", count: academicQuestions },
    { name: "Placement", count: placementQuestions },
    { name: "Campus", count: campusQuestions },
    { name: "Document", count: documentQuestions },
    { name: "General", count: generalQuestions }
  ];

  // Sort to find dominant categories
  categories.sort((a, b) => b.count - a.count);
  const topCategory = categories[0];

  if (topCategory.count > 0) {
    if (topCategory.name === "Academic") {
      insights.push({
        id: "academic-dominant",
        title: "Academic Focus Dominant 📚",
        message: "You are focusing heavily on academic queries. Make sure to complement this by reviewing placement preps or taking mock interviews.",
        priority: "MEDIUM"
      });
    } else if (topCategory.name === "Placement") {
      insights.push({
        id: "placement-dominant",
        title: "Placement Prep Focus 💼",
        message: "Excellent placement preparation activity. Keep practicing, but don't forget to regularly check Core CS academic concepts like DBMS and OS.",
        priority: "MEDIUM"
      });
    } else if (topCategory.name === "Document") {
      insights.push({
        id: "document-dominant",
        title: "Document Search Active 📄",
        message: "You are retrieving information from uploaded course material frequently. Use Study Assistant to generate quizzes on these topics to test retention.",
        priority: "LOW"
      });
    } else if (topCategory.name === "General" && topCategory.count >= 5) {
      insights.push({
        id: "general-heavy",
        title: "Explore Core Features 🌟",
        message: "Try asking queries related to DBMS/OS or upload resumes to get detailed analyses and specialized help.",
        priority: "LOW"
      });
    }
  }

  // 3. Last activity warning
  if (model.lastActivity) {
    const lastActiveTime = new Date(model.lastActivity).getTime();
    const daysSinceActive = (Date.now() - lastActiveTime) / (1000 * 60 * 60 * 24);
    if (daysSinceActive > 3) {
      insights.push({
        id: "inactivity-warning",
        title: "Consistency is Key ⏳",
        message: "It has been a few days since your last study session. Try asking a quick question today to refresh your memory.",
        priority: "MEDIUM"
      });
    }
  }

  return insights;
};
