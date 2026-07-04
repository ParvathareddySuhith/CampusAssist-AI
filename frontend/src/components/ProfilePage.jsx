import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import SpotlightCard from "./ui/SpotlightCard";
import { getProfile, updateProfile } from "../services/profileService";
import { DEPARTMENTS } from "../constants/departments";

function ProfilePage() {
  const navigate = useNavigate();
  const { refreshProfile } = useOutletContext();

  const [formData, setFormData] = useState({
    full_name: "",
    department: "",
    year: "",
    semester: "",
    section: "",
    roll_number: ""
  });

  const [initialData, setInitialData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const data = await getProfile();
        if (data) {
          const loadedData = {
            full_name: data.full_name || "",
            department: data.department || "",
            year: data.year || "",
            semester: data.semester || "",
            section: data.section || "",
            roll_number: data.roll_number || ""
          };
          setFormData(loadedData);
          setInitialData(loadedData);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        setAlertMsg({ type: "error", text: "Failed to load student profile details." });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    // Revert to initial loaded data or redirect to dashboard
    setFormData(initialData);
    setAlertMsg({ type: "info", text: "Changes discarded." });
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlertMsg({ type: "", text: "" });

    // Client-side validations
    if (!formData.full_name.trim()) {
      setAlertMsg({ type: "error", text: "Full Name is required." });
      setSaving(false);
      return;
    }

    if (!formData.department) {
      setAlertMsg({ type: "error", text: "Please select your academic Department." });
      setSaving(false);
      return;
    }

    if (!formData.year) {
      setAlertMsg({ type: "error", text: "Please select your current Academic Year." });
      setSaving(false);
      return;
    }

    if (!formData.semester) {
      setAlertMsg({ type: "error", text: "Please select your current Semester." });
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        year: parseInt(formData.year),
        semester: parseInt(formData.semester)
      };

      await updateProfile(payload);
      setAlertMsg({ type: "success", text: "Student Profile saved successfully!" });
      
      // Update local baseline
      setInitialData(formData);
      
      // Trigger sidebar layout state refresh immediately
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      const errorDetail = error.response?.data?.error || "Failed to update profile. Please try again.";
      setAlertMsg({ type: "error", text: errorDetail });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[calc(100vh-8rem)]">
        <div className="text-neutral-400 text-sm animate-pulse flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading academic profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="space-y-2 mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight">Student Profile</h2>
        <p className="text-neutral-450 text-base">
          Update your academic credentials and personal details to customize your chatbot context.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {alertMsg.text && (
          <div 
            className={`p-4 rounded-lg border text-sm font-medium transition-all ${
              alertMsg.type === "success" 
                ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400" 
                : alertMsg.type === "error"
                ? "bg-rose-950/30 border-rose-500/30 text-rose-400"
                : "bg-neutral-900 border-neutral-850 text-neutral-300"
            }`}
          >
            {alertMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section 1: Personal Information */}
          <SpotlightCard 
            className="p-8 bg-neutral-900/40 border border-neutral-900 rounded-xl space-y-6 flex flex-col justify-between"
            spotlightColor="rgba(59, 130, 246, 0.1)"
          >
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-neutral-900 pb-3 flex items-center space-x-2">
                <span className="text-xl">👤</span>
                <span>Personal Information</span>
              </h3>

              {/* Full Name input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Suhith Reddy"
                  className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/80 transition-colors shadow-inner"
                  required
                />
              </div>

              {/* Section input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-300">
                  Section <span className="text-xs text-neutral-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  placeholder="e.g. A, B, Section-C"
                  className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/80 transition-colors shadow-inner"
                />
              </div>
            </div>
            
            {/* Short helper note */}
            <p className="text-[11px] text-neutral-500 pt-4 leading-relaxed">
              * Required fields are essential for authenticating placements or academic verification records.
            </p>
          </SpotlightCard>

          {/* Section 2: Academic Information */}
          <SpotlightCard 
            className="p-8 bg-neutral-900/40 border border-neutral-900 rounded-xl space-y-6"
            spotlightColor="rgba(16, 185, 129, 0.1)"
          >
            <h3 className="text-lg font-bold text-white border-b border-neutral-900 pb-3 flex items-center space-x-2">
              <span className="text-xl">📚</span>
              <span>Academic Information</span>
            </h3>

            {/* Department Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-300">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/80 transition-colors cursor-pointer"
                required
              >
                <option value="" disabled>Select Department</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Year Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-300">
                  Academic Year <span className="text-rose-500">*</span>
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/80 transition-colors cursor-pointer"
                  required
                >
                  <option value="" disabled>Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              {/* Semester Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-300">
                  Semester <span className="text-rose-500">*</span>
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/80 transition-colors cursor-pointer"
                  required
                >
                  <option value="" disabled>Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem.toString()}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Roll Number input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-300">
                Roll Number <span className="text-xs text-neutral-500">(Optional)</span>
              </label>
              <input
                type="text"
                name="roll_number"
                value={formData.roll_number}
                onChange={handleChange}
                placeholder="e.g. 20CSE042"
                className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/80 transition-colors shadow-inner"
              />
            </div>
          </SpotlightCard>
        </div>

        {/* Buttons Controls */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-neutral-900">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="px-5 py-2.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 hover:border-neutral-750 text-neutral-300 font-semibold rounded-lg text-sm transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow-md hover:shadow-blue-500/10 transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Profile...</span>
              </>
            ) : (
              <span>Save Profile</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;
