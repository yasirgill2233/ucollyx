import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronDown, 
  ChevronRight, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  LayoutGrid, 
  ListFilter, 
  Clock,
  Calendar
} from 'lucide-react';
import API from '../../../api/axios';

const ManagerPortfolio = () => {
  const navigate = useNavigate();

  // ⚡ DYNAMIC STATES FOR INTERACTIVE FILTER MATRIX
  const [statusFilter, setStatusFilter] = useState('All'); // Options: 'All', 'Healthy', 'Critical'
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSprintDropdown, setShowSprintDropdown] = useState(false);
  
  const [selectedSprintFrame, setSelectedSprintFrame] = useState('All'); // Options: 'All', 'Current', 'Future'
  // 1. BACKEND DYNAMIC CORE STREAM SYNC
  const { data: portfolioResponse, isLoading, error } = useQuery({
    queryKey: ['manager-portfolio-dashboard'],
    queryFn: async () => {
      const res = await API.get('/projects/manager-portfolio'); 
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  // Extract raw list safely from backend structure response
  const allProjects = useMemo(() => portfolioResponse?.data || [], [portfolioResponse]);

  // ⚡ 2. ACTIVE FILTERS PROCESSING PIPELINE (Pipeline Execution Matrix)
  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      // Rule A: Evaluate Project Criticality State
      const isProjectCritical = project.status === 'Critical' || parseInt(project.redCards || 0) > 0;
      
      let matchesStatus = true;
      if (statusFilter === 'Critical') matchesStatus = isProjectCritical;
      if (statusFilter === 'Healthy') matchesStatus = !isProjectCritical;

      // Rule B: Evaluate Sprint Timeline Framework Status (If backend supports sprint tracking)
      let matchesSprint = true;
      if (selectedSprintFrame !== 'All' && project.active_sprint_status) {
        matchesSprint = project.active_sprint_status === selectedSprintFrame.toLowerCase();
      }

      return matchesStatus && matchesSprint;
    });
  }, [allProjects, statusFilter, selectedSprintFrame]);

  // 3. METRICS ACCUMULATION ENGINE (Calculates counts based on raw projects data)
  const stats = useMemo(() => {
    const totalProjects = allProjects.length;
    const criticalOnes = allProjects.filter(p => p.status === 'Critical' || parseInt(p.redCards || 0) > 0).length;
    const totalRedCards = allProjects.reduce((acc, p) => acc + parseInt(p.redCards || 0), 0);
    const healthyOnes = totalProjects - criticalOnes;

    return [
      { label: "Projects", val: totalProjects, sub: "Active Track", icon: <LayoutGrid size={12}/> },
      { label: "Issues", val: criticalOnes, sub: "Critical Core", color: "text-red-500", icon: <AlertCircle size={12}/> },
      { label: "Red Cards", val: totalRedCards, sub: "Global Count", icon: <Activity size={12}/> },
      { label: "Healthy", val: healthyOnes >= 0 ? healthyOnes : 0, sub: "On Track", color: "text-emerald-600", icon: <CheckCircle2 size={12}/> },
    ];
  }, [allProjects]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 animate-pulse">
          Syncing Portfolio Metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans selection:bg-blue-100 text-left">
      
      {/* Top Dynamic Header Matrix */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Portfolio <span className="text-slate-400 font-bold">Overview</span>
          </h1>
        </div>
        
        {/* Interactive Filters Controls Row */}
        <div className="flex gap-3 relative">
          
          {/* ⚡ STATUS FILTER DROP-DOWN BUTTON */}
          <div className="relative">
            <button 
              onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowSprintDropdown(false); }}
              className={`flex items-center gap-2 border px-4 py-2 rounded-md text-[11px] font-black shadow-sm transition-all uppercase ${
                statusFilter !== 'All' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
               <ListFilter size={14}/> Filter: {statusFilter} <ChevronDown size={12}/>
            </button>
            {showStatusDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-md shadow-xl z-[200] py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                {['All', 'Healthy', 'Critical'].map((option) => (
                  <button
                    key={option}
                    onClick={() => { setStatusFilter(option); setShowStatusDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold block ${statusFilter === option ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {option === 'All' ? 'Show All Tracks' : `${option} Projects`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ⚡ SPRINT TIMELINE FILTER DROP-DOWN BUTTON */}
          <div className="relative">
            <button 
              onClick={() => { setShowSprintDropdown(!showSprintDropdown); setShowStatusDropdown(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-black shadow-md transition-all uppercase ${
                selectedSprintFrame !== 'All' ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
              }`}
            >
               <Calendar size={14}/> SPRINT: {selectedSprintFrame} <ChevronDown size={12}/>
            </button>
            {showSprintDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-md shadow-xl z-[200] py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                {['All', 'Current', 'Future'].map((frame) => (
                  <button
                    key={frame}
                    onClick={() => { setSelectedSprintFrame(frame); setShowSprintDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold block ${selectedSprintFrame === frame ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {frame === 'All' ? 'All Sprint Cycles' : `Active ${frame} Sprint`}
                  </button>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Top Metrics Counter Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-slate-100 p-5 rounded-md shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-2">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{s.label}</p>
               <div className="p-1.5 bg-slate-50 rounded-md group-hover:bg-indigo-50 transition-colors">
                  {s.icon}
               </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-2xl font-black ${s.color || 'text-slate-900'}`}>{s.val}</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Filtered Project Stream Cards Grid Layout */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((p) => {
            const isProjectCritical = p.status === 'Critical' || parseInt(p.redCards || 0) > 0;
            const contextColorTheme = isProjectCritical ? 'bg-red-500' : 'bg-blue-600';

            const formattedStartDate = p.start_date ? new Date(p.start_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "TBD";
            const formattedEndDate = p.end_date ? new Date(p.end_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "TBD";

            return (
              <div key={p.id} className="bg-white border border-slate-100 rounded-md p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                 <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.03] blur-3xl ${contextColorTheme}`}></div>

                 <div className="flex justify-between items-start mb-6">
                    <div className="max-w-[160px] sm:max-w-[200px]">
                       <h3 className="text-[15px] font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors truncate">
                         {p.name}
                       </h3>
                       <div className="flex items-center gap-2">
                          <Clock size={10} className="text-slate-300 shrink-0"/>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter truncate">
                            {formattedStartDate} — {formattedEndDate}
                          </p>
                       </div>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border shrink-0 ${
                      isProjectCritical ? 'bg-red-50 border-red-100 text-red-500 animate-pulse' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                    }`}>
                      ● {isProjectCritical ? "Critical" : "Healthy"}
                    </span>
                 </div>

                 {/* Progress Bar Layer */}
                 <div className="mb-6">
                    <div className="flex justify-between text-[11px] font-black mb-2">
                       <span className="text-slate-400 uppercase tracking-widest">Sprint Progress</span>
                       <span className="text-slate-900">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-[1px]">
                       <div 
                         className={`${contextColorTheme} h-full rounded-full transition-all duration-1000 ease-out`} 
                         style={{ width: `${p.progress}%` }}
                       />
                    </div>
                 </div>

                 {/* Metric Badges Segment Node Mapping */}
                 <div className="grid grid-cols-3 gap-3 mb-6">
                    <Badge label="Tasks Done" val={p.tasksCount || "0/0"} color="text-slate-700" />
                    <Badge label="Red Cards" val={p.redCards > 0 && p.redCards < 10 ? `0${p.redCards}` : p.redCards || "00"} color={parseInt(p.redCards) > 0 ? 'text-red-500 font-black' : 'text-slate-400'} />
                    <Badge label="Blocked" val={p.blockedCount || 0} color={p.blockedCount > 0 ? 'text-amber-500 font-black' : 'text-slate-400'} />
                 </div>

                 {/* Bottom Board Row Metrics Info */}
                 <div className="flex justify-between items-center pt-5 border-t border-slate-50">
                    <div className="flex gap-4">
                        <MiniStat label="To Do" val={p.todoCount || 0} color="text-slate-400" />
                        <MiniStat label="In Progress" val={p.inprogressCount || 0} color="text-blue-500" />
                        <MiniStat label="Done" val={p.doneCount || 0} color="text-emerald-500" />
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/manager/details`, { state: { project: p } })}
                      className="bg-slate-50 text-[10px] font-black text-slate-600 px-4 py-2 rounded-md hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1 group/btn shadow-inner"
                    >
                        DETAILS 
                        <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform"/>
                    </button>
                 </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State View Layer Context */
        <div className="text-center py-20 bg-white border border-slate-100 rounded-md shadow-sm">
          <LayoutGrid className="text-slate-200 mx-auto mb-3" size={40} />
          <h3 className="font-black text-slate-700 text-base">No Matching Tracks Found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">Try resetting the filter matrix dropdown criteria to explore existing project streams.</p>
        </div>
      )}
    </div>
  );
};

// --- SUBSIDIARY PRESENTATIONAL COMPONENTS ---
const Badge = ({ label, val, color }) => (
  <div className="bg-slate-50/70 rounded-md py-3 px-2 border border-slate-100 text-center transition-all hover:bg-white hover:border-indigo-100">
    <p className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-widest truncate">{label}</p>
    <p className={`text-[10px] font-black tracking-tight ${color}`}>{val}</p>
  </div>
);

const MiniStat = ({ label, val, color }) => (
  <div className="flex flex-col">
    <span className={`text-xs font-black leading-none ${color || 'text-slate-800'}`}>{val}</span>
    <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter mt-1">{label}</span>
  </div>
);

export default ManagerPortfolio;