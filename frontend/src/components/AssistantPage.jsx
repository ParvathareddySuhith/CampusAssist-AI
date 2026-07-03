import React from "react";
import { useNavigate } from "react-router-dom";
import ChatBox from "./ChatBox";
import Squares from "./ui/Squares";

function AssistantPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen bg-neutral-950 relative overflow-hidden flex flex-col justify-center items-center">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0">
        <Squares
          speed={0.3}
          squareSize={45}
          direction="down"
          borderColor="rgba(255, 255, 255, 0.04)"
          hoverFillColor="rgba(59, 130, 246, 0.05)"
        />
      </div>

      {/* Stands alone container layout */}
      <div className="relative z-10 w-full max-w-5xl h-[92vh] px-4">
        <ChatBox onClose={() => navigate("/dashboard")} isStandalone={true} />
      </div>
    </div>
  );
}

export default AssistantPage;
