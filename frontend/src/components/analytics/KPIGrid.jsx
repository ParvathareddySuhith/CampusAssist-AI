import React from "react";
import KPIWidget from "./KPIWidget";
import { FaComments, FaCalendarCheck, FaHourglassHalf, FaCompass } from "react-icons/fa";
import { DAILY_GOAL } from "../../constants/analytics";

function KPIGrid({ dashboardModel }) {
  const {
    totalQuestions = 0,
    academicQuestions = 0,
    placementQuestions = 0,
    campusQuestions = 0,
    documentQuestions = 0,
    generalQuestions = 0,
    todayQuestions = 0,
    sessionQuestions = 0,
  } = dashboardModel;

  // Determine top focus category
  const categories = [
    { name: "Academic", count: academicQuestions },
    { name: "Placement", count: placementQuestions },
    { name: "Campus", count: campusQuestions },
    { name: "Documents", count: documentQuestions },
    { name: "General", count: generalQuestions },
  ];
  categories.sort((a, b) => b.count - a.count);
  const topFocus = categories[0]?.count > 0 ? categories[0].name : "None";

  // Build configuration array for KPIs
  const kpiConfigs = [
    {
      title: "Total Questions",
      value: totalQuestions,
      icon: FaComments,
      color: "rgba(59, 130, 246, 0.15)", // Blue glow
      subtitle: "Total queries answered"
    },
    {
      title: "Daily Progress",
      value: `${todayQuestions}/${DAILY_GOAL}`,
      icon: FaCalendarCheck,
      color: "rgba(16, 185, 129, 0.15)", // Emerald glow
      subtitle: todayQuestions >= DAILY_GOAL ? "Daily goal reached! 🎉" : `${DAILY_GOAL - todayQuestions} left to reach goal`
    },
    {
      title: "Active Session",
      value: sessionQuestions,
      icon: FaHourglassHalf,
      color: "rgba(139, 92, 246, 0.15)", // Violet glow
      subtitle: "Queries in this session"
    },
    {
      title: "Study Focus",
      value: topFocus,
      icon: FaCompass,
      color: "rgba(245, 158, 11, 0.15)", // Amber glow
      subtitle: topFocus !== "None" ? "Most queried category" : "Ask questions to set focus"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      {kpiConfigs.map((kpi, idx) => (
        <KPIWidget
          key={idx}
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          color={kpi.color}
          subtitle={kpi.subtitle}
        />
      ))}
    </div>
  );
}

export default KPIGrid;
