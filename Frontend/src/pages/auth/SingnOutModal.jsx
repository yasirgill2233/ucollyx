import React from "react";
import { LogOut, RefreshCcw, X } from "lucide-react";
import { useNavigate } from "react-router";

const SignOutModal = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f0f2f5]">
      <div className="bg-white rounded-lg w-full max-w-[30%] p-8 border border-b-default animate-in zoom-in duration-300">
        
        {/* Door Icon Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-red-50 rounded-md flex items-center justify-center mb-4">
            <span className="text-3xl"><LogOut className="text-red-700 font-bold"/></span>
          </div>
          <h2 className="text-2xl font-black text-gray-800">Sign out?</h2>
          <p className="text-gray-400 text-sm mt-1">Choose how you'd like to proceed with your session</p>
        </div>

        {/* Current Session Info */}
        <div className="bg-gray-50/80 rounded-md p-4 border border-gray-100 mb-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Current Session</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <div className="text-left">
              <h4 className="font-bold text-gray-800 text-sm">StartupHub</h4>
              <p className="text-xs text-gray-500">Member · sara@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 text-left">Quick Actions</p>
          <div 
          
            className="flex items-center gap-4 p-4 border border-gray-100 rounded-md cursor-pointer hover:bg-gray-50 transition-all group"
          >
            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600 group-hover:rotate-180 transition-transform duration-500">
              <RefreshCcw size={20} />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-gray-800 text-sm">Switch Workspace</h4>
              <p className="text-[11px] text-gray-400">Stay logged in and switch to another workspace</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={()=>navigate(-1)}
            className="flex-1 py-3.5 border border-gray-200 rounded-md font-bold text-gray-500 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => navigate("/signed-out-success")}
            className="flex-1 py-3.5 bg-red-500 text-white rounded-md font-bold flex items-center justify-center gap-2 hover:bg-red-600 shadow-lg shadow-red-100 transition-all"
          >
            <LogOut className="text-white font-bold"/> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOutModal;