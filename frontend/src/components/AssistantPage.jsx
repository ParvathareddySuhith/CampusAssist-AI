import React from "react";
import { useNavigate } from "react-router-dom";
import ChatBox from "./ChatBox";

function AssistantPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-[calc(100vh-8rem)] relative flex items-center justify-center">
      <div className="relative z-10 w-full max-w-5xl h-full">
        <ChatBox onClose={() => navigate("/dashboard")} isStandalone={true} />
      </div>
    </div>
  );
}

export default AssistantPage;
