import React, { useState, useMemo } from 'react';
import { ScheduleMeetingModal, ViewNotesModal } from './ScheduleMeetingModal';
import { useMeetingsHub } from '../../../hooks/useMeetingsHub';
import JitsiVideoCall from '../centralchatt/Video/JitsiVideoCall';

const MeetingsPage = () => {
  const { meetings, isLoading } = useMeetingsHub();
  const [activeModal, setActiveModal] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // --- JITSI SDK CALL STATE ---
  const [isJitsiOpen, setIsJitsiOpen] = useState(false);
  const [activeCallData, setActiveCallData] = useState(null);

  // --- FILTERS STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('All Projects');

  // --- FILTER LOGIC ---
  const filteredMeetings = useMemo(() => {
    if (!meetings) return [];
    return meetings.filter((meeting) => {
      const matchesSearch =
        meeting.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.Project?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProject =
        projectFilter === 'All Projects' || meeting.Project?.name === projectFilter;

      return matchesSearch && matchesProject;
    });
  }, [meetings, searchTerm, projectFilter]);

  // Separate Upcoming and Past
  const upcoming = useMemo(
    () => filteredMeetings.filter((m) => m.status !== 'completed'),
    [filteredMeetings]
  );
  const past = useMemo(
    () => filteredMeetings.filter((m) => m.status === 'completed'),
    [filteredMeetings]
  );

  // Unique Projects for dropdown
  const projects = useMemo(
    () => [
      'All Projects',
      ...new Set(meetings ? meetings.map((m) => m.Project?.name).filter(Boolean) : []),
    ],
    [meetings]
  );

  // --- HANDLE JOIN MEETING (SDK TRIGGER) ---
  const handleJoinMeeting = (meeting) => {
    setActiveCallData({
      roomName: meeting.room_name || meeting.title || `Room-${meeting.id}`,
      activeChat: meeting.Project?.name || 'General',
      currentMeetingId: meeting.id,
      userName: meeting.hostName || 'User',
      userEmail: meeting.hostEmail || '',
    });
    setIsJitsiOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-indigo-100 border-t-indigo-600"></div>
          <span className="absolute text-xl">📹</span>
        </div>
        <p className="text-slate-600 font-semibold mt-4 text-sm tracking-wide animate-pulse">
          Syncing Meetings Hub...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 pb-20 pt-4 px-4 sm:px-6 lg:px-10 mx-auto font-sans">
      
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            Workspace Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Meetings <span className="text-indigo-600">Overview</span>
          </h1>
        </div>

        <button
          onClick={() => setActiveModal('schedule')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Schedule Meeting
        </button>
      </header>

      {/* Modern Filter Bar */}
      <section className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search meetings or projects..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-sm transition-all"
          />
        </div>

        <div className="sm:w-64">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-sm cursor-pointer transition-all"
          >
            {projects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Upcoming Meetings Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-wide">Upcoming Sessions</h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {upcoming.length}
            </span>
          </div>
        </div>

        {upcoming.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {upcoming.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onJoin={() => handleJoinMeeting(meeting)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
              📅
            </div>
            <p className="text-slate-500 font-medium text-sm">No upcoming meetings scheduled.</p>
          </div>
        )}
      </section>

      {/* Past Meetings / History */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-bold text-slate-900 tracking-wide">History & Recaps</h2>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
          {past.length > 0 ? (
            past.map((meeting) => (
              <PastMeetingItem
                key={meeting.id}
                meeting={meeting}
                onRecap={() => {
                  setSelectedMeeting(meeting);
                  setActiveModal('notes');
                }}
              />
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">No meeting history found.</div>
          )}
        </div>
      </section>

      {/* Jitsi SDK In-App Call Window */}
      {isJitsiOpen && activeCallData && (
        <JitsiVideoCall
          isOpen={isJitsiOpen}
          onClose={() => {
            setIsJitsiOpen(false);
            setActiveCallData(null);
          }}
          roomName={activeCallData.roomName}
          activeChat={activeCallData.activeChat}
          currentMeetingId={activeCallData.currentMeetingId}
          userName={activeCallData.userName}
          userEmail={activeCallData.userEmail}
        />
      )}

      {/* Modals */}
      <ScheduleMeetingModal isOpen={activeModal === 'schedule'} onClose={() => setActiveModal(null)} />
      <ViewNotesModal
        isOpen={activeModal === 'notes'}
        onClose={() => setActiveModal(null)}
        meeting={selectedMeeting}
      />
    </div>
  );
};

// --- Sub-Components ---

const MeetingCard = ({ meeting, onJoin }) => {
  const status = (meeting.status || 'scheduled').toLowerCase();
  const isLive = status === 'live';

  return (
    <div className={`p-5 rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between gap-5 ${
      isLive ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' : 'border-slate-100 shadow-sm hover:border-slate-200'
    }`}>
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="inline-block bg-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-1 rounded-lg">
            {meeting.Project?.name || 'General Project'}
          </span>
          
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
            isLive ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
          }`}>
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>}
            {meeting.status || 'Scheduled'}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{meeting.title}</h3>
        
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{new Date(meeting.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-50">
        <button
          onClick={onJoin}
          className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            isLive 
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {isLive ? 'JOIN LIVE CALL' : 'START / JOIN MEETING'}
        </button>
      </div>
    </div>
  );
};

const PastMeetingItem = ({ meeting, onRecap }) => (
  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
    <div className="flex items-center gap-3.5">
      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-800 mb-0.5">{meeting.title}</h4>
        <p className="text-xs text-slate-400 font-medium">
          {meeting.Project?.name || 'General'} • {new Date(meeting.start_time).toLocaleDateString()}
        </p>
      </div>
    </div>

    <button
      onClick={onRecap}
      className="self-end sm:self-center border border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
    >
      View Recap
    </button>
  </div>
);

export default MeetingsPage;