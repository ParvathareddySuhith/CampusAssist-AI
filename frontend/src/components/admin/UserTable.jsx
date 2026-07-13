import React from 'react';
import { FaUser, FaBell, FaBan, FaCheck, FaEye } from 'react-icons/fa';
import UserStatusBadge from './UserStatusBadge';

function UserTable({ users, onViewDetails, onToggleStatus, onSendNotification, togglingUserId }) {
  if (!users || users.length === 0) {
    return (
      <div className="py-12 border border-neutral-900 bg-neutral-950/40 rounded-2xl text-center text-neutral-500 font-sans">
        <p className="text-sm">No students matched search filters.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-neutral-900 bg-neutral-950/40 backdrop-blur-md rounded-2xl shadow-xl select-none">
      <table className="w-full text-left border-collapse text-xs text-neutral-350">
        <thead>
          <tr className="border-b border-neutral-900 bg-neutral-900/10 text-[10px] text-neutral-450 font-bold uppercase tracking-wider">
            <th className="px-5 py-4">Student</th>
            <th className="px-5 py-4">Email</th>
            <th className="px-5 py-4">Department</th>
            <th className="px-5 py-4">Semester</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Last Active</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-900/50">
          {users.map((user) => {
            const displayName = user.full_name || user.username || 'Student';
            const initials = displayName.charAt(0).toUpperCase();

            return (
              <tr key={user.id} className="hover:bg-neutral-900/20 transition-colors duration-150 group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center font-bold text-violet-400 group-hover:scale-105 transition-transform">
                      {initials}
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-violet-400 transition-colors">{displayName}</div>
                      {user.full_name && (
                        <div className="text-[10px] text-neutral-500 font-medium">@{user.username}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-medium text-neutral-400">{user.email}</td>
                <td className="px-5 py-3.5 font-bold text-neutral-300">{user.department || 'N/A'}</td>
                <td className="px-5 py-3.5 font-medium">
                  {user.semester ? `Semester ${user.semester}` : 'N/A'}
                </td>
                <td className="px-5 py-3.5">
                  <UserStatusBadge isActive={user.is_active} />
                </td>
                <td className="px-5 py-3.5 text-neutral-450 font-medium">{user.last_active}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end space-x-2.5">
                    {/* View Profile */}
                    <button
                      onClick={() => onViewDetails(user.id)}
                      className="p-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 hover:border-neutral-750 text-neutral-400 hover:text-white rounded-lg transition-all cursor-pointer flex items-center justify-center"
                      title="View Details"
                    >
                      <FaEye className="w-3 h-3" />
                    </button>

                    {/* Notify student */}
                    <button
                      onClick={() => onSendNotification(user.id, displayName)}
                      className="p-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 hover:border-neutral-750 text-neutral-450 hover:text-amber-400 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                      title="Send Notification"
                    >
                      <FaBell className="w-3 h-3" />
                    </button>

                    {/* Enable / Disable */}
                    <button
                      disabled={togglingUserId === user.id}
                      onClick={() => onToggleStatus(user.id, user.is_active)}
                      className={`p-2 border rounded-lg transition-all cursor-pointer flex items-center justify-center disabled:opacity-50 ${
                        user.is_active
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-450 hover:bg-rose-500/20 hover:text-rose-400'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450 hover:bg-emerald-500/20 hover:text-emerald-400'
                      }`}
                      title={user.is_active ? 'Disable Account' : 'Enable Account'}
                    >
                      {togglingUserId === user.id ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : user.is_active ? (
                        <FaBan className="w-3 h-3" />
                      ) : (
                        <FaCheck className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;
