import React, { useState } from "react";
import { X, Calendar, Clock, Video } from "lucide-react";

const ScheduleMeetingModal = ({ isOpen, onClose, onSchedule, activeChat }) => {
  const [meetingData, setMeetingData] = useState({
    title: "",
    date: "",
    time: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!meetingData.title || !meetingData.date || !meetingData.time) return;
    
    onSchedule({
      ...meetingData,
      id: Date.now(),
      roomName: `${activeChat}-${meetingData.title.replace(/\s+/g, "-")}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" /> Schedule Meeting
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Meeting Title</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
              placeholder="e.g., Weekly Sync-up"
              onChange={(e) => setMeetingData({...meetingData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Date</label>
              <input 
                type="date" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                onChange={(e) => setMeetingData({...meetingData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Time</label>
              <input 
                type="time" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                onChange={(e) => setMeetingData({...meetingData, time: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2">
            <Video size={18} /> Schedule & Share
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMeetingModal;