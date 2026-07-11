/**
 * Formats a date timestamp into a human-readable relative time string.
 * @param {string|Date} timestamp - The ISO date string or Date object.
 * @returns {string} Relative time description (e.g. "Just now", "5 minutes ago", "Yesterday", "3 days ago")
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "";
  try {
    const date = new Date(timestamp);
    // Handle invalid date objects
    if (isNaN(date.getTime())) {
      return "";
    }
    
    const now = new Date();
    const diffMs = now - date;
    
    // If the difference is negative (slight clock diffs or future events), treat as just now
    if (diffMs < 0) {
      return "Just now";
    }
    
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return "Just now";
    }
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    }
    if (diffDays === 1) {
      return "Yesterday";
    }
    if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    }
    
    // Fallback: Format as Month Day, Year (e.g., "Jul 11, 2026")
    return date.toLocaleDateString('en-US', { month: "short", day: "numeric", year: "numeric" });
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "";
  }
};
