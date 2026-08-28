import React, { useState } from "react";
import {
  X,
  Calendar,
  CheckSquare,
  CheckCircle2,
  Clock,
  Link as LinkIcon,
  Plus,
} from "lucide-react";

const MeetingModal = ({ task, onClose }) => {
  // --- STATES ---
  const [view, setView] = useState("list"); // 'list', 'form', 'success'
  const [meetings, setMeetings] = useState([
    {
      id: 1,
      title: "Sprint 1 planning",
      date: "2026-12-02",
      time: "13:00",
      duration: "30 min",
      link: "https://meet.google.com/abc-defg-hij",
      attendees: ["Ahsan", "Sara"]
    }
  ]);

  // Form Input States
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    duration: "30 min",
    link: "",
    notes: ""
  });
  const [selectedAttendees, setSelectedAttendees] = useState(["Ahsan"]);

  const attendeesList = [
    { name: "Ahsan", initials: "AH" },
    { name: "Sara", initials: "SA" },
    { name: "Muneeb", initials: "MU" },
    { name: "Fatima", initials: "FA" },
  ];

  // --- HANDLERS ---
  const toggleAttendee = (name) => {
    setSelectedAttendees((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleSubmit = () => {
    if (!formData.title || !formData.date || !formData.time) {
      alert("Please fill basic details!");
      return;
    }

    const newMeeting = {
      id: Date.now(),
      ...formData,
      attendees: selectedAttendees
    };

    setMeetings([newMeeting, ...meetings]);
    setView("success");
    
    // Reset form for next time
    setFormData({ title: "", date: "", time: "", duration: "30 min", link: "", notes: "" });
  };

  const deleteMeeting = (id) => {
    setMeetings(meetings.filter(m => m.id !== id));
  };

  // --- UI COMPONENTS ---

  if (view === "success") {
    return (
      <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4" onClick={onClose}>
        <div className="bg-white w-full max-w-sm rounded-[40px] p-10 text-center shadow-2xl animate-in zoom-in-90 duration-300" onClick={(e) => e.stopPropagation()}>
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Success!</h2>
          <p className="text-sm font-bold text-slate-400 leading-relaxed mb-8">Meeting scheduled and added to the list.</p>
          <button onClick={() => setView('list')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg">Back to List</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">Meetings</h2>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{meetings.length} Scheduled</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {view === "list" && (
              <button onClick={() => setView("form")} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all active:scale-95">
                <Plus size={16} /> Schedule
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><X size={24} /></button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[70vh]">
          {view === "list" ? (
            <div className="space-y-4">
              {meetings.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-bold italic">No meetings scheduled yet.</div>
              ) : (
                meetings.map((m) => (
                  <div key={m.id} className="bg-blue-50/50 border border-blue-100 rounded-[28px] p-6 relative group hover:bg-blue-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-black text-slate-800">{m.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Upcoming</span>
                        <button onClick={() => deleteMeeting(m.id)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={18} /></button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-5 text-slate-500 mb-5">
                      <div className="flex items-center gap-2 text-[12px] font-bold"><Calendar size={14} className="text-blue-500" /> {m.date}</div>
                      <div className="flex items-center gap-2 text-[12px] font-bold"><Clock size={14} className="text-blue-500" /> {m.time}</div>
                      <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400">({m.duration})</div>
                    </div>

                    <a href={m.link || "#"} target="_blank" rel="noreferrer" className="text-blue-600 font-black text-sm hover:underline mb-4 inline-block flex items-center gap-1">
                      <LinkIcon size={14}/> Join Meeting
                    </a>

                    <div className="flex -space-x-2">
                      {m.attendees.map(name => (
                        <div key={name} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-white flex items-center justify-center text-white text-[9px] font-black uppercase">
                          {name.substring(0, 2)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Title Input */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Meeting Title</label>
                <input name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 ring-blue-100 transition-all" placeholder="e.g. Design Sync" />
              </div>

              {/* Date/Time Row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Date</label>
                  <input name="date" type="date" value={formData.date} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Time</label>
                  <input name="time" type="time" value={formData.time} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Duration</label>
                  <select name="duration" value={formData.duration} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none">
                    <option>30 min</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                  </select>
                </div>
              </div>

              {/* Link Input */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Meeting Link</label>
                <input name="link" value={formData.link} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-400" placeholder="https://meet.google.com/..." />
              </div>

              {/* Attendees */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Attendees</label>
                <div className="flex flex-wrap gap-2">
                  {attendeesList.map((person) => (
                    <button key={person.name} onClick={() => toggleAttendee(person.name)} className={`px-4 py-2 rounded-full border text-[11px] font-black flex items-center gap-2 transition-all ${selectedAttendees.includes(person.name) ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-500 border-slate-100"}`}>
                      {person.name} {selectedAttendees.includes(person.name) && <CheckSquare size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                <button onClick={() => setView("list")} className="px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={handleScheduleSubmit} className="px-10 py-3.5 rounded-2xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">Confirm Schedule</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingModal;