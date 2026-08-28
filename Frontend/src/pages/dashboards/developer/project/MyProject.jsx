// import React, { useState } from "react";
// import {
//   Layout,
//   Code2,
//   ChevronDown,
//   Search,
//   Filter,
//   ExternalLink,
//   Activity,
//   Loader2
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useMyProjects, useProjectsData } from "../../../../hooks/useProjects";

// const MyProject = () => {
//   const navigate = useNavigate();
  
//   // 1. Direct Working Fetch Hook API Data 
//   const { data: myProjects, isLoading: projectLoading, isError: projectError } = useMyProjects();
//   console.log("Hey There I am using whatsapp:", myProjects?.data);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All Status");
//   const [rolesFilter, setRolesFilter] = useState("All Roles");

//   const queryParams = {
//     search: searchTerm || undefined,
//     status: statusFilter === "All Status" ? undefined : statusFilter,
//     role: rolesFilter === "All Roles" ? undefined : rolesFilter,
//   };

//   // Background queries filtering hook tracker
//   const { data: apiResponse } = useProjectsData(queryParams);

//   // 2. Fallback Data Pipeline mapping (Console key array injection match ki hai)
//   const projectsList = myProjects?.data || [];
  
//   // Dynamic metrics sync rules base tracker
//   const apiStats = apiResponse?.stats || {
//     total: projectsList.length,
//     active: projectsList.filter(p => p.status === "Active").length,
//     onHold: projectsList.filter(p => p.status === "On Hold").length,
//     fullStack: projectsList.filter(p => p.role === "Full Stack" || !p.role).length
//   };

//   // Badges theme mapping configurations handler
//   const getBadgeClasses = (type, value) => {
//     // Handling fallback checks for undefined items safely
//     const safeValue = value || (type === 'role' ? 'Full Stack' : 'Active');

//     if (type === 'role') {
//       if (safeValue === 'Full Stack') return "bg-blue-50 text-blue-600 border-blue-100";
//       if (safeValue === 'Frontend') return "bg-cyan-50 text-cyan-600 border-cyan-100";
//       return "bg-purple-50 text-purple-600 border-purple-100";
//     }
//     if (safeValue === 'Active') return "bg-emerald-50 text-emerald-600 border-emerald-100";
//     if (safeValue === 'On Hold') return "bg-orange-50 text-orange-600 border-orange-100";
//     return "bg-slate-50 text-slate-500 border-slate-100";
//   };

//   const formatCount = (num) => String(num).padStart(2, '0');

//   const statsDashboard = [
//     { label: "Total Projects", count: formatCount(apiStats.total), color: "from-blue-600 to-indigo-600" },
//     { label: "Active Projects", count: formatCount(apiStats.active), color: "from-emerald-500 to-teal-600" },
//     { label: "On Hold", count: formatCount(apiStats.onHold), color: "from-orange-400 to-rose-500" },
//     { label: "Full Stack Roles", count: formatCount(apiStats.fullStack), color: "from-purple-500 to-violet-600" },
//   ];

//   // 3. Local Search & Selection Filters Logic Over Array
//   const localFilteredProjects = projectsList.filter((project) => {
//     const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === "All Status" || project.status === statusFilter;
//     const projectRole = project.role || "Full Stack"; // Fallback to protect UI from blank fields
//     const matchesRoles = rolesFilter === "All Roles" || projectRole === rolesFilter;
    
//     return matchesSearch && matchesStatus && matchesRoles;
//   });

//   const handleProjectClick = (slug) => {
//     localStorage.setItem("slug", slug);
//     navigate(`/dev/ide/${slug}`);
//   };

//   return (
//     <div className="flex-1 bg-[#F8FAFC] p-8 overflow-y-auto font-sans">
      
//       {/* Top Main Heading */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
//         <div>
//           <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
//             Project Hub
//           </h1>
//           <p className="text-slate-500 text-sm mt-1 font-medium text-balance">
//             Manage and monitor your ongoing ecosystem developments.
//           </p>
//         </div>
//       </div>

