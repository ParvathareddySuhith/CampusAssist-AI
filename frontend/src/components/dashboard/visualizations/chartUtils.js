/**
 * Helper to calculate inner chart dimensions based on width, height, and margins.
 */
export const calculateChartDimensions = (width = 500, height = 300, margins = { top: 20, right: 20, bottom: 30, left: 40 }) => {
  const innerWidth = Math.max(0, width - margins.left - margins.right);
  const innerHeight = Math.max(0, height - margins.top - margins.bottom);
  return { innerWidth, innerHeight };
};

/**
 * Normalize array of numeric values into height coordinates matching SVG dimensions.
 */
export const normalizeValues = (values = [], maxVal = 10, minVal = 0, scaleRange = 200) => {
  const range = maxVal - minVal || 1;
  return values.map(val => {
    const clampedVal = Math.max(minVal, Math.min(maxVal, val));
    // SVG coordinates start at top (0,0), so we invert height coordinates
    return scaleRange - ((clampedVal - minVal) / range) * scaleRange;
  });
};

/**
 * Generate SVG path data 'd' command string from a list of coordinate points.
 * Generates a curved path if isCurved is true.
 */
export const buildSvgPath = (points = [], isCurved = false) => {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  if (!isCurved) {
    return points.reduce((acc, p, idx) => {
      const command = idx === 0 ? "M" : "L";
      return `${acc} ${command} ${p.x} ${p.y}`;
    }, "");
  }

  // Smooth bezier spline connector
  let pathStr = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    // Control points halfway between x values
    const cpX1 = curr.x + (next.x - curr.x) / 2;
    const cpY1 = curr.y;
    const cpX2 = curr.x + (next.x - curr.x) / 2;
    const cpY2 = next.y;
    pathStr += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
  }
  return pathStr;
};

/**
 * Clamp percentage values to valid [0, 100] bounds.
 */
export const clampPercentage = (percentage = 0) => {
  return Math.max(0, Math.min(100, Math.round(percentage)));
};

/**
 * Retrieve spacing configurations based on screen breakpoints.
 */
export const getResponsiveMargins = (screenWidth = 1024) => {
  if (screenWidth < 640) {
    return { top: 15, right: 15, bottom: 25, left: 30 }; // Mobile margins
  }
  return { top: 20, right: 25, bottom: 35, left: 45 }; // Desktop margins
};
