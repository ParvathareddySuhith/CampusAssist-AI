import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RiAdminLine } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import GradientText from "../../components/ui/GradientText";
import { useAdminAuth } from "../../hooks/useAdminAuth";

function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, authenticated, loading, error: authError } = useAdminAuth();
  
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Redirect authenticated admin away from the login page to the dashboard
  useEffect(() => {
    if (authenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [authenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    const targetVal = formData.usernameOrEmail.trim();
    if (!targetVal || !formData.password) {
      setValidationError("All fields are required");
      return;
    }

    try {
      await login({
        username: targetVal,
        password: formData.password
      });
      // Navigation is handled automatically by the useEffect watching 'authenticated'
    } catch (err) {
      // Error is stored globally in the hook context and displayed
      console.error("Admin login error:", err);
    }
  };

  const activeError = validationError || authError;

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 relative overflow-hidden text-white">
      {/* Background radial glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full p-8 rounded-2xl bg-neutral-900/40 border border-neutral-900 backdrop-blur-xl space-y-8 z-10 shadow-2xl relative">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center shadow-lg mb-6">
            <RiAdminLine className="text-4xl text-violet-400" />
          </div>
          <span className="text-xs uppercase tracking-widest text-violet-400 font-extrabold">
            CampusAssist AI
          </span>
          <GradientText className="mt-2 text-center text-3xl font-extrabold">
            Administrator Portal
          </GradientText>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {activeError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-lg text-rose-400 text-center text-xs font-semibold select-none">
              {activeError}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Username or Email
              </label>
              <input
                type="text"
                disabled={loading}
                className="w-full px-4 py-2.5 border border-neutral-800 placeholder-neutral-600 text-white bg-neutral-950/60 rounded-lg focus:outline-none focus:border-violet-500/80 transition-colors shadow-inner text-sm"
                placeholder="Enter admin credentials"
                value={formData.usernameOrEmail}
                onChange={(e) =>
                  setFormData({ ...formData, usernameOrEmail: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5 relative">
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  disabled={loading}
                  className="w-full pl-4 pr-11 py-2.5 border border-neutral-800 placeholder-neutral-600 text-white bg-neutral-950/60 rounded-lg focus:outline-none focus:border-violet-500/80 transition-colors shadow-inner text-sm"
                  placeholder="Enter secure password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer transition-colors p-1"
                >
                  {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-lg text-sm shadow-md hover:shadow-violet-500/10 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full py-2.5 border border-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-900 hover:text-white text-sm transition-all duration-200 cursor-pointer text-center font-medium"
            >
              Back to Student Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
