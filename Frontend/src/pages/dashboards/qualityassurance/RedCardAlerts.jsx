import React, { useState, useMemo } from "react";
import { AlertCircle, Clock, ChevronDown, Search, ShieldAlert, Zap } from "lucide-react";
import { usePriorityAlerts } from "../../../hooks/useIssues";
import { useMyProjects } from "../../../hooks/useProjects"; // Projects load karne ke liye aapka hook
import AlertDetailsSidebar from "./AlertDetailsSidebar";
import { useLocation } from "react-router";

const RedCardsAlerts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [selectedAlert, setSelectedAlert] = useState(null);

  const location = useLocation();

// 🔥 FIXED: Aapke navigate state ke 'bugs' object ke sath key structuring properly map ho rahi hai
const navigatedStatus = useMemo(() => {
  return {
    st1: location.state?.bugs?.st1 || "Open",  // state.bugs.st1 ko read karega
    st2: location.state?.bugs?.st2 || "New"     // state.bugs.st2 ko read karega
  };
}, [location.state]);

const pageTitle = location.state?.title || "Live Priority Alerts";

  // --- 1. LIVE REACT QUERY CALLS ---
  const { data: myProjects } = useMyProjects();
  const projects = myProjects?.data || [];

  const { data: incomingData = [], isLoading, isError, error } = usePriorityAlerts(navigatedStatus);

  // --- 2. DATA SYNCHRONIZATION & MAPPING ---
  const rawAlerts = useMemo(() => {
    if (!Array.isArray(incomingData)) return [];

    return incomingData.map(bug => {
      // String split safeguard check
      const rawSteps = bug?.steps_to_repro || "";
      const stepsArray = typeof rawSteps === "string" ? rawSteps.split('\n') : [];

      const severity = (bug?.severity || "MEDIUM").toUpperCase();
      const status = bug?.status || "New";

      return {
        id: bug?.id,
        title: bug?.title,
        platform_id: bug?.project_id, // Relation key tracker
        // Fallback checks for user relations model bindings
        user: bug?.reporter?.full_name || bug?.assignee?.full_name || "Unassigned", 
        time: bug?.createdAt ? new Date(bug.createdAt).toLocaleDateString() : "Just now",
        status: bug?.status,
        severity: bug?.severity,
        steps: stepsArray,
        expected: bug?.expected_result || "",
        actual: bug?.actual_result || "",
        comments: bug?.comments,
        
        // Dynamic UI Styles
        statusStyle: ["NEW"].includes(status.toUpperCase()) 
          ? "text-red-500 border-red-100 bg-red-50" 
          : "text-blue-500 border-blue-100 bg-blue-50",
          
        priorityStyle: 
          severity === "CRITICAL" ? "bg-red-600 text-white" : 
          severity === "HIGH" ? "bg-orange-500 text-white" : 
          severity === "MEDIUM" ? "bg-yellow-400 text-slate-900" : "bg-slate-400 text-white",
          
        accentColor: severity === "CRITICAL" ? "border-l-red-600" : severity === "HIGH" ? "border-l-orange-500" : "border-l-blue-400",
      };
    });
  }, [incomingData]);

  // --- 3. FILTER LOGIC MATCHING DYNAMIC PROJECT IDs ---
  const filteredAlerts = useMemo(() => {
    return rawAlerts.filter(alert => {
      const matchesSearch = 
        (alert.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        String(alert.id || "").toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesProject = 
        projectFilter === "All Projects" || String(alert.platform_id) === String(projectFilter);

      return matchesSearch && matchesProject;
    });
  }, [searchTerm, projectFilter, rawAlerts]);

  // --- 4. LOADING & ERROR STATES WRAPPERS ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FBFDFF]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-6 bg-[#FBFDFF]">
        <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Failed to sync priority feeds</h3>
        <p className="text-xs text-slate-400 mt-1">{error?.message || "Check server API instances."}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FBFDFF] p-6 min-h-screen font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-md border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
            Priority Alerts Feed
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[9px] font-black">
              {filteredAlerts.length}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text"
              placeholder="Search by ID or Title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold focus:ring-4 focus:ring-blue-500/5 outline-none w-56 transition-all"
            />
          </div>

          {/* 🔥 DYNAMIC FILTER DROPDOWN INTEGRATION */}
          <select 
            className="bg-white border border-slate-200 px-3 py-2 rounded-md text-[10px] font-black uppercase tracking-wider text-slate-500 outline-none cursor-pointer"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="All Projects">All Projects</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => setSelectedAlert(alert)}
            className={`group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-md shadow-sm border-l-[5px] ${alert.accentColor} hover:shadow-md transition-all duration-200 cursor-pointer`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-md ${alert.severity === 'CRITICAL' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                {alert.severity === 'CRITICAL' ? <ShieldAlert size={20} /> : <AlertCircle size={20} />}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                   <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${alert.priorityStyle}`}>
                    {alert.severity}
                   </span>
                   <span className="text-[10px] font-black text-slate-300">#{alert.id}</span>
                </div>
                
                <h3 className="text-[14px] font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {alert.title}
                </h3>
                
                <div className="flex items-center gap-3 mt-1.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                    Project ID: {alert.platform_id}
                  </p>
                  <div className="flex items-center gap-3 border-l border-slate-100 pl-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[8px] font-black text-slate-400 border border-slate-200">
                        {alert?.user?.charAt(0)}
                      </div>
                      <span className="text-[10px] font-bold text-slate-600">{alert.user}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock size={12} />
                      <span className="text-[9px] font-bold">{alert.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`px-3 py-1.5 rounded-md text-[9px] font-black border tracking-tighter uppercase ${alert.statusStyle}`}>
                {alert.status}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-300 -rotate-90 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && <EmptyState />}
      </div>

      {selectedAlert && (
        <AlertDetailsSidebar
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 bg-white border border-dashed border-slate-200 rounded-[32px]">
     <Zap size={32} className="text-slate-100 mb-4" />
     <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No active priority items found</p>
  </div>
);

export default RedCardsAlerts;