//       {/* Dynamic Counter Grid System */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//         {statsDashboard.map((stat, i) => (
//           <div
//             key={i}
//             className="bg-white p-6 rounded-md border border-slate-100 shadow-sm relative overflow-hidden group animate-in fade-in duration-200"
//           >
//             <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${stat.color}`} />
//             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">
//               {stat.label}
//             </p>
//             <div className="flex items-end justify-between">
//               <h2 className="text-3xl font-black text-slate-800 tracking-tight">
//                 {projectLoading ? "..." : stat.count}
//               </h2>
//               <div className="p-2 bg-slate-50 rounded-lg group-hover:scale-110 transition-transform">
//                 <Activity size={16} className="text-slate-400" />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Filters Form Blocks */}
//       <div className="bg-white p-4 rounded-md border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
//         <div className="relative w-full md:w-96">
//           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input
//             type="text"
//             placeholder="Search projects..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full bg-slate-50 border border-slate-100 rounded-md py-2.5 pl-12 pr-4 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white transition-all text-slate-700 font-medium"
//           />
//         </div>

//         <div className="flex gap-2 w-full md:w-auto">
//           {/* Status Dropdown */}
//           <div className="relative flex-1 md:flex-none md:w-44">
//             <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="appearance-none bg-white border border-slate-200 rounded-md pl-10 pr-10 py-2.5 text-xs font-bold text-slate-600 outline-none cursor-pointer hover:border-slate-300 transition-all w-full"
//             >
//               <option>All Status</option>
//               <option>Active</option>
//               <option>On Hold</option>
//               <option>Archived</option>
//             </select>
//             <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
//           </div>

//           {/* Role Dropdown */}
//           <div className="relative flex-1 md:flex-none md:w-44">
//             <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
//             <select
//               value={rolesFilter}
//               onChange={(e) => setRolesFilter(e.target.value)}
//               className="appearance-none bg-white border border-slate-200 rounded-md pl-10 pr-10 py-2.5 text-xs font-bold text-slate-600 outline-none cursor-pointer hover:border-slate-300 transition-all w-full"
//             >
//               <option>All Roles</option>
//               <option>Full Stack</option>
//               <option>Backend</option>
//               <option>Frontend</option>
//             </select>
//             <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
//           </div>
//         </div>
//       </div>

//       {/* Main Table Content Container */}
//       <div className="bg-white rounded-md border border-slate-100 shadow-sm overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-slate-50/50 border-b border-slate-100">
//                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Details</th>
//                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
//                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
//                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Synced Activity</th>
//                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-50">
              
//               {/* LOADING STATE LOGIC OVERLAYS */}
//               {projectLoading && (
//                 <tr>
//                   <td colSpan="5" className="px-8 py-20 text-center text-slate-400">
//                     <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
//                     <p className="text-[10px] font-black uppercase tracking-widest">Streaming database registry logs...</p>
//                   </td>
//                 </tr>
//               )}

//               {/* ERROR BLOCK SAFE GUARD */}
//               {!projectLoading && projectError && (
//                 <tr>
//                   <td colSpan="5" className="px-8 py-20 text-center text-red-500 bg-red-50/20">
//                     <p className="text-sm font-black uppercase tracking-wider">Ecosystem Pipeline Interrupted</p>
//                     <p className="text-xs font-semibold mt-1 text-slate-400">Could not resolve operational queries against master backend channels.</p>
//                   </td>
//                 </tr>
//               )}

//               {/* LIVE DATA ROWS GENERATOR */}
//               {!projectLoading && !projectError && localFilteredProjects.map((project, idx) => {
//                 // Formatting time cleanly using fallback
//                 const activityTime = project.updatedAt 
//                   ? new Date(project.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
//                   : "Active now";

//                 return (
//                   <tr key={project.id || idx} className="hover:bg-slate-50/40 transition-colors group animate-in fade-in duration-100">
//                     <td className="px-8 py-6">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black shadow-inner uppercase select-none">
//                           {(project.name || "P").charAt(0)}
//                         </div>
//                         <div>
//                           <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate(`/dev/board?projectId=${project.id}`)}>
//                             {project.name}
//                           </p>
//                           <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
//                             <ExternalLink size={10} /> ucollyx.com/${project.slug || `project-${project.id}`}
//                           </p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-8 py-6">
//                       <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${getBadgeClasses('role', project.role)}`}>
//                         {project.role || "Full Stack"}
//                       </span>
//                     </td>
//                     <td className="px-8 py-6">
//                       <div className="flex items-center gap-2">
//                         <div className={`w-1.5 h-1.5 rounded-full ${project.status === "Active" ? "bg-emerald-500" : "bg-orange-400"}`} />
//                         <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${getBadgeClasses('status', project.status)}`}>
//                           {project.status || "Active"}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-8 py-6">
//                       <p className="text-xs text-slate-500 font-semibold">
//                         {activityTime}
//                       </p>
//                     </td>
//                     <td className="px-8 py-6">
//                       <div className="flex items-center justify-center gap-2">
//                         <button
                        
//                           onClick={() => navigate(`/dev/board?projectId=${project.id}&projectName=${project.name}`)}
//                           className="p-2.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
//                           title="Kanban Board Workspace"
//                         >
//                           <Layout size={16} />
//                         </button>
//                         <button
//                           onClick={()=>handleProjectClick(project.slug)}
//                           className="p-2.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 transition-all shadow-sm active:scale-95"
//                           title="Open Cloud IDE"
//                         >
//                           <Code2 size={16} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}

//               {/* EMPTY STATE BLOCK INTERFACE */}
//               {!projectLoading && !projectError && localFilteredProjects.length === 0 && (
//                 <tr>
//                   <td colSpan="5" className="px-8 py-20 text-center">
//                     <div className="flex flex-col items-center opacity-40">
//                       <Search size={40} className="mb-4 text-slate-400" />
//                       <p className="text-lg font-bold text-slate-700">No projects found</p>
//                       <p className="text-sm font-medium text-slate-400">Try adjusting your search query parameters or selection filter tags.</p>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyProject;



import React, { useState } from "react";
import {
  Layout,
  Code2,
  ChevronDown,
  Search,
  Filter,
  ExternalLink,
  Activity,
  Loader2,
  List,
  Grid,
  Plus,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMyProjects, useProjectsData } from "../../../../hooks/useProjects";

const MyProject = () => {
  const navigate = useNavigate();
  
  // 1. Direct Working Fetch Hook API Data 
  const { data: myProjects, isLoading: projectLoading, isError: projectError } = useMyProjects();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [rolesFilter, setRolesFilter] = useState("All Roles");
  const [mobileLayoutMode, setMobileLayoutMode] = useState("cards"); // 'cards' | 'list'

  const queryParams = {
    search: searchTerm || undefined,
    status: statusFilter === "All Status" ? undefined : statusFilter,
    role: rolesFilter === "All Roles" ? undefined : rolesFilter,
  };

  // Background queries filtering hook tracker
  const { data: apiResponse } = useProjectsData(queryParams);

  // 2. Fallback Data Pipeline mapping
  const projectsList = myProjects?.data || [];
  
  // Dynamic metrics sync rules base tracker
  const apiStats = apiResponse?.stats || {
    total: projectsList.length,
    active: projectsList.filter(p => p.status === "Active").length,
    onHold: projectsList.filter(p => p.status === "On Hold").length,
    fullStack: projectsList.filter(p => p.role === "Full Stack" || !p.role).length
  };

  // Modernized Badges theme mapping configurations handler
  const getBadgeClasses = (type, value) => {
    const safeValue = value || (type === 'role' ? 'Full Stack' : 'Active');

    if (type === 'role') {
      if (safeValue === 'Full Stack') return "bg-blue-50/80 text-blue-600 border-blue-200/60 shadow-xs";
      if (safeValue === 'Frontend') return "bg-cyan-50/80 text-cyan-600 border-cyan-200/60 shadow-xs";
      return "bg-purple-50/80 text-purple-600 border-purple-200/60 shadow-xs";
    }
    if (safeValue === 'Active') return "bg-emerald-50/80 text-emerald-600 border-emerald-200/60 shadow-xs";
    if (safeValue === 'On Hold') return "bg-amber-50/80 text-amber-600 border-amber-200/60 shadow-xs";
    return "bg-slate-100/80 text-slate-500 border-slate-200/60 shadow-xs";
  };

  const formatCount = (num) => String(num).padStart(2, '0');

  const statsDashboard = [
    { label: "Total Projects", count: formatCount(apiStats.total), color: "from-blue-600 via-indigo-600 to-violet-600", iconBg: "bg-blue-50 text-blue-600" },
    { label: "Active Status", count: formatCount(apiStats.active), color: "from-emerald-500 via-teal-500 to-cyan-600", iconBg: "bg-emerald-50 text-emerald-600" },
    { label: "On Hold", count: formatCount(apiStats.onHold), color: "from-amber-400 via-orange-500 to-rose-500", iconBg: "bg-amber-50 text-amber-600" },
    { label: "Full Stack", count: formatCount(apiStats.fullStack), color: "from-purple-500 via-violet-600 to-indigo-600", iconBg: "bg-purple-50 text-purple-600" },
  ];

  // 3. Local Search & Selection Filters Logic Over Array
  const localFilteredProjects = projectsList.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || project.status === statusFilter;
    const projectRole = project.role || "Full Stack";
    const matchesRoles = rolesFilter === "All Roles" || projectRole === rolesFilter;
    
    return matchesSearch && matchesStatus && matchesRoles;
  });

  const handleProjectClick = (slug) => {
    localStorage.setItem("slug", slug);
    navigate(`/dev/ide/${slug}`);
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] pb-24 lg:pb-12 p-4 sm:p-6 lg:p-8 overflow-y-auto font-sans min-h-screen relative selection:bg-blue-500 selection:text-white">
      
      {/* 🌟 MODERN TOP BAR */}
      <div className="flex items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
              Project Hub
            </h1>
            <Sparkles size={18} className="text-blue-500 animate-pulse hidden sm:inline-block" />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            Manage and monitor your ongoing ecosystem developments.
          </p>
        </div>

        {/* Mobile View Toggle Switch */}
        <div className="flex lg:hidden bg-slate-200/60 backdrop-blur-md p-1 rounded-2xl shrink-0 border border-slate-200/50">
          <button
            onClick={() => setMobileLayoutMode("cards")}
            className={`p-2 rounded-xl transition-all duration-200 ${mobileLayoutMode === "cards" ? "bg-white text-blue-600 shadow-sm font-bold" : "text-slate-500"}`}
            title="Grid Cards View"
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setMobileLayoutMode("list")}
            className={`p-2 rounded-xl transition-all duration-200 ${mobileLayoutMode === "list" ? "bg-white text-blue-600 shadow-sm font-bold" : "text-slate-500"}`}
            title="Compact List View"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* 📊 MODERN METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-5 mb-6 lg:mb-8">
        {statsDashboard.map((stat, i) => (
          <div
            key={i}
            className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group"
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color}`} />
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest truncate">
                {stat.label}
              </p>
              <div className={`p-2 rounded-xl ${stat.iconBg} transition-transform group-hover:scale-110`}>
                <Activity size={15} />
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {projectLoading ? "..." : stat.count}
            </h2>
          </div>
        ))}
      </div>

      {/* 🔍 MODERN SEARCH & FILTERS BAR */}
      <div className="bg-white/80 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200/70 shadow-xs mb-6 space-y-3 lg:space-y-0 lg:flex lg:gap-4 lg:justify-between lg:items-center">
        
        {/* Search Bar */}
        <div className="relative w-full lg:w-96">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl py-2.5 pl-11 pr-4 text-xs sm:text-sm outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500/40 focus:bg-white transition-all text-slate-700 font-medium placeholder:text-slate-400"
          />
        </div>

        {/* Mobile Filter Chips */}
        <div className="flex lg:hidden overflow-x-auto gap-2 pb-1 scrollbar-none">
          {["All Status", "Active", "On Hold", "Archived"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border ${
                statusFilter === st
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-slate-50 text-slate-600 border-slate-200/70 active:bg-slate-100"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Desktop Filter Dropdowns */}
        <div className="hidden lg:flex gap-2.5 w-full lg:w-auto">
          <div className="relative lg:w-44">
            <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50/80 border border-slate-200/80 rounded-xl pl-9 pr-9 py-2.5 text-xs font-bold text-slate-600 outline-none cursor-pointer hover:border-slate-300 focus:bg-white transition-all w-full"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>On Hold</option>
              <option>Archived</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative lg:w-44">
            <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={rolesFilter}
              onChange={(e) => setRolesFilter(e.target.value)}
              className="appearance-none bg-slate-50/80 border border-slate-200/80 rounded-xl pl-9 pr-9 py-2.5 text-xs font-bold text-slate-600 outline-none cursor-pointer hover:border-slate-300 focus:bg-white transition-all w-full"
            >
              <option>All Roles</option>
              <option>Full Stack</option>
              <option>Backend</option>
              <option>Frontend</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 📱 MOBILE VIEW: NATIVE CARDS */}
      <div className="block lg:hidden space-y-3">
        {projectLoading && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/70 shadow-xs">
            <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Registry...</p>
          </div>
        )}

        {!projectLoading && projectError && (
          <div className="p-6 text-center text-red-500 bg-red-50/50 rounded-2xl border border-red-200/60">
            <p className="text-xs font-black uppercase tracking-wider">Ecosystem Pipeline Interrupted</p>
            <p className="text-[11px] font-semibold mt-1 text-slate-400">Could not resolve operational queries against master backend channels.</p>
          </div>
        )}

        {/* 1. Mobile Modern CARD View */}
        {!projectLoading && !projectError && mobileLayoutMode === "cards" && (
          <div className="space-y-3.5">
            {localFilteredProjects.map((project, idx) => {
              const activityTime = project.updatedAt 
                ? new Date(project.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
                : "Active now";

              return (
                <div key={project.id || idx} className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs active:scale-[0.99] transition-transform space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center font-black text-sm shadow-sm uppercase shrink-0">
                        {(project.name || "P").charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p 
                          className="text-sm font-bold text-slate-800 truncate active:text-blue-600" 
                          onClick={() => navigate(`/dev/board?projectId=${project.id}`)}
                        >
                          {project.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1 truncate">
                          <ExternalLink size={10} className="shrink-0" /> ucollyx.com/${project.slug || `project-${project.id}`}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold border uppercase tracking-wider shrink-0 ${getBadgeClasses('status', project.status)}`}>
                      {project.status || "Active"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border uppercase tracking-wider ${getBadgeClasses('role', project.role)}`}>
                      {project.role || "Full Stack"}
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Synced: <span className="text-slate-600 font-semibold">{activityTime}</span>
                    </p>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => navigate(`/dev/board?projectId=${project.id}&projectName=${project.name}`)}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 hover:bg-blue-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-700 active:bg-blue-100 transition-colors"
                    >
                      <Layout size={14} className="text-blue-600" />
                      <span>Board</span>
                    </button>
                    <button
                      onClick={() => handleProjectClick(project.slug)}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 hover:bg-purple-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-700 active:bg-purple-100 transition-colors"
                    >
                      <Code2 size={14} className="text-purple-600" />
                      <span>Cloud IDE</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Mobile Compact LIST View Layout */}
        {!projectLoading && !projectError && mobileLayoutMode === "list" && (
          <div className="bg-white rounded-2xl border border-slate-200/70 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {localFilteredProjects.map((project, idx) => (
              <div key={project.id || idx} className="p-3.5 flex items-center justify-between gap-3 active:bg-slate-50">
                <div className="flex items-center gap-3 min-w-0" onClick={() => navigate(`/dev/board?projectId=${project.id}`)}>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs uppercase shrink-0">
                    {(project.name || "P").charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{project.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{project.role || "Full Stack"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => navigate(`/dev/board?projectId=${project.id}&projectName=${project.name}`)}
                    className="p-2 text-slate-500 hover:text-blue-600 active:bg-slate-100 rounded-lg"
                  >
                    <Layout size={16} />
                  </button>
                  <button
                    onClick={() => handleProjectClick(project.slug)}
                    className="p-2 text-slate-500 hover:text-purple-600 active:bg-slate-100 rounded-lg"
                  >
                    <Code2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Empty State */}
        {!projectLoading && !projectError && localFilteredProjects.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/70">
            <Search size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No projects found</p>
            <p className="text-xs font-medium text-slate-400 mt-1">Adjust search parameters or status tags.</p>
          </div>
        )}
      </div>

      {/* 💻 DESKTOP VIEW: MODERN TABLE DESIGN */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/60">
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Project Details</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Last Synced Activity</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              {projectLoading && (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-slate-400">
                    <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Streaming database registry logs...</p>
                  </td>
                </tr>
              )}

              {!projectLoading && projectError && (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-red-500 bg-red-50/20">
                    <p className="text-sm font-black uppercase tracking-wider">Ecosystem Pipeline Interrupted</p>
                    <p className="text-xs font-semibold mt-1 text-slate-400">Could not resolve operational queries against master backend channels.</p>
                  </td>
                </tr>
              )}

              {!projectLoading && !projectError && localFilteredProjects.map((project, idx) => {
                const activityTime = project.updatedAt 
                  ? new Date(project.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
                  : "Active now";

                return (
                  <tr key={project.id || idx} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center font-black shadow-xs uppercase select-none shrink-0">
                          {(project.name || "P").charAt(0)}
                        </div>
                        <div>
                          <p 
                            className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors cursor-pointer" 
                            onClick={() => navigate(`/dev/board?projectId=${project.id}`)}
                          >
                            {project.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                            <ExternalLink size={10} /> ucollyx.com/${project.slug || `project-${project.id}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-bold border uppercase tracking-wider ${getBadgeClasses('role', project.role)}`}>
                        {project.role || "Full Stack"}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${project.status === "Active" ? "bg-emerald-500 shadow-xs shadow-emerald-500/50" : "bg-amber-500"}`} />
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-bold border uppercase tracking-wider ${getBadgeClasses('status', project.status)}`}>
                          {project.status || "Active"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <p className="text-xs text-slate-500 font-semibold">
                        {activityTime}
                      </p>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/dev/board?projectId=${project.id}&projectName=${project.name}`)}
                          className="p-2.5 bg-white border border-slate-200/80 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all shadow-xs active:scale-95"
                          title="Kanban Board Workspace"
                        >
                          <Layout size={15} />
                        </button>
                        <button
                          onClick={()=>handleProjectClick(project.slug)}
                          className="p-2.5 bg-white border border-slate-200/80 rounded-xl text-slate-600 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50/50 transition-all shadow-xs active:scale-95"
                          title="Open Cloud IDE"
                        >
                          <Code2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!projectLoading && !projectError && localFilteredProjects.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <Search size={40} className="mb-4 text-slate-400" />
                      <p className="text-lg font-bold text-slate-700">No projects found</p>
                      <p className="text-sm font-medium text-slate-400">Try adjusting your search query parameters or selection filter tags.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📱 Mobile Floating Action Button */}
      <button 
        onClick={() => navigate('/dev/board')}
        className="lg:hidden fixed bottom-6 right-6 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-50 ring-4 ring-slate-900/10"
      >
        <Plus size={22} />
      </button>

    </div>
  );
};

export default MyProject;