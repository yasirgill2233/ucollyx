import React from 'react';
import { useState } from 'react';
import { useProjectsData } from '../../../hooks/useProjects';
import { useMeetingsHub } from '../../../hooks/useMeetingsHub';
import { toast } from 'react-hot-toast';
import { useUsersData } from '../../../hooks/useUsers';

export const ScheduleMeetingModal = ({ isOpen, onClose }) => {
  const { createMeeting, isCreating } = useMeetingsHub();
  const { data: hubData } = useProjectsData();
  
  const currentUserId = 1; 

  const projects = hubData?.projectsRes?.projects || [];

  const { data: users = [], isLoading: isUsersLoading } = useUsersData();

  const teamMembers = users

  const [formData, setFormData] = useState({
    title: '',
    project_id: '',
    task_id: '',
    date: '',
    time: '',
    duration: '30 min',
    meeting_url: '',
    description: '',
    participants: []
  });

  const handleSchedule = () => {
    const { title, project_id, date, time, duration } = formData;
    if (!title || !project_id || !date || !time) {
      return toast.error("Mandatory fields missing!");
    }

    const start = new Date(`${date}T${time}`);
    const mins = parseInt(duration) || 30;
    const end = new Date(start.getTime() + mins * 60000);

    const payload = {
      title,
      project_id: parseInt(project_id),
      task_id: formData.task_id || null,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      duration: duration,
      meeting_url: formData.meeting_url || null,
      status: 'scheduled',
      recap_notes: formData.description || null,
      created_by: currentUserId,
      participants: formData.participants.map(userId => ({
        user_id: userId,
        role: 'attendee'
      }))
    };

    createMeeting.mutate(payload, {
      onSuccess: () => {
        onClose();
        setFormData({ title: '', project_id: '', task_id: '', date: '', time: '', duration: '30 min', meeting_url: '', description: '', participants: [] });
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-left">
      <div className="bg-white w-full max-w-[550px] rounded-lg shadow-2xl p-8 relative animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 bg-gray-50 rounded-lg p-1.5 hover:bg-gray-100 font-bold">✕</button>
        
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">📅</span> Schedule Workspace Meeting
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meeting Title *</label>
            <input 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              type="text" className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50/50 outline-none focus:ring-2 focus:ring-blue-500/20" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project *</label>
              <select 
                onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50/50 outline-none cursor-pointer"
              >
                <option value="">Select Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task ID (Optional)</label>
              <input 
                onChange={(e) => setFormData({...formData, task_id: e.target.value})}
                type="text" className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50/50 outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date *</label>
              <input onChange={(e) => setFormData({...formData, date: e.target.value})} type="date" className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50/50 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time *</label>
              <input onChange={(e) => setFormData({...formData, time: e.target.value})} type="time" className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50/50 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration</label>
              <select onChange={(e) => setFormData({...formData, duration: e.target.value})} className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50/50 outline-none">
                <option value="15 min">15 min</option>
                <option value="30 min">30 min</option>
                <option value="60 min">1 hour</option>
                <option value="120 min">2 hours</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invite Participants (Table 25)</label>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50/50 border border-gray-100 rounded-lg min-h-[45px]">
               {teamMembers.map(user => (
                 <button 
                  key={user.id}
                  onClick={() => {
                    const isSelected = formData.participants.includes(user.id);
                    setFormData({
                      ...formData,
                      participants: isSelected 
                        ? formData.participants.filter(id => id !== user.id)
                        : [...formData.participants, user.id]
                    });
                  }}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${formData.participants.includes(user.id) ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300'}`}
                 >
                  {user.name}
                 </button>
               ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meeting Link</label>
            <input 
              onChange={(e) => setFormData({...formData, meeting_url: e.target.value})}
              type="text" className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50/50 outline-none" placeholder="https://meet.google.com/..." 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Agenda</label>
            <textarea 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50/50 h-20 resize-none outline-none" 
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-8 py-3 rounded-lg text-sm font-bold text-gray-500 border border-gray-100 hover:bg-gray-50">Cancel</button>
          <button 
            disabled={isCreating}
            onClick={handleSchedule}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            {isCreating ? 'Syncing Hub...' : 'Schedule Meeting'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const JoinMeetingModal = ({ isOpen, onClose, meeting }) => {
  if (!isOpen) return null;

  const handleJoin = () => {
    if (meeting?.meeting_url || meeting?.meeting_link) {
      window.open(meeting.meeting_url || meeting.meeting_link, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[460px] rounded-lg shadow-2xl p-8 relative animate-in slide-in-from-bottom-5 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">✕</button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3.5 h-3.5 bg-green-500 rounded-lg animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight text-left">{meeting?.title}</h2>
        </div>

        <div className="bg-green-50/60 border border-green-100 rounded-lg p-5 mb-8 text-left text-left">
          <p className="text-green-600 font-black text-[11px] uppercase tracking-widest mb-1 text-left">Meeting Is Live Now</p>
          <p className="text-slate-500 text-[13px] font-medium text-left">
            {meeting?.Project?.name} • {new Date(meeting?.start_time).toLocaleString()}
          </p>
        </div>

        <div className="space-y-8 text-left">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Meeting Link</label>
            <div className="flex items-center justify-between border border-blue-100 bg-blue-50/30 rounded-lg px-5 py-3.5">
              <span className="text-blue-500 text-xs font-bold truncate pr-4">
                {meeting?.meeting_url || meeting?.meeting_link || 'No link provided'}
              </span>
              <button 
                onClick={() => navigator.clipboard.writeText(meeting?.meeting_url)}
                className="text-slate-300 hover:text-blue-500"
              >📋</button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-10">
          <button onClick={onClose} className="px-8 py-3 rounded-lg text-sm font-bold text-slate-400 border border-slate-100">Close</button>
          <button 
            onClick={handleJoin}
            className="px-8 py-3 bg-[#10b981] text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-xl shadow-green-100 hover:bg-[#059669]"
          >
            🚀 Join Now
          </button>
        </div>
      </div>
    </div>
  );
};

export const ViewNotesModal = ({ isOpen, onClose, meeting }) => {

  console.log(meeting, "meeting data in view notes modal");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-left">
      <div className="bg-white w-full max-w-[600px] rounded-lg shadow-2xl p-10 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600">✕</button>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
          <span className="text-2xl">📋</span> {meeting?.title}
        </h2>
        <p className="text-[13px] text-slate-400 font-medium mb-8">
           {new Date(meeting?.start_time).toLocaleDateString()} • {meeting?.Project?.name} • Ended
        </p>

        <div className="space-y-8">
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-left">Meeting Summary</h3>
            <div className="text-[14px] text-slate-600 leading-[1.6] bg-slate-50/50 border border-slate-100 rounded-lg p-6">
              {meeting?.recap_notes || "Summary is being processed or was not generated for this session."}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-left">Attendees</h3>
            <div className="flex -space-x-3">
               {meeting?.Participants?.map((member, i) => (
                 <div key={i} title={member?.full_name} className="w-10 h-10 rounded-lg border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                    {/* {member?.full_name?.substring(0, 2).toUpperCase()} */}
                    {member?.avatar_url ? (
                  <img
                    src={member?.avatar_url}
                    alt="Avatar"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />
                ) : member?.full_name ? (
                  member?.full_name[0]
                ) : (
                  "U"
                )}
                 </div>
               ))}
               {(!meeting?.Participants || meeting.Participants.length === 0) && <p className="text-xs text-slate-400 ml-4 font-bold">No participants recorded</p>}
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-3 mt-12 pt-8 border-t border-slate-50">
           <button onClick={onClose} className="px-8 py-3 rounded-lg text-sm font-bold text-slate-400 border border-slate-100">Close</button>
           {/* <button className="px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-xl shadow-blue-100">
              ⬇ Export PDF
           </button> */}
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeetingModal;