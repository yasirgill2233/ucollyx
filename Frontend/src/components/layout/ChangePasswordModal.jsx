import React, { useState } from "react";
import { X } from "lucide-react";
import API from "../../api/axios";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (confirmPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    try {
      setLoading(true);
      if (password === confirmPassword) {
        const res = await API.put("/auth/change-password", {
          password,
          confirmPassword,
        });

        if (res.data.success) {
          setPassword("");
          setConfirmPassword("");
          onClose();
        }
      } else{
        setError("New password and confirm password do not match.");
      }
    } catch (err) {
      console.error("Change password error:", err);
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[300] flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="text-base font-bold text-slate-800">
            Change Password
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-slate-50/30">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Current Password
            </label>
            <input
              type="password"
              
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-slate-700 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              New Password
            </label>
            <input
              type="password"
              
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-slate-700 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
