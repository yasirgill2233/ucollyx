import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, ShieldCheck, Loader2, ArrowRight, UserCheck } from "lucide-react";
import { triggerToast } from "../../utils/toastHelper";
import { useAcceptInviteMutation, useCheckInvite } from "../../hooks/useWorkspace";
import { useQueryClient } from "@tanstack/react-query";

export default function JoinWorkspace() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const queryClient = useQueryClient()

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // React Query: Fetch Invite Data
  const { data: inviteRes, isLoading: isVerifying, error: verifyError } = useCheckInvite(token);
  const inviteData = inviteRes?.data;

  // React Query: Mutation for Accepting Invite
  const acceptMutation = useAcceptInviteMutation();
  const isSubmitting = acceptMutation.isPending;

  // Token missing security check
  useEffect(() => {
    if (!token) {
      triggerToast("Invalid or missing invitation token", "error");
      navigate("/login");
    }
  }, [token, navigate]);

  const playErrorSound = () => {
    new Audio("/sounds/short_bongo.mp3").play().catch(() => {});
  };

  // Handler for New User Form Submit
  const handleRegisterAndJoin = (e) => {
    e.preventDefault();
    
    if (password.length < 8) {
      playErrorSound();
      return triggerToast("Password must be at least 8 characters long", "error");
    }

    if (password !== confirmPassword) {
      playErrorSound();
      return triggerToast("Passwords do not match", "error");
    }

    acceptMutation.mutate(
      { token, password },
      {
        onSuccess: (res) => {
          queryClient.invalidateQueries(['users-list']);
          localStorage.setItem("token", res.token);
          localStorage.setItem("user", JSON.stringify(res.user));
          triggerToast("Account created and Workspace joined!", "success");
          navigate(`/`);
        },
        onError: (err) => {
          triggerToast(err.response?.data?.message || "Something went wrong", "error");
        },
      }
    );
  };

  // Handler for Existing User (Fixes the e.preventDefault undefined crash)
  const handleDirectJoin = () => {
    navigate(`/`);
    // acceptMutation.mutate(
    //   { token, password: "" },
    //   {
    //     onSuccess: (res) => {
    //       if (res.token) localStorage.setItem("token", res.token);
    //       triggerToast("Successfully joined the workspace!", "success");
    //       navigate(`/`);
    //     },
    //     onError: (err) => {
    //       triggerToast(err.response?.data?.message || "Failed to join workspace", "error");
    //     },
    //   }
    // );
  };

  // Verifying / Loading State (Indigo Theme matched)
  if (isVerifying) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={44} />
        <span className="ml-3 mt-4 font-bold text-slate-600 tracking-wide animate-pulse">
          Verifying Invite...
        </span>
      </div>
    );
  }

  // Error State (If token is expired/invalid)
  if (verifyError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white border border-red-100 rounded-2xl p-8 max-w-md text-center shadow-xl">
          <p className="text-red-600 font-semibold mb-4">This invitation link is invalid or has expired.</p>
          <button 
            onClick={() => navigate("/login")} 
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all text-sm font-bold shadow-md shadow-indigo-600/10 active:scale-95"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300">
        
        {inviteData?.exists ? (
          /* ==========================================
             CASE 1: EXISTING USER (Matched Clean Indigo UI)
             ========================================== */
          <div>
            <div className="bg-indigo-600 p-8 text-center text-white">
              <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-inner backdrop-blur-sm">
                <UserCheck size={26} />
              </div>
              <h2 className="text-2xl font-bold">Welcome Back!</h2>
              <p className="text-indigo-100 text-sm mt-1">
                You already have an active account
              </p>
            </div>

            <div className="p-8 text-center space-y-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                Your account is registered with <span className="font-bold text-slate-800">{inviteData.email}</span>. Click below to instantly join this team workspace.
              </p>
              
              <button
                onClick={handleDirectJoin}
                disabled={isSubmitting}
                className="w-full group bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 active:scale-98 disabled:opacity-50 shadow-lg shadow-indigo-600/10 hover:cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Login to Your Workspace
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ==========================================
             CASE 2: NEW USER FORM (Set Password)
             ========================================== */
          <>
            {/* Blue Header */}
            <div className="bg-indigo-600 p-8 text-center text-white">
              <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-inner backdrop-blur-sm">
                <ShieldCheck size={28} />
              </div>
              <h2 className="text-2xl font-bold">You've been invited!</h2>
              <p className="text-indigo-100 text-sm mt-1">
                Set up your password to join the team
              </p>
            </div>

            {/* Form layout with smooth interactive rings */}
            <form className="p-8 space-y-5" onSubmit={handleRegisterAndJoin}>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                  <input
                    type="password"
                    placeholder="Min. 8 characters"
                    className="w-full border border-gray-200 bg-gray-50/50 rounded-xl p-3 pl-11 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all text-gray-800 placeholder-gray-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    className="w-full border border-gray-200 bg-gray-50/50 rounded-xl p-3 pl-11 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all text-gray-800 placeholder-gray-400"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 active:scale-98 disabled:opacity-50 shadow-lg shadow-indigo-600/10 hover:cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Accept Invitation & Join"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}