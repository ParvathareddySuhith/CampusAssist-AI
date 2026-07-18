import React from 'react';
import { FaFileAlt, FaUsers, FaComments, FaBell, FaDatabase, FaClock } from 'react-icons/fa';

function SystemMetricsPanel({ metrics }) {
  const metricItems = [
    { label: 'Documents', value: metrics?.documents ?? 0, icon: <FaFileAlt className="text-rose-400" /> },
    { label: 'Users', value: metrics?.users ?? 0, icon: <FaUsers className="text-violet-400" /> },
    { label: 'Conversations', value: metrics?.conversations ?? 0, icon: <FaComments className="text-amber-400" /> },
    { label: 'Notifications', value: metrics?.notifications ?? 0, icon: <FaBell className="text-blue-400" /> },
    { label: 'Storage', value: `${metrics?.storage_mb ?? 0} MB`, icon: <FaDatabase className="text-emerald-400" /> },
    { label: 'Uptime', value: metrics?.uptime ?? '0m', icon: <FaClock className="text-cyan-400" /> },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 select-none">
      {metricItems.map((item, index) => (
        <div 
          key={item.label || index}
          className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950/20 backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-neutral-700/60 transition-all duration-200"
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">{item.label}</span>
          </div>
          <div className="text-2xl font-black text-white select-all">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SystemMetricsPanel;
