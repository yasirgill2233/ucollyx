import React, { useState } from 'react';
import { X, FolderKanban } from 'lucide-react';

const CreateSprintModal = ({ onClose, onCreate, projects, initialProjectId }) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // Agar parent se pehle se koi project select hai, toh woh default ho jaye, nahi toh pehli list ka
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !startDate || !endDate || !selectedProjectId) return;
    
    onCreate({ 
      name, 
      start_date: startDate, 
      end_date: endDate, 
      project_id: Number(selectedProjectId) // Database foreign key verification ke liye integer cast
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6 border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Initialize New Sprint</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-full text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 📂 Project Dropdown Selection */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Project Scope</label>
            <div className="relative flex items-center">
              <FolderKanban size={16} className="absolute left-3 text-slate-400" />
              <input
                required
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-50 pl-10 pr-4 py-3 rounded-lg text-xs font-bold border border-slate-200/60 outline-none focus:border-blue-500 text-slate-700 appearance-none cursor-pointer"
              />
               
         
            </div>
          </div>

          {/* Sprint Name Input */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sprint Name</label>
            <input 
              type="text" required placeholder="e.g., Sprint 1: Core System MVP"
              value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 px-4 py-3 rounded-lg text-xs font-bold border border-slate-200/60 outline-none focus:border-blue-500 text-slate-700"
            />
          </div>

          {/* Timeline Range Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Start Date</label>
              <input 
                type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 px-3 py-3 rounded-lg text-xs font-bold border border-slate-200/60 outline-none focus:border-blue-500 text-slate-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">End Date</label>
              <input 
                type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 px-3 py-3 rounded-lg text-xs font-bold border border-slate-200/60 outline-none focus:border-blue-500 text-slate-600"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <button 
            type="submit"
            className="w-full bg-slate-900 text-white text-xs font-black py-3 rounded-lg shadow-lg hover:bg-slate-800 transition-all uppercase tracking-wider mt-2"
          >
            Launch Sprint Timeline
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateSprintModal;