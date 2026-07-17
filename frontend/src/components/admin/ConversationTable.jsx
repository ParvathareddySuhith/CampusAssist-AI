import React from 'react';
import { FaUserCircle, FaComments } from 'react-icons/fa';

function ConversationTable({ conversations, onDetailsClick }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950/40 backdrop-blur-md">
      <table className="w-full text-left border-collapse text-sm text-neutral-300">
        <thead>
          <tr className="border-b border-neutral-800 bg-neutral-900/30 text-neutral-400 font-semibold select-none">
            <th className="p-4 text-xs uppercase tracking-wider">User</th>
            <th className="p-4 text-xs uppercase tracking-wider">Department</th>
            <th className="p-4 text-xs uppercase tracking-wider">Started</th>
            <th className="p-4 text-xs uppercase tracking-wider">Messages</th>
            <th className="p-4 text-xs uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-900">
          {conversations.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-8 text-center text-sm text-neutral-500 font-semibold select-none">
                No conversations found matching the criteria.
              </td>
            </tr>
          ) : (
            conversations.map((conv) => {
              return (
                <tr 
                  key={conv.id} 
                  className="hover:bg-neutral-900/35 transition-colors duration-150 group"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <FaUserCircle className="w-6 h-6 text-violet-400/80 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-semibold text-neutral-200 truncate max-w-[200px] md:max-w-xs block">
                          {conv.user}
                        </span>
                        {conv.email && (
                          <p className="text-[10px] text-neutral-500 select-none truncate max-w-[150px]">
                            {conv.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-medium text-neutral-300 select-none">
                    <span className="bg-neutral-900/60 px-2 py-1 border border-neutral-800 rounded font-semibold text-neutral-400">
                      {conv.department || 'CSE'}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-neutral-400 font-medium select-none">
                    {formatDate(conv.started)}
                  </td>
                  <td className="p-4 text-xs text-neutral-300 font-semibold select-none">
                    <div className="flex items-center space-x-1.5">
                      <FaComments className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{conv.messages}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => onDetailsClick(conv)}
                      className="text-violet-400 hover:text-violet-300 font-semibold text-xs transition-colors cursor-pointer select-none"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ConversationTable;
