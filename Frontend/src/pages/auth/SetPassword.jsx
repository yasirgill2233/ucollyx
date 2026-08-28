import React, { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { triggerToast } from "../../utils/toastHelper";
import { useUpdatePasswordMutation } from "../../hooks/useAuth";

export default function SetPassword() {

  const navigate = useNavigate();
  const updatePasswordMutation = useUpdatePasswordMutation();

  // Form States
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSetPassword = (e) => {
    e.preventDefault();
    setValidationError(""); // Reset local validation error

    // --- Basic Validations ---
    if (password.length < 8) {
      return setValidationError("Password must be at least 8 characters long.");
    }
    if (password !== confirmPassword) {
      return setValidationError("Passwords do not match!");
    }

    // --- Mutation Call ---
    updatePasswordMutation.mutate(password, {
      onSuccess: () => {
        triggerToast("Password set successfully! Let's set up your workspace.", "success");
        navigate("/workspace-selection");
      },
      onError: (err) => {
        const msg = err.response?.data?.message || "Failed to update password.";
        triggerToast(msg, "error");
      }
    });
  };

  // UI Helpers (From Mutation)
  const isUpdating = updatePasswordMutation.isPending;
  // Agar backend se error aaye to wo yahan se bhi mil sakta hai
  const apiError = updatePasswordMutation.error?.response?.data?.message;

  return (
    <div className="flex justify-center items-center h-screen bg-[#f0f2f5]">
      <div className="flex flex-col w-full max-w-[450px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-10 gap-8 animate-in fade-in zoom-in duration-300">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="bg-indigo-100 p-4 rounded-full text-indigo-600 mb-2">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Secure Your Account</h2>
          <p className="text-gray-500 text-sm px-4">
            Since you signed in with Google, please set a password for direct access to UCollyx.
          </p>
        </div>

        {apiError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 text-center">
            {apiError}
          </div>
        )}

        <form className="flex flex-col gap-6" onSubmit={handleSetPassword}>
          {/* New Password Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">New Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl p-4 pl-12 pr-12 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Confirm Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl p-4 pl-12 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUpdating || !password || !confirmPassword}
            className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:translate-y-[-2px] active:translate-y-[0px] transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isUpdating ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                Complete Account Setup <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          UCollyx uses industry-standard encryption to keep your data safe.
        </p>
      </div>
    </div>
  );
}