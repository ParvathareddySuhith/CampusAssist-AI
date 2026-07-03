import React from "react";
import SpotlightCard from "./ui/SpotlightCard";

function ProfilePage() {
  return (
    <div className="flex items-center justify-center p-6 min-h-[calc(100vh-8rem)]">
      <SpotlightCard
        className="p-10 bg-neutral-900/60 border border-neutral-800 rounded-xl w-full max-w-md text-center flex flex-col justify-center items-center shadow-2xl"
        spotlightColor="rgba(59, 130, 246, 0.15)"
      >
        <div className="w-16 h-16 bg-neutral-950/60 rounded-full border border-neutral-850 flex items-center justify-center mx-auto text-blue-400 text-2xl mb-4">
          👤
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Student Profile</h3>
        <p className="text-neutral-400 text-sm mb-4">
          Manage your personal details, academic preferences, and system notifications.
        </p>
        <span className="px-4 py-1.5 bg-neutral-950 text-neutral-500 border border-neutral-850 rounded-full text-xs font-semibold">
          Coming Soon
        </span>
      </SpotlightCard>
    </div>
  );
}

export default ProfilePage;
