// LinkEpicModal.jsx
import React from 'react';

const LinkEpicModal = ({ epics = [], onSelect, onClose, isPending }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in-95">
        <h2 className="text-xl font-black text-slate-800 mb-2">Link Epic</h2>
        <p className="text-sm font-bold text-slate-400 mb-6">Select an epic to link this card to:</p>
        
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {epics.length > 0 ? (
            epics.map((epic) => (
              <button
                key={epic.id}
                onClick={() => onSelect(epic.id)} // Pass direct id to handler
                disabled={isPending}
                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-left group disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  {/* Dynamic Database Hex Color Ring 🔥 */}
                  <div 
                    className="w-3.5 h-3.5 rounded-full ring-4 ring-white shadow-sm group-hover:scale-125 transition-transform" 
                    style={{ backgroundColor: epic.color_code || '#cbd5e1' }}
                  />
                  <div>
                    <div className="font-black text-slate-700 text-sm uppercase leading-none mb-1">{epic.title}</div>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-wider">EPIC-{epic.id}</span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
              No epics found in this project
            </div>
          )}
        </div>

        <button 
          onClick={onClose}
          disabled={isPending}
          className="w-full mt-6 py-3 text-sm font-black text-slate-500 hover:text-slate-700 uppercase tracking-widest transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LinkEpicModal;