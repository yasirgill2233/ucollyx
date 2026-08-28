// import React, { useState, useMemo } from "react";
// import {
//   Search,
//   ChevronDown,
//   AlertCircle,
//   Clock,
//   CheckCircle2,
//   Layers,
//   ArrowRightIcon,
// } from "lucide-react";
// import { useNavigate } from "react-router";
// import { useMyProjects } from "../../../hooks/useProjects";
// import { useIssues } from "../../../hooks/useIssues";

// const MainDashboard = () => {
//   // --- 1. FILTERS & NAVIGATION STATES ---
//   const [searchTerm, setSearchTerm] = useState("");
//   const [projectFilter, setProjectFilter] = useState("All Projects");
//   const [severityFilter, setSeverityFilter] = useState("All Severities");

//   const navigate = useNavigate();

//   const { data: myProjects } = useMyProjects();
//   const {
//     data: serverBugs = [],
//     isLoading,
//     isError,
//     error,
//   } = useIssues(projectFilter);

//   const projects = myProjects?.data || [];

//   const uniqueMembers = [];
//   const seenUserIds = new Set();

//   projects?.forEach((project) => {
//     project?.members?.forEach((user) => {
//       if (!seenUserIds.has(user.id)) {
//         seenUserIds.add(user.id);
//         uniqueMembers.push(user);
//       }
//     });
//   });

//   const filteredData = useMemo(() => {
//     if (!Array.isArray(serverBugs)) return [];

//     return serverBugs.filter((bug) => {
//       const bugTitle = bug.title;
//       const bugId = String(bug.id);
//       const bugSeverity = bug.severity;
//       const bugStatus = bug.status;

//       const matchesSearch =
//         bugTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         bugId.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesSeverity =
//         severityFilter === "All Severities" ||
//         bugSeverity === severityFilter.toUpperCase();

//       return matchesSearch && matchesSeverity;
//     });
//   }, [searchTerm, severityFilter, serverBugs]);

//   // --- 4. CATEGORIZED FEEDS DATA ---
//   const openBugsFeed = filteredData.filter(
//     (b) =>
//       b.status === "Acknowledged" ||
//       b.status === "New" ||
//       b.status === "In Progress",
//   );
//   const awaitingFixList = filteredData.filter(
//     (b) => b.status === "In Progress",
//   );

//   console.log("List:", awaitingFixList);

//   const stats = {
//     critical: openBugsFeed.filter(
//       (b) => (b.severity || "").toUpperCase() === "CRITICAL",
//     ).length,
//     high: openBugsFeed.filter(
//       (b) => (b.severity || "").toUpperCase() === "HIGH",
//     ).length,
//     medium: openBugsFeed.filter(
//       (b) => (b.severity || "").toUpperCase() === "MEDIUM",
//     ).length,
//     low: openBugsFeed.filter((b) => (b.severity || "").toUpperCase() === "LOW")
//       .length,
//   };

//   // --- NAVIGATION HANDLERS WITH STATE ROUTING ---
//   const handleViewPriorityFeed = () => {
//     navigate("/qa/alerts", {
//       state: {
//         title: "Priority Activity Feed",
//         bugs: { st1: "New", st2: "Acknowledged" },
//       },
//     });
//   };

//   const handleViewAwaitingFix = () => {
//     navigate("/qa/alerts", {
//       state: {
//         title: "Awaiting Fix Queue",
//         bugs: { st1: "In Progress", st2: "In Progress" },
//       },
//     });
//   };

//   const handleViewVerification = () => {
//     navigate("/qa/verify-task", {
//       state: {
//         title: "Verification Report",
//         bugs: filteredData.filter(
//           (b) =>
//             b.retest_status || (b.status || "").toUpperCase() === "RESOLVED",
//         ),
//       },
//     });
//   };

//   // --- LOADING & ERROR STATES UI WRAPPERS ---
//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-[#F9FBFF]">
//         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 bg-[#F9FBFF] p-6 md:p-10 min-h-screen font-sans selection:bg-blue-100">
//       {/* Header & Functional Filters */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
//         <div>
//           <h1 className="text-3xl font-black text-slate-900 tracking-tight">
//             System <span className="text-slate-400 font-medium">Insights</span>
//           </h1>
//           <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">
//             Live Quality Dashboard
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
//           <button
//             onClick={() => navigate("/qa/report-bug")}
//             className="group flex items-center gap-2 bg-blue-600 hover:bg-rose-600 text-white px-5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all duration-500 shadow-lg shadow-blue-100 active:scale-95"
//           >
//             <div className="bg-white/10 p-1.5 rounded-md group-hover:bg-white/20 transition-colors">
//               <AlertCircle
//                 size={14}
//                 strokeWidth={3}
//                 className="text-blue-200 group-hover:text-white"
//               />
//             </div>
//             <span>Report Bug</span>
//           </button>
//         </div>
//       </div>

//       {/* Control Search bar */}
//       <div className="flex justify-between mb-8 p-4 border rounded-md border-gray-200 bg-white">
//         <div className="relative flex-1 lg:flex-none w-[30%]">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
//           <input
//             type="text"
//             placeholder="Search bugs..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10 pr-4 w-full py-2.5 bg-white border border-slate-200 rounded-md text-xs font-bold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
//           />
//         </div>
//         <div className="flex gap-2">
//           {/* Note: In production you can fetch real database project IDs instead of static tags */}
//           <div className="relative">
//             <select
//               value={projectFilter}
//               onChange={(e) => setProjectFilter(e.target.value)}
//               className="appearance-none bg-white border border-slate-200 px-4 py-2.5 pr-10 rounded-md text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
//             >
//               <option value="All Projects">All Projects</option>
//               {projects.map((proj) => (
//                 <option key={proj.id} value={proj.id}>
//                   {proj.name}
//                 </option>
//               ))}
//             </select>
//             <ChevronDown
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
//               size={12}
//             />
//           </div>

//           <div className="relative">
//             <select
//               value={severityFilter}
//               onChange={(e) => setSeverityFilter(e.target.value)}
//               className="appearance-none bg-white border border-slate-200 px-4 py-2.5 pr-10 rounded-md text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
//             >
//               {["All Severities", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(
//                 (proj) => (
//                   <option key={proj} value={proj}>
//                     {proj}
//                   </option>
//                 ),
//               )}
//             </select>
//             <ChevronDown
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
//               size={12}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Main Insights Distribution Matrix Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <SectionCard
//           title="Open Bugs Distribution"
//           subTitle="Current active load by severity"
//         >
//           <div className="flex flex-col justify-between h-[80%]">
//             <div className="grid grid-cols-2 gap-4">
//               <SeverityStat
//                 label="CRITICAL"
//                 count={stats.critical}
//                 color="red"
//               />
//               <SeverityStat label="HIGH" count={stats.high} color="orange" />
//               <SeverityStat
//                 label="MEDIUM"
//                 count={stats.medium}
//                 color="yellow"
//               />
//               <SeverityStat label="LOW" count={stats.low} color="cyan" />
//             </div>
//             <div className="mt-8 p-4 bg-slate-50 rounded-md border border-dashed border-slate-200 text-center">
//               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
//                 Total Open: {openBugsFeed.length}
//               </p>
//             </div>
//           </div>
//         </SectionCard>

//         <SectionCard
//           title="Priority Activity Feed"
//           subTitle="Latest open issues across all levels"
//         >
//           <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
//             {openBugsFeed.length > 0 ? (
//               openBugsFeed.map((bug) => <BugFeedItem key={bug.id} bug={bug} />)
//             ) : (
//               <EmptyState />
//             )}
//           </div>
//           <div
//             onClick={handleViewPriorityFeed}
//             className="text-sm text-blue-600 mt-4 flex justify-end items-center gap-2 hover:cursor-pointer group"
//           >
//             View Details
//             <ArrowRightIcon
//               size={14}
//               className="group-hover:translate-x-1 group-hover:duration-400"
//             />
//           </div>
//         </SectionCard>

//         <SectionCard
//           title="Awaiting Fix"
//           subTitle="Bugs currently in developer queue"
//           count={awaitingFixList.length}
//         >
//           <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
//             {awaitingFixList.length > 0 ? (
//               awaitingFixList.map((bug) => (
//                 <AwaitingFixRow key={bug.id} bug={bug} />
//               ))
//             ) : (
//               <EmptyState />
//             )}
//           </div>
//           <div
//             onClick={handleViewAwaitingFix}
//             className="text-sm text-blue-600 mt-4 flex justify-end items-center gap-2 hover:cursor-pointer group"
//           >
//             View Queue
//             <ArrowRightIcon
//               size={14}
//               className="group-hover:translate-x-1 group-hover:duration-400"
//             />
//           </div>
//         </SectionCard>

//         <SectionCard
//           title="Retest Verification"
//           subTitle="Today's verification summary"
//         >
//           <div className="flex gap-4 mb-6">
//             <ResultBox
//               label="Passed"
//               count={
//                 filteredData.filter((b) => b.retest_status === "Passed").length
//               }
//               color="emerald"
//             />
//             <ResultBox
//               label="Failed"
//               count={
//                 filteredData.filter((b) => b.retest_status === "Failed").length
//               }
//               color="red"
//             />
//           </div>
//           <div className="space-y-3 overflow-hidden">
//             {filteredData
//               .filter(
//                 (b) =>
//                   (b.status === "Resolved" || b.status === "In Progress") &&
//                   (b.retest_status === "Passed" ||
//                     b.retest_status === "Failed"),
//               )
//               .slice(0, 10)
//               .map((bug) => (
//                 <RetestRow key={bug.id} bug={bug} />
//               ))}
//           </div>
//           <div
//             onClick={handleViewVerification}
//             className="text-sm text-blue-600 mt-4 flex justify-end items-center gap-2 hover:cursor-pointer group"
//           >
//             Full Report
//             <ArrowRightIcon
//               size={14}
//               className="group-hover:translate-x-1 group-hover:duration-400"
//             />
//           </div>
//         </SectionCard>
//       </div>
//     </div>
//   );
// };

// // --- SUB-COMPONENTS WITH SAFE FALLBACK VALUES HANDLING ---
// const SectionCard = ({ title, subTitle, children, count }) => (
//   <div className="bg-white rounded-md border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all">
//     <div className="flex justify-between items-start mb-8">
//       <div>
//         <div className="flex items-center gap-2">
//           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
//             {title}
//           </h3>
//           {count > 0 && (
//             <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full">
//               {count}
//             </span>
//           )}
//         </div>
//         <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
//           {subTitle}
//         </p>
//       </div>
//       <button className="text-slate-300 p-2 hover:bg-slate-50 rounded-md transition-colors">
//         <Layers size={16} />
//       </button>
//     </div>
//     {children}
//   </div>
// );

// const SeverityStat = ({ label, count, color }) => {
//   const colors = {
//     red: "bg-red-50 text-red-600 border-red-100",
//     orange: "bg-orange-50 text-orange-600 border-orange-100",
//     yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
//     cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
//   };
//   return (
//     <div className={`${colors[color]} border p-5 rounded-md`}>
//       <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">
//         {label}
//       </p>
//       <p className="text-3xl font-black">{count}</p>
//     </div>
//   );
// };

// const BugFeedItem = ({ bug }) => {
//   const severity = (bug.severity || "MEDIUM").toUpperCase();
//   const sevColor =
//     severity === "CRITICAL"
//       ? "bg-red-500 shadow-red-100"
//       : severity === "HIGH"
//         ? "bg-orange-500 shadow-orange-100"
//         : severity === "MEDIUM"
//           ? "bg-yellow-500 shadow-yellow-100"
//           : "bg-cyan-500 shadow-cyan-100";

//   return (
//     <div className="flex items-center justify-between p-4 bg-white border border-slate-50 rounded-md hover:border-slate-200 transition-all shadow-sm group">
//       <div className="flex items-center gap-4">
//         <div className={`${sevColor} p-2.5 rounded-md text-white shadow-lg`}>
//           <AlertCircle size={16} />
//         </div>
//         <div>
//           <h4 className="text-[11px] font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
//             {bug.title}
//           </h4>
//           <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">
//             Project Key: {bug.project_id} • Reporter ID: {bug.raised_by}
//           </p>
//         </div>
//       </div>
//       <div className="flex items-center gap-2">
//         {bug.comments.length > 0 ? (
//           <div
//             title={`${bug.comments.length} comment(s)`}
//             className={`hover:cursor-pointer text-[12px] bg-rose-400 rounded-full w-2 h-2 flex justify-center items-center p-1 text-white`}
//           ></div>
//         ) : (
//           ""
//         )}
//         <span
//           className={`text-[8px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest border ${severity === "CRITICAL" ? "text-red-500 border-red-100 bg-red-50" : severity === "HIGH" ? "text-orange-500 border-orange-100 bg-orange-50" : "text-slate-400 border-slate-100 bg-slate-50"}`}
//         >
//           {severity}
//         </span>
//       </div>
//     </div>
//   );
// };

// const AwaitingFixRow = ({ bug }) => (
//   <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-md hover:bg-white hover:shadow-md transition-all group">
//     <div className="flex items-center gap-4">
//       <div className="w-10 h-10 rounded-md bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-blue-500 transition-colors">
//         {bug.id || "BUG"}
//       </div>
//       <div>
//         <div className="flex items-center gap-2">
//           <h4 className="text-[11px] font-bold text-slate-800 leading-tight">
//             {bug.title}
//           </h4>
//         </div>
//         <p className="text-[9px] text-slate-400 font-bold mt-1 tracking-tighter">
//           Assignee TO :{" "}
//           <span className="text-slate-700">
//             {bug.assignee.full_name || "Unassigned"}
//           </span>
//         </p>
//       </div>
//     </div>
//     <div className="flex items-center gap-2">
//       {bug.comments.length > 0 ? (
//         <div
//           title={`${bug.comments.length} comment(s)`}
//           className={`hover:cursor-pointer text-[12px] bg-blue-400 rounded-full w-2 h-2 flex justify-center items-center p-1 text-white`}
//         ></div>
//       ) : (
//         ""
//       )}
//       <span className="relative text-[8px] font-black text-blue-500 bg-blue-100 border border-slate-100 px-2 py-1 rounded-md">
//         IN QUEUE
//       </span>

//       {/* <Clock size={12} className="text-slate-300" /> */}
//     </div>
//   </div>
// );

// const ResultBox = ({ label, count, color }) => (
//   <div
//     className={`flex-1 p-5 rounded-md border text-center ${color === "emerald" ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600"}`}
//   >
//     <h2 className="text-3xl font-black">{count}</h2>
//     <p className="text-[10px] font-black uppercase tracking-widest mt-1">
//       {label}
//     </p>
//   </div>
// );

// const RetestRow = ({ bug }) => {
//   const status = bug.retest_status || "Pending";
//   return (
//     <div className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-md">
//       <div className="flex items-center gap-3">
//         <CheckCircle2
//           size={14}
//           className={status === "Passed" ? "text-emerald-500" : "text-red-400"}
//         />
//         <h4 className="text-[11px] font-bold text-slate-700">{bug.title}</h4>
//       </div>
//       <span
//         className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${status === "Passed" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
//       >
//         {status}
//       </span>
//     </div>
//   );
// };

// const EmptyState = () => (
//   <div className="w-full py-10 text-center bg-slate-50/50 rounded-md border border-dashed border-slate-200= flex items-center justify-center">
//     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
//       No matching results found
//     </p>
//   </div>
// );

// export default MainDashboard;

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowRightIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useMyProjects } from "../../../hooks/useProjects";
import { useIssues } from "../../../hooks/useIssues";

const MainDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [severityFilter, setSeverityFilter] = useState("All Severities");

  const navigate = useNavigate();

  const { data: myProjects } = useMyProjects();
  const { data: serverBugs = [], isLoading } = useIssues(projectFilter);
  const projects = myProjects?.data || [];

  const filteredData = useMemo(() => {
    if (!Array.isArray(serverBugs)) return [];

    return serverBugs.filter((bug) => {
      const bugTitle = bug.title || "";
      const bugId = String(bug.id || "");
      const bugSeverity = bug.severity || "";

      const matchesSearch =
        bugTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bugId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeverity =
        severityFilter === "All Severities" ||
        bugSeverity.toUpperCase() === severityFilter.toUpperCase();

      return matchesSearch && matchesSeverity;
    });
  }, [searchTerm, severityFilter, serverBugs]);

  const openBugsFeed = filteredData.filter(
    (b) =>
      b.status === "Acknowledged" ||
      b.status === "New" ||
      b.status === "In Progress"
  );
  
  const awaitingFixList = filteredData.filter(
    (b) => b.status === "In Progress"
  );

  const stats = {
    critical: openBugsFeed.filter((b) => (b.severity || "").toUpperCase() === "CRITICAL").length,
    high: openBugsFeed.filter((b) => (b.severity || "").toUpperCase() === "HIGH").length,
    medium: openBugsFeed.filter((b) => (b.severity || "").toUpperCase() === "MEDIUM").length,
    low: openBugsFeed.filter((b) => (b.severity || "").toUpperCase() === "LOW").length,
  };

  const handleViewPriorityFeed = () => {
    navigate("/qa/alerts", { state: { title: "Priority Activity Feed", bugs: { st1: "New", st2: "Acknowledged" } } });
  };

  const handleViewAwaitingFix = () => {
    navigate("/qa/alerts", { state: { title: "Awaiting Fix Queue", bugs: { st1: "In Progress", st2: "In Progress" } } });
  };

  const handleViewVerification = () => {
    navigate("/qa/verify-task", {
      state: { title: "Verification Report", bugs: filteredData.filter((b) => b.retest_status || (b.status || "").toUpperCase() === "RESOLVED") },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F9FBFF]">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F9FBFF] p-3 sm:p-6 md:p-10 min-h-screen font-sans antialiased selection:bg-blue-100 pb-24">
      
      {/* 📱 Mobile Optimized Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 sm:mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
            System <span className="text-slate-400 font-medium">Insights</span>
          </h1>
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-[0.15em]">
            Live Quality Dashboard
          </p>
        </div>

        <button
          onClick={() => navigate("/qa/report-bug")}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-rose-600 active:scale-95 text-white px-4 py-3 rounded-xl sm:rounded-lg text-[11px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-500/20"
        >
          <AlertCircle size={15} strokeWidth={2.5} />
          <span>Report New Bug</span>
        </button>
      </div>

      {/* 🔍 Smart Mobile Controls (Stacks on very small screens) */}
      <div className="flex flex-col gap-2 mb-6 p-3 sm:p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search bug title or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 w-full py-3 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Filters Break into Stack on <400px width screens */}
        <div className="flex flex-col min-[400px]:flex-row gap-2 w-full">
          <div className="relative flex-1">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 pl-3 pr-8 py-3 sm:py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-700 outline-none"
            >
              <option value="All Projects">All Projects</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>{proj.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>

          <div className="relative flex-1">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 pl-3 pr-8 py-3 sm:py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-700 outline-none"
            >
              {["All Severities", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                <option key={sev} value={sev}>{sev}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* 📊 Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        
        {/* Open Bugs Distribution */}
        <SectionCard title="Bugs Distribution" subTitle="Current active load by severity">
          <div className="flex flex-col justify-between h-full">
            {/* ✨ Ultra-Small Screen Adaptive Layout */}
            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2 sm:gap-3">
              <SeverityStat label="CRITICAL" count={stats.critical} color="red" />
              <SeverityStat label="HIGH" count={stats.high} color="orange" />
              <SeverityStat label="MEDIUM" count={stats.medium} color="yellow" />
              <SeverityStat label="LOW" count={stats.low} color="cyan" />
            </div>
            
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex justify-between items-center min-[400px]:justify-center min-[400px]:text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Open</span>
              <span className="text-[12px] font-black text-slate-800">{openBugsFeed.length}</span>
            </div>
          </div>
        </SectionCard>

        {/* Priority Feed */}
        <SectionCard title="Priority Activity Feed" subTitle="Latest open issues">
          <div className="space-y-2 max-h-[300px] sm:max-h-[350px] overflow-y-auto pr-1">
            {openBugsFeed.length > 0 ? openBugsFeed.map((bug) => <BugFeedItem key={bug.id} bug={bug} />) : <EmptyState />}
          </div>
          <ViewMoreLink onClick={handleViewPriorityFeed} label="View Details" />
        </SectionCard>

        {/* Awaiting Fix Queue */}
        <SectionCard title="Awaiting Fix" subTitle="Bugs in developer queue" count={awaitingFixList.length}>
          <div className="space-y-2 max-h-[300px] sm:max-h-[350px] overflow-y-auto pr-1">
            {awaitingFixList.length > 0 ? awaitingFixList.map((bug) => <AwaitingFixRow key={bug.id} bug={bug} />) : <EmptyState />}
          </div>
          <ViewMoreLink onClick={handleViewAwaitingFix} label="View Queue" />
        </SectionCard>

        {/* Retest Verification */}
        <SectionCard title="Retest Verification" subTitle="Today's verification summary">
          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2 sm:gap-3 mb-4">
            <ResultBox label="Passed" count={filteredData.filter((b) => b.retest_status === "Passed").length} color="emerald" />
            <ResultBox label="Failed" count={filteredData.filter((b) => b.retest_status === "Failed").length} color="red" />
          </div>
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {filteredData
              .filter((b) => (b.status === "Resolved" || b.status === "In Progress") && (b.retest_status === "Passed" || b.retest_status === "Failed"))
              .slice(0, 10).map((bug) => <RetestRow key={bug.id} bug={bug} />)}
          </div>
          <ViewMoreLink onClick={handleViewVerification} label="Full Report" />
        </SectionCard>
      </div>
    </div>
  );
};

// --- REUSABLE COMPONENTS OPTIMIZED FOR ALL SCREENS ---

const SectionCard = ({ title, subTitle, children, count }) => (
  <div className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5 shadow-xs flex flex-col h-full">
    <div className="flex justify-between items-start mb-4">
      <div className="pr-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider leading-tight">{title}</h3>
          {count > 0 && <span className="bg-blue-50 text-blue-600 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full">{count}</span>}
        </div>
        <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-tight leading-tight">{subTitle}</p>
      </div>
      <button className="text-slate-300 p-1 bg-slate-50 rounded-lg shrink-0"><Layers size={14} /></button>
    </div>
    <div className="flex-1 flex flex-col">{children}</div>
  </div>
);

// ✨ Adaptive Stat Box (Horizontal List on < 400px, Box on > 400px)
const SeverityStat = ({ label, count, color }) => {
  const colors = {
    red: "bg-red-50/80 text-red-600 border-red-100",
    orange: "bg-orange-50/80 text-orange-600 border-orange-100",
    yellow: "bg-amber-50/80 text-amber-600 border-amber-100",
    cyan: "bg-cyan-50/80 text-cyan-600 border-cyan-100",
  };
  return (
    <div className={`${colors[color]} border p-3 rounded-xl flex items-center justify-between min-[400px]:flex-col min-[400px]:items-start min-[400px]:justify-start transition-all`}>
      <p className="text-[10px] sm:text-[9px] font-black uppercase tracking-widest opacity-80 min-[400px]:mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-black tracking-tight">{count}</p>
    </div>
  );
};

// ✨ Adaptive Result Box
const ResultBox = ({ label, count, color }) => (
  <div className={`p-3 rounded-xl border flex items-center justify-between min-[400px]:flex-col min-[400px]:justify-center min-[400px]:text-center ${color === "emerald" ? "bg-emerald-50/70 border-emerald-100 text-emerald-700" : "bg-red-50/70 border-red-100 text-red-700"}`}>
    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 order-1 min-[400px]:order-2 min-[400px]:mt-1">{label}</p>
    <h2 className="text-xl sm:text-2xl font-black tracking-tight order-2 min-[400px]:order-1">{count}</h2>
  </div>
);

const ViewMoreLink = ({ onClick, label }) => (
  <div onClick={onClick} className="mt-auto pt-4 border-t border-slate-100 text-[11px] sm:text-xs font-bold text-blue-600 flex justify-end items-center gap-1.5 cursor-pointer active:opacity-50">
    <span>{label}</span><ArrowRightIcon size={14} />
  </div>
);

const BugFeedItem = ({ bug }) => {
  const severity = (bug.severity || "MEDIUM").toUpperCase();
  const sevColor = severity === "CRITICAL" ? "bg-red-500" : severity === "HIGH" ? "bg-orange-500" : severity === "MEDIUM" ? "bg-amber-500" : "bg-cyan-500";
  const sevBadge = severity === "CRITICAL" ? "text-red-600 bg-red-50" : severity === "HIGH" ? "text-orange-600 bg-orange-50" : "text-slate-500 bg-slate-100";

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50/60 border border-slate-100 rounded-xl active:bg-white transition-all shadow-2xs">
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <div className={`${sevColor} p-1.5 rounded-lg text-white shrink-0`}><AlertCircle size={14} /></div>
        <div className="min-w-0">
          <h4 className="text-[11px] font-bold text-slate-800 truncate">{bug.title}</h4>
          <p className="text-[9px] text-slate-400 font-semibold uppercase truncate mt-0.5">{bug.project_id} • {bug.raised_by}</p>
        </div>
      </div>
      <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider shrink-0 ${sevBadge}`}>{severity}</span>
    </div>
  );
};

const AwaitingFixRow = ({ bug }) => (
  <div className="flex items-center justify-between p-3 bg-slate-50/60 border border-slate-100 rounded-xl active:bg-white transition-all">
    <div className="flex items-center gap-2.5 min-w-0 pr-2">
      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[9px] font-black text-slate-500 shrink-0">#{bug.id || "0"}</div>
      <div className="min-w-0">
        <h4 className="text-[11px] font-bold text-slate-800 truncate">{bug.title}</h4>
        <p className="text-[9px] text-slate-400 font-semibold truncate mt-0.5">Assignee: {bug.assignee?.full_name || "Unassigned"}</p>
      </div>
    </div>
    <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md shrink-0 uppercase tracking-wider">QUEUED</span>
  </div>
);

const RetestRow = ({ bug }) => {
  const isPassed = bug.retest_status === "Passed";
  return (
    <div className="flex items-center justify-between p-2.5 border-b border-slate-100/60 last:border-0">
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <CheckCircle2 size={13} className={`shrink-0 ${isPassed ? "text-emerald-500" : "text-red-500"}`} />
        <h4 className="text-[11px] font-semibold text-slate-700 truncate">{bug.title}</h4>
      </div>
      <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${isPassed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
        {bug.retest_status || "Pending"}
      </span>
    </div>
  );
};

const EmptyState = () => (
  <div className="w-full py-6 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No results</p>
  </div>
);

export default MainDashboard;