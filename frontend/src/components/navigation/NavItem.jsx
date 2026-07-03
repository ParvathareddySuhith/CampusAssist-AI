import React from "react";
import { Link, useLocation } from "react-router-dom";

function NavItem({ to, icon, label, disabled, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  if (disabled) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg text-neutral-550 opacity-60 cursor-not-allowed select-none">
        <div className="flex items-center space-x-3">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-[10px] bg-neutral-950 px-2 py-0.5 rounded-full text-neutral-600 font-semibold border border-neutral-900">
          Soon
        </span>
      </div>
    );
  }

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center space-x-3 p-3 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 cursor-pointer text-left font-sans"
      >
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </button>
    );
  }

  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 border font-sans ${
        isActive 
          ? "bg-blue-600/15 text-blue-400 border-blue-500/30" 
          : "text-neutral-450 hover:text-white hover:bg-neutral-900 border-transparent hover:border-neutral-850"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export default NavItem;
