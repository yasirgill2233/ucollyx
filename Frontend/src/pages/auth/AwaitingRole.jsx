import React from "react";
import { ShieldCheck, LogOut, RefreshCcw, Coffee } from "lucide-react";
import { useNavigate } from "react-router";

export default function AwaitingRole() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#EFF6FF] p-6">
      {/* Background blobs — blue tinted */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[10%] right-[15%] w-56 h-56 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] left-[15%] w-72 h-72 bg-blue-50/60 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <div className="bg-white w-full max-w-[420px] rounded-[20px] border border-blue-100 shadow-[0_8px_40px_-8px_rgba(29,78,216,0.10)] px-8 py-9 flex flex-col items-center">
        {/* Icon badge */}
        <div className="relative mb-6">
          <div className="w-[68px] h-[68px] bg-blue-700 rounded-[18px] flex items-center justify-center">
            <ShieldCheck size={30} className="text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] bg-green-500 border-[3px] border-white rounded-full" />
        </div>

        {/* Heading + subtext */}
        <h1 className="text-[19px] font-semibold text-slate-900 tracking-tight mb-2 text-center">
          Verification complete
        </h1>
        <p className="text-slate-500 text-[13px] leading-relaxed text-center mb-6 max-w-[300px]">
          Your account is verified. You're in the{" "}
          <span className="text-blue-700 font-semibold">Onboarding Queue</span>{" "}
          while an admin assigns your workspace permissions.
        </p>

        {/* Info box */}
        <div className="w-full bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <Coffee size={12} className="text-blue-600" />
            <span className="text-[10px] font-semibold text-blue-800 uppercase tracking-widest">
              Next steps
            </span>
          </div>
          <p className="text-blue-500 text-[12px] leading-relaxed">
            Once your role — Developer, QA, or Manager — is assigned, your
            workspace will unlock automatically.
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-blue-700 text-white rounded-[10px] text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors duration-200 active:scale-[0.98]"
          >
            <RefreshCcw size={14} />
            Refresh status
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-3 text-blue-300 text-[11px] font-medium uppercase tracking-widest hover:text-red-500 transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-blue-100 w-full flex justify-center items-center gap-1.5">
          <div className="w-[5px] h-[5px] bg-blue-700 rounded-full" />
          <span className="text-[9px] font-medium text-blue-300 uppercase tracking-[0.25em]">
            UCollyx Engine v1.0
          </span>
        </div>
      </div>
    </div>
  );
}
