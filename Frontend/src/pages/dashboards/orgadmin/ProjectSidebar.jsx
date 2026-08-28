import React from 'react';

const ProjectSidebar = ({ 
  selectedProjectForSidebar, 
  setSelectedProjectForSidebar, 
  activeTab, 
  setActiveTab, 
  allUsers, 
  setActiveModal, 
  setSelectedProjectId, 
  setSelectedProject,
  projects 
}) => {
  
  const currentProject = projects.find(p => p.id === selectedProjectForSidebar?.id);

  if (!selectedProjectForSidebar || !currentProject) return null;

  const channelName = `# ${currentProject.name?.toLowerCase().replace(/\s+/g, "-") || "project"}`;

  // Find manager inside members context loop if raw object path missing
  const assignedManager = currentProject.members?.find(
    (m) => m.ProjectMember?.project_role === "Manager"
  );

  return (
    <div className="fixed inset-0 z-[150] flex justify-end animate-fade-in">
      {/* Soft Ambient Backdrop overlay */}
      <div
        className="absolute inset-0 bg-slate-900/10 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setSelectedProjectForSidebar(null)}
      />

      {/* --- PREMIUM GLASSMORPHIC SIDEBAR PANEL (Responsive width constraints) --- */}
      <div className="relative w-full max-w-full sm:max-w-md bg-white/80 backdrop-blur-2xl h-full shadow-2xl border-l border-white/60 animate-in slide-in-from-right duration-300 flex flex-col">
        
        {/* Header Region */}
        <div className="p-6 sm:p-8 border-b border-slate-100/70 flex justify-between items-start gap-4">
          <div className="overflow-hidden">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight truncate">
              {currentProject.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {currentProject.project_code || currentProject.code || "N/A"}
              </p>
              <span className="text-[9px] text-indigo-500 font-semibold bg-indigo-50/50 px-1.5 py-0.2 rounded border border-indigo-100/40">
                Workspace Asset
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedProjectForSidebar(null)}
            className="w-8 h-8 shrink-0 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all text-xs font-semibold"
          >
            ✕
          </button>
        </div>

        {/* --- PREMIUM NAVIGATION TABS --- */}
        <div className="flex px-6 sm:p-0 sm:px-8 gap-6 border-b border-slate-100/60 overflow-x-auto scrollbar-none">
          {["Overview", "Team", "Channel"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-xs font-bold tracking-wide transition-all relative whitespace-nowrap ${
                activeTab === tab ? "text-blue-600" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* --- CONTENT CONTAINER --- */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* ========================================================== */}
          {/* 📋 1. OVERVIEW SCREEN COMPONENT                           */}
          {/* ========================================================== */}
          {activeTab === "Overview" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Glass Metadata Rows */}
              <div className="bg-white/50 border border-white/60 p-4 rounded-xl shadow-2xs space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400">Pipeline Status</span>
                  <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${
                    currentProject.status === "ACTIVE" 
                      ? "bg-emerald-50/70 text-emerald-600 border-emerald-100" 
                      : "bg-rose-50/70 text-rose-600 border-rose-100"
                  }`}>
                    {currentProject.status || "UNKNOWN"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400">Assigned Manager</span>
                  <span className="font-bold text-slate-800">
                    {assignedManager?.full_name || currentProject.manager?.full_name || "Unassigned"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400">Deployment Date</span>
                  <span className="font-bold text-slate-700">
                    {currentProject.createdAt ? new Date(currentProject.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "2-digit", year: "numeric"
                    }) : "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400">Cluster Capacity</span>
                  <span className="font-bold text-slate-800 bg-slate-100/60 border border-slate-200/40 px-2 py-0.5 rounded-md text-[11px]">
                    {currentProject.members?.length || 0} Members
                  </span>
                </div>
              </div>

              {/* Responsive Action Core Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button
                  onClick={() => {
                    setSelectedProject(currentProject);
                    setActiveModal("team");
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all active:scale-98"
                >
                  Manage Cluster
                </button>
                <button
                  onClick={() => {
                    setSelectedProject(currentProject);
                    setActiveModal("archive");
                  }}
                  className="flex-1 bg-white border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 py-3 rounded-xl text-xs font-bold shadow-2xs transition-all active:scale-98"
                >
                  Archive Asset
                </button>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 👥 2. TEAM MANAGEMENT VIEW AREA                             */}
          {/* ========================================================== */}
          {activeTab === "Team" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Allocation ({currentProject.members?.length || 0})
                </span>
                <button
                  onClick={() => {
                    setSelectedProject(currentProject);
                    setActiveModal("team");
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm"
                >
                  + Adjust Team
                </button>
              </div>

              {/* Members Listing Deck */}
              <div className="space-y-2.5">
                {currentProject.members?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3.5 border border-white/60 bg-white/40 backdrop-blur-md rounded-xl hover:bg-white/80 transition-all shadow-2xs group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-700 font-bold text-[10px] border border-slate-200/50 uppercase">
                        {member.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 truncate">{member.full_name}</p>
                        <p className="text-[10px] font-medium text-slate-400 truncate">{member.email}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border tracking-wide uppercase shrink-0 ${
                      member.ProjectMember?.project_role === "Manager" 
                        ? "bg-amber-50/80 text-amber-600 border-amber-100" 
                        : "bg-slate-50 text-slate-400 border-slate-100"
                    }`}>
                      {member.ProjectMember?.project_role || "Member"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 💬 3. CHANNEL BACKBONE CONNECTOR                            */}
          {/* ========================================================== */}
          {activeTab === "Channel" && (
            <div className="h-full flex flex-col justify-start pt-4 animate-in fade-in duration-200">
              <div className="w-full p-5 bg-white/50 backdrop-blur-md rounded-xl border border-white/70 mb-5 flex items-center gap-4 shadow-2xs">
                <div className="w-11 h-11 shrink-0 bg-gradient-to-br from-white to-slate-50 border border-slate-200/40 rounded-xl flex items-center justify-center text-lg shadow-2xs">
                  💬
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-800 tracking-tight truncate">{channelName}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                    Sync Channel . {currentProject.members?.length || 0} participants
                  </p>
                </div>
              </div>
              <button className="w-full py-3 border border-indigo-200 text-indigo-600 bg-indigo-50/20 hover:bg-indigo-50/60 rounded-xl text-xs font-bold tracking-wide transition-all active:scale-[0.99]">
                Open Complete Room Channel →
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProjectSidebar;