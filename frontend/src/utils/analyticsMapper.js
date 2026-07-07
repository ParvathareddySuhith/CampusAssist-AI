/**
 * Maps raw backend analytics API response data into a clean, normalized
 * dashboard model. Decouples UI components from changes to the backend schema.
 * 
 * @param {Object} rawData - Raw JSON response from /api/analytics/summary
 * @returns {Object} Normalized dashboardModel
 */
export const mapSummaryToDashboardModel = (rawData) => {
  if (!rawData) {
    return {
      totalQuestions: 0,
      academicQuestions: 0,
      placementQuestions: 0,
      campusQuestions: 0,
      documentQuestions: 0,
      generalQuestions: 0,
      favoriteTopics: [],
      lastActivity: null,
      todayQuestions: 0,
      sessionQuestions: 0,
    };
  }

  return {
    totalQuestions: Number(rawData.total_questions || 0),
    academicQuestions: Number(rawData.academic_questions || 0),
    placementQuestions: Number(rawData.placement_questions || 0),
    campusQuestions: Number(rawData.campus_questions || 0),
    documentQuestions: Number(rawData.document_questions || 0),
    generalQuestions: Number(rawData.general_questions || 0),
    favoriteTopics: Array.isArray(rawData.favorite_topics)
      ? rawData.favorite_topics.map(t => {
          if (typeof t === 'string') {
            return { topic: t, count: null };
          }
          return {
            topic: t?.topic || 'Unknown',
            count: typeof t?.count === 'number' ? t.count : null
          };
        })
      : [],
    lastActivity: rawData.last_activity ? new Date(rawData.last_activity) : null,
    todayQuestions: Number(rawData.today_questions || 0),
    sessionQuestions: Number(rawData.session_questions || 0),
  };
};
