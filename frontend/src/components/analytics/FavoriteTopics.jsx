import React from "react";

function FavoriteTopics({ topics = [] }) {
  const hasTopics = topics && topics.length > 0;

  return (
    <div className="bg-neutral-900/40 border border-neutral-900/80 p-6 rounded-xl space-y-6 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-3">
          <span className="text-xl">🏷️</span>
          <span>Favorite Topics</span>
        </h3>
        <p className="text-xs text-neutral-450 mt-2">
          Your most frequently queried subjects. Click on any topic to get started.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center py-4">
        {hasTopics ? (
          <div className="flex flex-wrap gap-3">
            {topics.map((item, idx) => {
              const topicName = typeof item === "string" ? item : item.topic;
              const countValue = typeof item === "string" ? null : item.count;

              return (
                <div
                  key={idx}
                  className="px-4 py-2 bg-neutral-950/60 hover:bg-neutral-900/80 border border-neutral-850 hover:border-blue-500/30 rounded-xl flex items-center space-x-2.5 transition-all duration-300 hover:scale-[1.03] select-none cursor-default shadow-md group"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 group-hover:bg-indigo-400 transition-colors" />
                  <span className="text-sm font-semibold text-neutral-300 group-hover:text-white transition-colors">
                    {topicName}
                  </span>
                  {countValue !== null && countValue !== undefined && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-450 group-hover:text-blue-400 rounded-md transition-colors">
                      {countValue}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-sm text-neutral-500 bg-neutral-950/20 border border-dashed border-neutral-900/60 rounded-xl flex flex-col items-center justify-center space-y-2">
            <span className="text-2xl opacity-60">🏷️</span>
            <p className="font-medium text-neutral-400">No topics analyzed yet.</p>
            <p className="text-xs text-neutral-600 max-w-[200px]">
              We'll extract academic topics as you ask questions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoriteTopics;
