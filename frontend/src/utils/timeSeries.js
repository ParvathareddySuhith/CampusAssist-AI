/**
 * Group recent learning events by calendar date.
 * @param {Array} recentActivity 
 * @returns {Object} Key-value map of date to count
 */
export const groupActivityByDay = (recentActivity = []) => {
  const counts = {};
  recentActivity.forEach(act => {
    if (act.timestamp) {
      // Extract date string YYYY-MM-DD
      const dateStr = act.timestamp.split("T")[0];
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    }
  });
  return counts;
};

/**
 * Interpolate missing days in the activity series to ensure continuous visual charting.
 * @param {Object} groupedData 
 * @param {number} daysCount 
 * @returns {Array} Array of activity coordinates
 */
export const fillMissingDates = (groupedData = {}, daysCount = 7) => {
  const dataset = [];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = groupedData[dateStr] || 0;
    const label = daysOfWeek[d.getDay()];

    dataset.push({
      date: dateStr,
      count,
      label
    });
  }

  return dataset;
};

/**
 * Process recent activity list into an aggregated 7-day chronological chart series.
 * @param {Array} recentActivity 
 * @param {number} daysCount 
 * @returns {Array} List of processed date-count coordinate objects
 */
export const buildTrendSeries = (recentActivity = [], daysCount = 7) => {
  const grouped = groupActivityByDay(recentActivity);
  return fillMissingDates(grouped, daysCount);
};
