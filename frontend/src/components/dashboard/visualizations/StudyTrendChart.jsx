import React, { useState, useEffect } from "react";
import { calculateChartDimensions, normalizeValues, buildSvgPath } from "./chartUtils";

function StudyTrendChart({ series = [] }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [screenWidth, setScreenWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalQuestions = series.reduce((acc, p) => acc + p.count, 0);
  const isEmpty = totalQuestions === 0;

  // Configuration settings
  const width = 500;
  const height = 220;
  const margins = { top: 20, right: 25, bottom: 35, left: 35 };

  const { innerWidth, innerHeight } = calculateChartDimensions(width, height, margins);

  // Compute point coordinates
  const counts = series.map(s => s.count);
  const maxCount = Math.max(5, ...counts); // Make sure there is always a vertical range
  const normalizedY = normalizeValues(counts, maxCount, 0, innerHeight);

  const stepX = series.length > 1 ? innerWidth / (series.length - 1) : innerWidth;

  const points = series.map((s, idx) => ({
    x: margins.left + idx * stepX,
    y: margins.top + normalizedY[idx],
    label: s.label,
    count: s.count,
    date: s.date
  }));

  // Create path strings
  const linePath = buildSvgPath(points, true);
  
  // Curved shaded area underneath the path
  let areaPath = "";
  if (points.length > 0) {
    areaPath = linePath + 
      ` L ${points[points.length - 1].x} ${margins.top + innerHeight}` +
      ` L ${points[0].x} ${margins.top + innerHeight} Z`;
  }

  // Y-axis grid scale helpers (0%, 50%, 100%)
  const yScales = [
    { value: maxCount, y: margins.top },
    { value: Math.round(maxCount / 2), y: margins.top + innerHeight / 2 },
    { value: 0, y: margins.top + innerHeight }
  ];

  return (
    <section 
      aria-label="Activity study trend chart"
      className="p-6 bg-neutral-900/40 border border-neutral-900/80 rounded-xl space-y-6 flex flex-col justify-between h-full select-none"
    >
      <div>
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-3">
          <span className="text-xl">📈</span>
          <span>Study Activity Trend</span>
        </h3>
        <p className="text-xs text-neutral-450 mt-2">
          Daily question volumes asked over the last 7 calendar days.
        </p>
      </div>

      <div 
        role="img" 
        aria-label={`Study trend chart. Total questions: ${totalQuestions}.`}
        className="flex-1 flex flex-col justify-center min-h-[160px] relative"
      >
        {isEmpty ? (
          <div className="text-center text-sm text-neutral-500 py-10 italic">
            No activity available yet.
          </div>
        ) : (
          <div className="w-full h-full relative">
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-full overflow-visible"
            >
              <defs>
                {/* Curve fill gradient */}
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {yScales.map((scale, i) => (
                <g key={i}>
                  <line 
                    x1={margins.left} 
                    y1={scale.y} 
                    x2={margins.left + innerWidth} 
                    y2={scale.y} 
                    className="stroke-neutral-800/80 stroke-1 stroke-dasharray-[3,3]"
                    strokeDasharray="4 4"
                  />
                  <text 
                    x={margins.left - 10} 
                    y={scale.y + 4} 
                    className="fill-neutral-550 text-[10px] text-right font-semibold"
                    textAnchor="end"
                  >
                    {scale.value}
                  </text>
                </g>
              ))}

              {/* Shaded Area Under Curve */}
              {areaPath && (
                <path d={areaPath} fill="url(#areaGrad)" className="transition-all duration-500" />
              )}

              {/* Line Curve Path */}
              {linePath && (
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="2.5" 
                  className="transition-all duration-500" 
                />
              )}

              {/* Point Markers */}
              {points.map((p, idx) => (
                <circle 
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint === idx ? "5" : "3.5"}
                  className="fill-neutral-950 stroke-blue-400 stroke-2 hover:scale-125 cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPoint(idx)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* X-axis Labels */}
              {points.map((p, idx) => (
                <text 
                  key={idx}
                  x={p.x}
                  y={margins.top + innerHeight + 18}
                  className="fill-neutral-450 text-[10px] text-center font-medium"
                  textAnchor="middle"
                >
                  {p.label}
                </text>
              ))}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint !== null && points[hoveredPoint] && (
              <div 
                className="absolute z-10 p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-[10px] font-bold text-neutral-300 pointer-events-none shadow-md backdrop-blur-md"
                style={{
                  left: `${((points[hoveredPoint].x - margins.left) / innerWidth) * 85 + 5}%`,
                  top: `${((points[hoveredPoint].y - margins.top) / innerHeight) * 50 + 10}%`
                }}
              >
                <div>{points[hoveredPoint].date}</div>
                <div className="text-blue-400 mt-0.5">{points[hoveredPoint].count} questions</div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default StudyTrendChart;
