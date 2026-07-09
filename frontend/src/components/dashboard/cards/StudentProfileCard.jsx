import React from "react";

function StudentProfileCard({ student }) {
  const name = student?.name || "Not set";
  const department = student?.department || "Not selected";
  const semester = student?.semester ? `Semester ${student.semester}` : "—";

  return (
    <section 
      aria-label="Student Profile"
      className="p-6 bg-neutral-900/60 border border-neutral-800 rounded-xl backdrop-blur-md hover:border-neutral-700 transition-all select-none flex flex-col justify-between"
    >
      <div>
        <h3 className="text-xs font-semibold text-neutral-450 uppercase tracking-wider mb-4">
          Academic Profile
        </h3>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-lg font-bold">
            {name !== "Not set" ? name.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white leading-tight truncate max-w-[200px]" title={name}>
              {name}
            </h2>
            <p className="text-sm text-neutral-400">Student</p>
          </div>
        </div>

        <div className="space-y-2.5 pt-2 border-t border-neutral-800/40">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400">Department</span>
            <span className="font-semibold text-neutral-200">{department}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400">Current Semester</span>
            <span className="font-semibold text-neutral-200">{semester}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StudentProfileCard;
