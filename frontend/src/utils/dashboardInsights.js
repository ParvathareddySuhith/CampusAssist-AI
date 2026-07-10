/**
 * Compute the student's most studied topic based on recent activity and progress roadmaps.
 * @param {Array} recentActivity 
 * @param {Array} progressList 
 * @returns {string} Most studied topic name or fallback
 */
export const getMostStudiedTopic = (recentActivity = [], progressList = []) => {
  if (recentActivity.length === 0 && progressList.length === 0) {
    return "Not set";
  }
  
  const counts = {};
  
  // Count from recent activities
  recentActivity.forEach(act => {
    if (act.topic) {
      counts[act.topic] = (counts[act.topic] || 0) + 1;
    }
  });

  // Factor in progress tracks (higher completion = more studied)
  progressList.forEach(prog => {
    if (prog.topic) {
      counts[prog.topic] = (counts[prog.topic] || 0) + (prog.completed_count || 1);
    }
  });

  let maxTopic = "Not set";
  let maxCount = 0;
  
  Object.entries(counts).forEach(([topic, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxTopic = topic;
    }
  });

  return maxTopic;
};

/**
 * Identify the student's weakest topic from their adaptive learning profile.
 * @param {Object} learningProfile 
 * @returns {string} Weakest topic name or fallback
 */
export const getWeakestTopic = (learningProfile = {}) => {
  const weakTopics = learningProfile?.weak_topics || [];
  return weakTopics.length > 0 ? weakTopics[0] : "None identified";
};

/**
 * Calculate the average number of questions asked per day over the active timeline.
 * @param {Array} recentActivity 
 * @returns {number} Average questions count
 */
export const getAverageQuestionsPerDay = (recentActivity = []) => {
  if (recentActivity.length === 0) return 0.0;
  
  // Group activities by distinct dates
  const dates = new Set();
  recentActivity.forEach(act => {
    if (act.timestamp) {
      const dateStr = act.timestamp.split("T")[0];
      dates.add(dateStr);
    }
  });
  
  const activeDays = dates.size || 1;
  const avg = recentActivity.length / activeDays;
  return parseFloat(avg.toFixed(1));
};

/**
 * Determine the intent category with the highest interaction count.
 * @param {Object} analytics 
 * @returns {string} Most active intent category
 */
export const getMostActiveIntent = (analytics = {}) => {
  const categories = {
    Academic: analytics?.academic ?? 0,
    Placement: analytics?.placement ?? 0,
    Campus: analytics?.campus ?? 0,
    Document: analytics?.document ?? 0,
    General: analytics?.general ?? 0
  };

  let maxCategory = "None";
  let maxCount = 0;

  Object.entries(categories).forEach(([category, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxCategory = category;
    }
  });

  return maxCategory;
};

/**
 * Retrieve the active study track which has not yet reached 100% completion.
 * @param {Array} progressList 
 * @returns {Object|null} Active study goal details or null
 */
export const getCurrentStudyGoal = (progressList = []) => {
  if (!Array.isArray(progressList) || progressList.length === 0) {
    return null;
  }
  // Find first non-completed roadmap track
  return progressList.find(prog => (prog.completion_percentage ?? 0) < 100) || progressList[0];
};

/**
 * Calculate the average completion percentage across all active learning roadmaps.
 * @param {Array} progressList 
 * @returns {number} Average completion percentage
 */
export const getProgressPercentage = (progressList = []) => {
  if (!Array.isArray(progressList) || progressList.length === 0) {
    return 0;
  }
  const total = progressList.reduce((acc, prog) => acc + (prog.completion_percentage ?? 0), 0);
  return Math.round(total / progressList.length);
};
