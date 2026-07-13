import React from "react";
import { IoClose } from "react-icons/io5";
import { FaUser, FaBook, FaChartBar, FaBrain, FaGraduationCap } from "react-icons/fa";

function UserDetailsDrawer({ isOpen, user, loading, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-white select-none">
      {/* Background Overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Sliding Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-950 border-l border-neutral-900 flex flex-col justify-between shadow-2xl relative">
          
          {/* Header Panel */}
          <div className="p-6 border-b border-neutral-900 flex items-center justify-between bg-neutral-900/10">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center font-bold text-violet-400 text-lg shadow-inner">
                {user ? (user.full_name || user.username || "U").charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h3 className="text-base font-bold truncate max-w-[200px]">
                  {user ? (user.full_name || user.username) : "Student Details"}
                </h3>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-extrabold">
                  {user?.email || "Student Account"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-white p-1 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-850 transition-all cursor-pointer"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-neutral-550 animate-pulse font-sans">Compiling telemetry logs...</p>
              </div>
            ) : user ? (
              <>
                {/* 1. Profile Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-violet-400">
                    <FaUser className="w-4 h-4" />
                    <h4 className="text-sm font-extrabold uppercase tracking-wider">Profile Information</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 bg-neutral-900/30 p-4 border border-neutral-900 rounded-xl text-xs">
                    <div className="space-y-1">
                      <p className="text-neutral-500 font-semibold">Department</p>
                      <p className="font-bold text-neutral-200">{user.student?.department || "CSE"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-neutral-500 font-semibold">Semester</p>
                      <p className="font-bold text-neutral-200">Semester {user.student?.semester || "1"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-neutral-500 font-semibold">Academic Year</p>
                      <p className="font-bold text-neutral-200">Year {user.student?.year || "1"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-neutral-500 font-semibold">Roll Number</p>
                      <p className="font-bold text-neutral-200 truncate">{user.student?.roll_number || "N/A"}</p>
                    </div>
                    <div className="col-span-2 border-t border-neutral-900/60 pt-2.5 flex items-center justify-between">
                      <span className="text-neutral-500 font-semibold flex items-center space-x-1.5">
                        <FaGraduationCap className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Cumulative GPA</span>
                      </span>
                      <span className="font-extrabold text-white text-sm bg-violet-500/10 px-2 py-0.5 border border-violet-500/20 rounded">
                        {user.student?.cgpa || "8.42"} / 10.0
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Learning Progress Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-fuchsia-400">
                    <FaBook className="w-4 h-4" />
                    <h4 className="text-sm font-extrabold uppercase tracking-wider">Learning Progress</h4>
                  </div>
                  {user.progress && user.progress.length > 0 ? (
                    <div className="space-y-3.5">
                      {user.progress.map((prog, idx) => (
                        <div key={idx} className="bg-neutral-900/30 p-3.5 border border-neutral-900 rounded-xl space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-neutral-200 truncate max-w-[180px]">{prog.topic}</span>
                            <span className="font-semibold text-fuchsia-400">{Math.round(prog.completion_percentage || 0)}%</span>
                          </div>
                          <div className="w-full bg-neutral-950 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="h-1.5 bg-fuchsia-500 transition-all duration-300"
                              style={{ width: `${prog.completion_percentage || 0}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-neutral-500 font-semibold pt-1">
                            <span>Steps: {prog.current_step_index || 0} completed</span>
                            {prog.last_completed_step && (
                              <span className="truncate max-w-[150px]">Last: {prog.last_completed_step}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-neutral-900/20 border border-neutral-900 rounded-xl text-center text-xs text-neutral-500">
                      No active syllabus topics studied yet.
                    </div>
                  )}
                </div>

                {/* 3. Analytics Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <FaChartBar className="w-4 h-4" />
                    <h4 className="text-sm font-extrabold uppercase tracking-wider">Telemetry Analytics</h4>
                  </div>
                  <div className="bg-neutral-900/30 p-4 border border-neutral-900 rounded-xl space-y-4">
                    <div className="flex items-center justify-between text-xs select-none">
                      <span className="text-neutral-450 font-semibold">Total Queries Asked</span>
                      <span className="font-black text-white text-sm bg-neutral-950 px-2.5 py-0.5 rounded border border-neutral-900">{user.analytics?.total_questions || 0}</span>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-neutral-900/60">
                      {/* Academic */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-neutral-450 font-semibold">
                          <span>Academic Assistance</span>
                          <span className="text-neutral-300 font-bold">{user.analytics?.academic_questions || 0}</span>
                        </div>
                        <div className="w-full bg-neutral-950 rounded-full h-1 overflow-hidden">
                          <div 
                            className="h-1 bg-blue-500" 
                            style={{ 
                              width: user.analytics?.total_questions 
                                ? `${(user.analytics.academic_questions / user.analytics.total_questions) * 100}%` 
                                : "0%" 
                            }}
                          />
                        </div>
                      </div>

                      {/* Placement */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-neutral-450 font-semibold">
                          <span>Placement Training</span>
                          <span className="text-neutral-300 font-bold">{user.analytics?.placement_questions || 0}</span>
                        </div>
                        <div className="w-full bg-neutral-950 rounded-full h-1 overflow-hidden">
                          <div 
                            className="h-1 bg-amber-500" 
                            style={{ 
                              width: user.analytics?.total_questions 
                                ? `${(user.analytics.placement_questions / user.analytics.total_questions) * 100}%` 
                                : "0%" 
                            }}
                          />
                        </div>
                      </div>

                      {/* Campus */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-neutral-450 font-semibold">
                          <span>Campus Navigation</span>
                          <span className="text-neutral-300 font-bold">{user.analytics?.campus_questions || 0}</span>
                        </div>
                        <div className="w-full bg-neutral-950 rounded-full h-1 overflow-hidden">
                          <div 
                            className="h-1 bg-fuchsia-500" 
                            style={{ 
                              width: user.analytics?.total_questions 
                                ? `${(user.analytics.campus_questions / user.analytics.total_questions) * 100}%` 
                                : "0%" 
                            }}
                          />
                        </div>
                      </div>

                      {/* General */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-neutral-450 font-semibold">
                          <span>General Chat / Info</span>
                          <span className="text-neutral-300 font-bold">{user.analytics?.general_questions || 0}</span>
                        </div>
                        <div className="w-full bg-neutral-950 rounded-full h-1 overflow-hidden">
                          <div 
                            className="h-1 bg-neutral-400" 
                            style={{ 
                              width: user.analytics?.total_questions 
                                ? `${(user.analytics.general_questions / user.analytics.total_questions) * 100}%` 
                                : "0%" 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Adaptive Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <FaBrain className="w-4 h-4" />
                    <h4 className="text-sm font-extrabold uppercase tracking-wider">Adaptive Profile</h4>
                  </div>
                  <div className="bg-neutral-900/30 p-4 border border-neutral-900 rounded-xl space-y-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-semibold">Preferred Mode</span>
                      <span className="font-bold text-neutral-200">{user.learning_profile?.preferred_mode || "Interactive Chat"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-semibold">Study Streak</span>
                      <span className="font-bold text-amber-400 flex items-center space-x-1">
                        <span>🔥</span>
                        <span>{user.learning_profile?.study_streak || 0} Days</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-semibold">Preferred Assistant</span>
                      <span className="font-bold text-neutral-200">{user.learning_profile?.preferred_assistant || "General Assistant"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-semibold">Placement Readiness</span>
                      <span className="font-black text-white bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 rounded uppercase tracking-wider text-[10px]">
                        {user.learning_profile?.placement_readiness || "Beginner"}
                      </span>
                    </div>
                    
                    <div className="border-t border-neutral-900/60 pt-3 space-y-2.5">
                      <div className="space-y-1">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-extrabold">Favorite Topics</p>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {user.learning_profile?.favorite_topics && user.learning_profile.favorite_topics.length > 0 ? (
                            user.learning_profile.favorite_topics.map((t, i) => (
                              <span key={i} className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/25 rounded text-[10px] font-semibold text-violet-400">{t}</span>
                            ))
                          ) : (
                            <span className="text-neutral-600 italic">None logged yet</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-extrabold">Weak Topics</p>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {user.learning_profile?.weak_topics && user.learning_profile.weak_topics.length > 0 ? (
                            user.learning_profile.weak_topics.map((t, i) => (
                              <span key={i} className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/25 rounded text-[10px] font-semibold text-rose-400">{t}</span>
                            ))
                          ) : (
                            <span className="text-neutral-600 italic">None logged yet</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500 text-xs italic">
                Failed to resolve user parameters.
              </div>
            )}
          </div>
          
          {/* Footer Controls */}
          <div className="p-4 border-t border-neutral-900 text-center bg-neutral-950 bg-neutral-900/10">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-neutral-800 text-neutral-400 hover:text-white rounded-lg text-xs font-bold hover:bg-neutral-900 transition-colors duration-200 cursor-pointer"
            >
              Close Inspector
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default UserDetailsDrawer;
