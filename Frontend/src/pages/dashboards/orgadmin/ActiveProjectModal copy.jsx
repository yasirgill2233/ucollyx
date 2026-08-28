import React, { useState } from 'react';
import API from "../../../api/axios"; // Apna axios instance import karein
import { triggerToast } from '../../../utils/toastHelper';

const ActiveProjectModal = ({  
  setActiveModal, 
  selectedProject, 
  isLoading,
  onConfirm

}) => {

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2500] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100 text-3xl">
          {isLoading ? "⏳" : "📦"}
        </div>
        
        <h2 className="text-xl font-black text-slate-800 mb-2 tracking-tight">
          {isLoading ? "Archiving..." : "Active Project?"}
        </h2>
        
        <p className="text-sm text-slate-400 font-bold leading-relaxed mb-10 px-4 italic">
          Archive "{selectedProject?.name}"? It will no longer appear in
          Active view but all data is preserved.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-black"
            }`}
          >
            {isLoading ? "Wait a moment..." : "Active Project"}
          </button>
          
          <button
            onClick={() => setActiveModal(null)}
            disabled={isLoading}
            className="w-full py-4 border border-slate-100 rounded-2xl font-black text-[10px] text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveProjectModal;