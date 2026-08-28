// import React, { useState, useMemo, useEffect } from "react";
// import { ChevronDown, Search as SearchIcon, Loader2 } from "lucide-react";
// import TeamMemberModal from "./TeamMemberModal";
// import API from "../../../../api/axios";
// import { useMyProjects } from "../../../../hooks/useProjects";

// const TeamActivity = () => {
//   // --- 1. STATES FOR REAL DATA & FILTERS ---
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [projectFilter, setProjectFilter] = useState("");
//   const [roleFilter, setRoleFilter] = useState("All Roles");
//   const [selectedMember, setSelectedMember] = useState(null);
  
//   const [projectData, setProjectData] = useState(null);
//   useEffect(() => {
//     const fetchTeamActivity = async () => {
//       try {
//         setLoading(true);
//         const response = await API.get(`/team/activity/${projectFilter}`);
//         // Axios response se nested data extract karna (response.data.data)
//         if (response.data && response.data.success) {
//           setProjectData(response.data.data);
//         } else {
//           setError("Failed to fetch accurate data structure");
//         }
//       } catch (err) {
//         console.error("API Fetch Error:", err);
//         setError(err.message || "Something went wrong while fetching logs");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTeamActivity();
//   }, [projectFilter]);

//   const members = useMemo(() => {
//     if (!projectData || !projectData.Tasks) return [];

//     const memberMap = new Map();
//     const projectName = projectData.name || "Mobile App";

//     projectData.Tasks.forEach((task) => {
//       if (task.assignees && Array.isArray(task.assignees)) {
//         task.assignees.forEach((assignee) => {
//           if (!memberMap.has(assignee.id)) {
//             // Dynamic Workload Logic based on task counts
//             const totalAssignedTasks = projectData.Tasks.filter((t) =>
//               t.assignees.some((a) => a.id === assignee.id),
//             ).length;

//             const doneTasks = projectData.Tasks.filter(
//               (t) =>
//                 t.status === "done" &&
//                 t.assignees.some((a) => a.id === assignee.id),
//             ).length;

//             // Simple conditional metrics computation
//             let status = "Balanced";
//             let color = "bg-green-500";
//             let percentage = 85;
//             let hours = "34h / 40h";

//             if (totalAssignedTasks > 4) {
//               status = "Overloaded";
//               color = "bg-red-500";
//               percentage = 120;
//               hours = "48h / 40h";
//             } else if (totalAssignedTasks < 2) {
//               status = "Underutilized";
//               color = "bg-yellow-500";
//               percentage = 45;
//               hours = "18h / 40h";
//             }

//             memberMap.set(assignee.id, {
//               id: assignee.id,
//               name: assignee.full_name || "Unknown Developer",
//               email: assignee.email,
//               avatar: assignee?.avatar_url,
//               role: assignee.email.includes("admin") ? "Admin" : "Full Stack", // Dummy role dynamic match
//               projects: [projectName],
//               tasks: `${doneTasks}/${totalAssignedTasks}`,
//               hours: hours,
//               status: status,
//               color: color,
//               percentage: percentage,
//             });
//           }
//         });
//       }
//     });

//     return Array.from(memberMap.values());
//   }, [projectData]);

//   const { data: myProjects } = useMyProjects();
//   const projects = myProjects?.data || [];

//   console.log(
//     "########################################################",
//     projects,
//     members,
//     projectFilter,
//   );

//   // --- 4. DYNAMIC FILTER LOGIC ---
//   const filteredMembers = useMemo(() => {
//     return members.filter((m) => {
//       const matchesSearch =
//         m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         m.email.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesProject =
//         projectFilter === "All Projects" || m.projects.includes(projectFilter);
//       const matchesRole = roleFilter === "All Roles" || m.role === roleFilter;
//       return matchesSearch && matchesProject && matchesRole;
//     });
//   }, [members, searchTerm, projectFilter, roleFilter]);

//   // --- 5. DYNAMIC STATS ---
//   const teamStats = useMemo(() => {
//     return [
//       {
//         label: "Active Members",
//         val: filteredMembers.length,
//         sub: `Showing ${filteredMembers.length} results`,
//         icon: "👤",
//       },
//       {
//         label: "Balanced",
//         val: filteredMembers.filter((m) => m.status === "Balanced").length,
//         sub: "Optimal capacity",
//         icon: "✓",
//         color: "text-green-500",
//       },
//       {
//         label: "Overloaded",
//         val: filteredMembers.filter((m) => m.status === "Overloaded").length,
//         sub: "Needs attention",
//         icon: "⚠️",
//         color: "text-red-500",
//       },
//       {
//         label: "Underutilized",
//         val: filteredMembers.filter((m) => m.status === "Underutilized").length,
//         sub: "Available capacity",
//         icon: "↓",
//         color: "text-yellow-500",
//       },
//     ];
//   }, [filteredMembers]);

//   // Dropdown list sets
//   const allProjects = useMemo(
//     () => ["All Projects", ...new Set(members.flatMap((m) => m.projects))],
//     [members],
//   );
//   const allRoles = useMemo(
//     () => ["All Roles", ...new Set(members.map((m) => m.role))],
//     [members],
//   );

//   // Loading Screen State
//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcfcfc]">
//         <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
//         <p className="text-xs font-bold text-slate-400">
//           Loading live workspace activity...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#fcfcfc] min-h-screen font-sans p-8">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
//         <div>
//           <h1 className="text-2xl font-black text-slate-800 tracking-tight">
//             Team Activity
//           </h1>
//           <p className="text-xs font-bold text-slate-400 mt-1">
//             Monitor workload distribution and Team Capacity
//           </p>
//         </div>

//         {/* Search & Filters */}
//         <div className="flex flex-wrap gap-3 w-full md:w-auto">
//           <div className="relative group">
//             <SearchIcon
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500"
//               size={14}
//             />
//             <input
//               type="text"
//               placeholder="Search member..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-bold outline-none focus:border-blue-500 transition-all w-48"
//             />
//           </div>
//           <select
//             value={projectFilter}
//             onChange={(e) => setProjectFilter(e.target.value)}
//             className="bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs font-bold text-slate-500 outline-none cursor-pointer"
//           >
//             {projects.map((p) => (
//               <option key={p.id} value={p.name}>
//                 {p.name}
//               </option>
//             ))}
//           </select>

//           <select
//             value={roleFilter}
//             onChange={(e) => setRoleFilter(e.target.value)}
//             className="bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs font-bold text-slate-500 outline-none cursor-pointer"
//           >
//             {allRoles.map((r) => (
//               <option key={r} value={r}>
//                 {r}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Stats Section */}
//       <div className="bg-white border border-slate-100 rounded-md p-6 shadow-sm mb-8">
//         <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6">
//           Team Load Overview
//         </h2>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {teamStats.map((s, i) => (
//             <div
//               key={i}
//               className="bg-slate-50/50 border border-slate-100 p-5 rounded-md group hover:bg-white hover:shadow-md transition-all"
//             >
//               <div className="flex justify-between items-start mb-2">
//                 <p className="text-[10px] font-black uppercase text-slate-400">
//                   {s.label}
//                 </p>
//                 <span className="text-sm">{s.icon}</span>
//               </div>
//               <h3
//                 className={`text-2xl font-black ${s.color || "text-slate-800"}`}
//               >
//                 {s.val}
//               </h3>
//               <p className="text-[10px] font-bold text-slate-400 mt-1">
//                 {s.sub}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* Dynamic Capacity Utilization Bar Graph */}
//         <div className="mt-10">
//           <p className="text-[10px] font-black text-slate-400 uppercase mb-6">
//             Filtered Results Capacity
//           </p>
//           <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
//             {filteredMembers.map((m, i) => (
//               <div key={i} className="flex items-center gap-4">
//                 <span className="text-[10px] font-bold text-slate-600 w-24 truncate">
//                   {m.name}
//                 </span>
//                 <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
//                   <div
//                     className={`${m.color} h-full transition-all duration-700`}
//                     style={{ width: `${Math.min(m.percentage, 100)}%` }}
//                   />
//                 </div>
//                 <span className="text-[10px] font-black text-slate-400 w-8 text-right">
//                   {m.percentage}%
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Table Section */}
//       <div className="bg-white border border-slate-100 rounded-md overflow-hidden shadow-sm">
//         <div className="p-6 border-b border-slate-50 flex justify-between items-center">
//           <h2 className="text-sm font-black text-slate-800">
//             Team Member Activity
//           </h2>
//           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
//             {filteredMembers.length} of {members.length} members
//           </span>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse min-w-[800px]">
//             <thead>
//               <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
//                 <th className="px-6 py-4">Developer</th>
//                 <th className="px-6 py-4">Role</th>
//                 <th className="px-6 py-4">Current Projects</th>
//                 <th className="px-6 py-4 text-center">
//                   Active Tasks (Done/Total)
//                 </th>
//                 <th className="px-6 py-4 text-center">Hours / Week</th>
//                 <th className="px-6 py-4">Workload Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-50">
//               {filteredMembers.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="6"
//                     className="text-center py-8 text-xs font-bold text-slate-400"
//                   >
//                     No active assignees found matching criteria.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredMembers.map((m, i) => (
//                   <tr
//                     key={i}
//                     className="hover:bg-slate-50/30 transition-colors cursor-pointer"
//                     onClick={() => setSelectedMember(m)}
//                   >
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="rounded-full border border-blue-100 bg-blue-600 w-10 h-10 flex items-center justify-center text-white font-black text-xs shadow-sm uppercase overflow-hidden">
//                           {m?.avatar ? (
//                             <img
//                               src={m?.avatar}
//                               alt="Avatar"
//                               crossOrigin="anonymous"
//                               className="w-full h-full object-cover"
//                             />
//                           ) : m?.name ? (
//                             m?.name[0]
//                           ) : (
//                             "U"
//                           )}
//                         </div>
//                         <div>
//                           <p className="text-xs font-black text-slate-800">
//                             {m.name}
//                           </p>
//                           <p className="text-[10px] text-slate-400 font-bold">
//                             {m.email}
//                           </p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className="text-[10px] font-black text-slate-500 border border-slate-200 px-2 py-1 rounded-md bg-white">
//                         {m.role}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex gap-1.5 flex-wrap max-w-[200px]">
//                         {m.projects.map((p, pi) => (
//                           <span
//                             key={pi}
//                             className="text-[9px] font-bold text-blue-600 border border-blue-100 px-2 py-0.5 rounded-md bg-blue-50/30"
//                           >
//                             {p}
//                           </span>
//                         ))}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-center text-xs font-black text-slate-700">
//                       {m.tasks}
//                     </td>
//                     <td className="px-6 py-4 text-center text-xs font-black text-slate-700">
//                       {m.hours}
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2">
//                         <div className="flex-1 bg-slate-100 h-1.5 rounded-full w-20 overflow-hidden">
//                           <div
//                             className={`${m.color} h-full`}
//                             style={{ width: `${Math.min(m.percentage, 100)}%` }}
//                           />
//                         </div>
//                         <span
//                           className={`text-[9px] font-black uppercase ${m.status === "Overloaded" ? "text-red-500" : m.status === "Underutilized" ? "text-yellow-500" : "text-green-500"}`}
//                         >
//                           {m.status}
//                         </span>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {selectedMember && (
//         <TeamMemberModal
//           member={selectedMember}
//           onClose={() => setSelectedMember(null)}
//           projectData={projectData}
//         />
//       )}
//     </div>
//   );
// };

// export default TeamActivity;




import React, { useState, useMemo, useEffect } from "react";
import {
  Search as SearchIcon,
  Loader2,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowDownCircle,
  Briefcase,
  Clock,
  CheckSquare,
} from "lucide-react";
import TeamMemberModal from "./TeamMemberModal";
import API from "../../../../api/axios";
import { useMyProjects } from "../../../../hooks/useProjects";

const TeamActivity = () => {
  // --- 1. HOOKS & PROJECTS RETRIEVAL ---
  const { data: myProjects, isLoading: isProjectsLoading } = useMyProjects();
  const projects = myProjects?.data || [];

  // --- 2. STATES ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [selectedMember, setSelectedMember] = useState(null);
  const [projectData, setProjectData] = useState(null);

  // Auto-select initial project when projects load
  useEffect(() => {
    if (projects.length > 0 && !projectFilter) {
      setProjectFilter(projects[0].id || projects[0]._id || projects[0].name);
    }
  }, [projects, projectFilter]);

  // --- 3. FETCH TEAM ACTIVITY ON FILTER CHANGE ---
  useEffect(() => {
    if (!projectFilter) return;

    const fetchTeamActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await API.get(`/team/activity/${projectFilter}`);
        if (response.data && response.data.success) {
          setProjectData(response.data.data);
        } else {
          setError("Failed to fetch accurate data structure");
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
        setError(err.message || "Something went wrong while fetching logs");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamActivity();
  }, [projectFilter]);

  // --- 4. EXTRACT MEMBERS & CALCULATE METRICS ---
  const members = useMemo(() => {
    if (!projectData || !projectData.Tasks) return [];

    const memberMap = new Map();
    const projectName = projectData.name || "Project Workspace";

    projectData.Tasks.forEach((task) => {
      if (task.assignees && Array.isArray(task.assignees)) {
        task.assignees.forEach((assignee) => {
          if (!assignee || !assignee.id) return;

          if (!memberMap.has(assignee.id)) {
            const totalAssignedTasks = projectData.Tasks.filter((t) =>
              t.assignees?.some((a) => a.id === assignee.id)
            ).length;

            const doneTasks = projectData.Tasks.filter(
              (t) =>
                t.status?.toLowerCase() === "done" &&
                t.assignees?.some((a) => a.id === assignee.id)
            ).length;

            let status = "Balanced";
            let color = "bg-emerald-500";
            let percentage = 75;
            let hours = "30h / 40h";

            if (totalAssignedTasks > 4) {
              status = "Overloaded";
              color = "bg-rose-500";
              percentage = 115;
              hours = "46h / 40h";
            } else if (totalAssignedTasks < 2) {
              status = "Underutilized";
              color = "bg-amber-500";
              percentage = 40;
              hours = "16h / 40h";
            }

            const userEmail = assignee.email || "";

            memberMap.set(assignee.id, {
              id: assignee.id,
              name: assignee.full_name || "Unknown Developer",
              email: userEmail,
              avatar: assignee?.avatar_url,
              role: userEmail.includes("admin") ? "Admin" : "Developer",
              projects: [projectName],
              tasks: `${doneTasks}/${totalAssignedTasks}`,
              hours: hours,
              status: status,
              color: color,
              percentage: percentage,
            });
          }
        });
      }
    });

    return Array.from(memberMap.values());
  }, [projectData]);

  // --- 5. FILTERING LOGIC ---
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All Roles" || m.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, searchTerm, roleFilter]);

  // --- 6. STATS LOGIC ---
  const teamStats = useMemo(() => {
    return [
      {
        label: "Active Members",
        val: filteredMembers.length,
        sub: `Showing ${filteredMembers.length} results`,
        icon: <Users className="w-4 h-4 text-slate-500" />,
      },
      {
        label: "Balanced",
        val: filteredMembers.filter((m) => m.status === "Balanced").length,
        sub: "Optimal capacity",
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
        color: "text-emerald-600",
      },
      {
        label: "Overloaded",
        val: filteredMembers.filter((m) => m.status === "Overloaded").length,
        sub: "Needs attention",
        icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,
        color: "text-rose-600",
      },
      {
        label: "Underutilized",
        val: filteredMembers.filter((m) => m.status === "Underutilized").length,
        sub: "Available capacity",
        icon: <ArrowDownCircle className="w-4 h-4 text-amber-500" />,
        color: "text-amber-600",
      },
    ];
  }, [filteredMembers]);

  const allRoles = useMemo(
    () => ["All Roles", ...new Set(members.map((m) => m.role))],
    [members]
  );

  // --- 7. LOADING SCREEN ---
  if (loading || isProjectsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Loading Workspace Activity...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen font-sans p-3 sm:p-6 lg:p-8 antialiased">
      {/* 📱 HEADER & CONTROLS */}
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Team Activity
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5">
            Monitor workload distribution and team capacity
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:items-center gap-2.5 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative sm:col-span-1 lg:w-52">
            <SearchIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Project Dropdown */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
          >
            {projects.map((p) => {
              const pId = p.id || p._id || p.name;
              return (
                <option key={pId} value={pId}>
                  {p.name}
                </option>
              );
            })}
          </select>

          {/* Role Dropdown */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
          >
            {allRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 📊 STATS CARDS SECTION */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs mb-6">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          Team Load Overview
        </h2>
        
        {/* Responsive Grid for Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {teamStats.map((s, i) => (
            <div
              key={i}
              className="bg-slate-50/60 border border-slate-100 p-3 sm:p-4 rounded-xl group hover:bg-white hover:border-slate-200 transition-all"
            >
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider truncate">
                  {s.label}
                </p>
                {s.icon}
              </div>
              <h3 className={`text-lg sm:text-2xl font-black ${s.color || "text-slate-800"}`}>
                {s.val}
              </h3>
              <p className="text-[9px] font-bold text-slate-400 truncate mt-0.5">
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Capacity Utilization Graph */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
            Capacity Utilization
          </p>
          {filteredMembers.length === 0 ? (
            <p className="text-xs font-bold text-slate-400 italic">No activity logs to display.</p>
          ) : (
            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
              {filteredMembers.map((m, i) => (
                <div key={i} className="flex items-center gap-2.5 sm:gap-4">
                  <span className="text-[10px] font-extrabold text-slate-700 w-20 sm:w-28 truncate shrink-0">
                    {m.name}
                  </span>
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`${m.color} h-full transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.min(m.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 w-8 text-right shrink-0">
                    {m.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 📋 ACTIVITY SECTION */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">
            Team Member Activity
          </h2>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
            {filteredMembers.length} / {members.length}
          </span>
        </div>

        {/* 📱 1. MOBILE CARDS VIEW (Visible on < md screens) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredMembers.length === 0 ? (
            <div className="p-6 text-center text-xs font-bold text-slate-400">
              No active developers found.
            </div>
          ) : (
            filteredMembers.map((m, i) => (
              <div
                key={i}
                onClick={() => setSelectedMember(m)}
                className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors cursor-pointer active:bg-slate-100/50"
              >
                {/* User Info Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="rounded-xl border border-blue-100 bg-slate-900 w-9 h-9 flex items-center justify-center text-white font-black text-xs uppercase overflow-hidden shrink-0">
                      {m?.avatar ? (
                        <img
                          src={m?.avatar}
                          alt="Avatar"
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        m?.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-800 truncate">
                        {m.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold truncate">
                        {m.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md bg-white uppercase shrink-0">
                    {m.role}
                  </span>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-[10px] font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <CheckSquare size={12} className="text-slate-400" />
                    <span>Tasks: <strong className="text-slate-800">{m.tasks}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-slate-400" />
                    <span>Hours: <strong className="text-slate-800">{m.hours}</strong></span>
                  </div>
                </div>

                {/* Workload Meter Footer */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Briefcase size={12} className="text-blue-500 shrink-0" />
                    <span className="text-[10px] font-bold text-blue-600 truncate">
                      {m.projects.join(", ")}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`${m.color} h-full rounded-full`}
                        style={{ width: `${Math.min(m.percentage, 100)}%` }}
                      />
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase ${
                        m.status === "Overloaded"
                          ? "text-rose-600"
                          : m.status === "Underutilized"
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 💻 2. DESKTOP TABLE VIEW (Visible on >= md screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-5 py-3.5">Developer</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Current Project</th>
                <th className="px-5 py-3.5 text-center">Active Tasks (Done/Total)</th>
                <th className="px-5 py-3.5 text-center">Hours / Week</th>
                <th className="px-5 py-3.5">Workload Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-10 text-xs font-bold text-slate-400"
                  >
                    No active developers found.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                    onClick={() => setSelectedMember(m)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-blue-100 bg-slate-900 w-9 h-9 flex items-center justify-center text-white font-black text-xs shadow-xs uppercase overflow-hidden shrink-0">
                          {m?.avatar ? (
                            <img
                              src={m?.avatar}
                              alt="Avatar"
                              crossOrigin="anonymous"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            m?.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                            {m.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold truncate">
                            {m.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[9px] font-black text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md bg-white uppercase">
                        {m.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1 flex-wrap max-w-[180px]">
                        {m.projects.map((p, pi) => (
                          <span
                            key={pi}
                            className="text-[9px] font-extrabold text-blue-600 border border-blue-100 px-2 py-0.5 rounded-md bg-blue-50/40 truncate"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center font-black text-slate-800">
                      {m.tasks}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-slate-600">
                      {m.hours}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0">
                          <div
                            className={`${m.color} h-full rounded-full`}
                            style={{ width: `${Math.min(m.percentage, 100)}%` }}
                          />
                        </div>
                        <span
                          className={`text-[9px] font-black uppercase ${
                            m.status === "Overloaded"
                              ? "text-rose-600"
                              : m.status === "Underutilized"
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📱 MODAL INTEGRATION */}
      {selectedMember && (
        <TeamMemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          projectData={projectData}
        />
      )}
    </div>
  );
};

export default TeamActivity;