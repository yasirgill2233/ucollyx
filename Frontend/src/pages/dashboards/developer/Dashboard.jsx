// import React, { useState, useEffect, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import { projectService } from "../../../api/services/projectService";
// import { taskService } from "../../../api/services/taskService";
// import {
//   ClipboardList,
//   AlertTriangle,
//   Layout,
//   Video,
//   Clock,
//   ExternalLink,
//   ChevronRight,
//   ArrowUpRight,
//   Activity,
//   Layers,
//   Compass,
// } from "lucide-react";
// import { useAssignedIssues } from "../../../hooks/useIssues";
// import { useMeetingsHub } from "../../../hooks/useMeetingsHub";
// import API from "../../../api/axios";
// // IMPORT YOUR JITSI COMPONENT HERE
// import JitsiVideoCall from "../../shared/centralchatt/Video/JitsiVideoCall"; 

// // Ultra Soft Rounded Badge
// const SoftBadge = ({ text }) => {
//   const styles = {
//     todo: "bg-slate-200/40 text-slate-600 border-slate-300/30",
//     inprogress: "bg-sky-100/50 text-sky-600 border-sky-200/40",
//     "In Progress": "bg-amber-100/50 text-amber-600 border-amber-200/40",
//     review: "bg-violet-100/50 text-violet-600 border-violet-200/40",
//     done: "bg-emerald-100/50 text-emerald-600 border-emerald-200/40",
//     HIGH: "bg-rose-100/60 text-rose-600 border-rose-200/40 animate-pulse",
//     Success: "bg-emerald-100/50 text-emerald-600 border-emerald-200/40",
//   };

//   const displayTexts = {
//     todo: "To Do",
//     inprogress: "In Progress",
//     review: "Review",
//     done: "Done",
//   };

//   return (
//     <span
//       className={`inline-flex items-center px-3 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase border backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.01)] ${styles[text] || "bg-white/60 text-slate-500 border-slate-200/50"}`}
//     >
//       {displayTexts[text] || text}
//     </span>
//   );
// };

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [time, setTime] = useState(new Date());
  
//   // 1. STATE TRACKING FOR ACTIVE STREAM ROOM
//   const [activeMeeting, setActiveMeeting] = useState(null);

//   useEffect(() => {
//     const timer = setInterval(() => setTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const { data: myProjectsData, isLoading: projectsLoading } = useQuery({
//     queryKey: ["my-projects"],
//     queryFn: () => projectService.getMyProjects(),
//   });

//   const { data: todaysTasksData, isLoading: tasksLoading } = useQuery({
//     queryKey: ["todays-tasks"],
//     queryFn: () => taskService.getTodayTasks(),
//   });

//   const { data: portfolioResponse } = useQuery({
//     queryKey: ["developer-project-dashboard"],
//     queryFn: async () => {
//       const res = await API.get("/projects/developer-project-dashboard");
//       return res.data;
//     },
//     refetchOnWindowFocus: false,
//   });

//   // Extract logged-in user object safely for Jitsi parameters pass-through
//   const localUserRaw = localStorage.getItem("user");
//   const parsedUser = localUserRaw ? JSON.parse(localUserRaw) : null;
//   const user_name = parsedUser?.full_name || "Developer";

//   const activeProjects = myProjectsData?.data || [];
//   const todaysTasks = todaysTasksData?.data || [];
//   const criticalAlerts = todaysTasks;

//   const { meetings } = useMeetingsHub();
//   const { data: issues = [] } = useAssignedIssues();

//   console.log("==========Hello World========", portfolioResponse);

//   const handleProjectNavigation = (id, name, taskId) => {
//     const encodedName = encodeURIComponent(name);
//     const highlightParam = taskId ? `&highlightTaskId=${taskId}` : "";
//     navigate(
//       `/dev/board?projectId=${id}&projectName=${encodedName}${highlightParam}`,
//     );
//   };

//   const notCompletedMeetings = meetings.filter((meeting) => {
//     return meeting.status !== "completed"; // Keeping your existing filtering parameter logic intact
//   });

//   if (projectsLoading || tasksLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-[#f3f5f9]">
//         <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
//         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-4">
//           Calibrating Fluid Space...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:p-12 min-h-screen font-sans text-slate-800 selection:bg-indigo-100 relative overflow-hidden">
//       <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-sky-200/30 to-indigo-200/20 rounded-full blur-[120px] pointer-events-none" />
//       <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-gradient-to-tr from-purple-200/20 to-pink-200/30 rounded-full blur-[100px] pointer-events-none" />
//       <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-blue-200/10 rounded-full blur-[90px] pointer-events-none" />

//       <header className="relative mx-auto mb-10 p-8 bg-white backdrop-blur-2xl border border-gray-100 rounded-md shadow-sm">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
//           <div className="space-y-2">
//             <p className="text-[10px] font-black text-indigo-500/80 uppercase tracking-[0.25em]">
//               Workspace Stream Alpha
//             </p>
//             <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
//               Welcome,{" "}
//               <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent font-black">
//                 {user_name}
//               </span>
//             </h1>
//             <p className="text-slate-500 text-xs font-medium">
//               You have{" "}
//               <span className="font-bold text-rose-500/90">
//                 {todaysTasks.length} Task(s)
//               </span>{" "}
//               that need to be completed.
//             </p>
//           </div>

//           <div className="flex items-center gap-3 bg-white backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.01)] self-start md:self-center">
//             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//             <span className="text-xs font-black text-slate-700 tracking-widest tabular-nums">
//               {time.toLocaleTimeString([], {
//                 hour: "2-digit",
//                 minute: "2-digit",
//                 second: "2-digit",
//               })}
//             </span>
//           </div>
//         </div>
//       </header>

//       <div className=" mx-auto grid grid-cols-12 gap-8 relative z-10">
//         <div className="col-span-12 lg:col-span-8 space-y-8">
//           {/* TASK LIST STREAM PANEL */}
//           <section className="bg-white backdrop-blur-2xl border border-gray-100 rounded-md shadow-sm p-6 md:p-8">
//             <div className="flex justify-between items-center mb-8">
//               <div className="space-y-0.5">
//                 <h2 className="text-lg font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
//                   <ClipboardList size={18} className="text-indigo-500" />{" "}
//                   Current Session Stream
//                 </h2>
//                 <p className="text-slate-400 text-[11px] font-medium">
//                   Click a node to instantly flash focus it inside the workspace
//                   board view.
//                 </p>
//               </div>
//               <button
//                 onClick={() => navigate("/dev/board")}
//                 className="text-[9px] font-black text-slate-600 bg-white/80 hover:bg-indigo-600 hover:text-white border border-white px-4 py-2 rounded-xl transition-all tracking-widest uppercase shadow-sm flex items-center gap-2"
//               >
//                 Board View <ArrowUpRight size={12} />
//               </button>
//             </div>

//             <div className="space-y-3">
//               {todaysTasks.length > 0 ? (
//                 todaysTasks.map((task, idx) => (
//                   <div
//                     key={task.id}
//                     onClick={() =>
//                       handleProjectNavigation(
//                         task.project_id || task.projectId,
//                         task.Project?.name || task.projectName,
//                         task.id,
//                       )
//                     }
//                     className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white/20 border border-white/40 hover:border-indigo-400/40 hover:bg-white/80 hover:shadow-[0_20px_40px_rgba(99,102,241,0.04)] transition-all duration-500 cursor-pointer group/card gap-4"
//                   >
//                     <div className="flex items-center gap-5">
//                       <div className="w-8 h-8 rounded-xl bg-white/80 border border-white/80 flex items-center justify-center font-black text-slate-400 group-hover/card:text-indigo-600 group-hover/card:scale-105 transition-all text-[11px] shadow-sm shrink-0">
//                         {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
//                       </div>
//                       <div className="space-y-1">
//                         <h3 className="font-extrabold text-slate-800 text-sm group-hover/card:text-indigo-600 transition-colors tracking-tight">
//                           {task.title}
//                         </h3>
//                         <div className="flex flex-wrap items-center gap-2.5">
//                           <SoftBadge text={task.status} />
//                           {task.priority && <SoftBadge text={task.priority} />}
//                           <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline-block" />
//                           <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                             <Clock size={11} />{" "}
//                             {new Date(task.due_time).toLocaleDateString([], {
//                               month: "short",
//                               day: "numeric",
//                             })}
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200/20">
//                       <span className="text-[9px] font-black text-indigo-500/70 bg-indigo-50/50 border border-indigo-100/30 px-2.5 py-0.5 rounded-md sm:hidden">
//                         {task.Project?.name || "System"}
//                       </span>
//                       <div className="p-2 rounded-xl bg-white/60 border border-white group-hover/card:bg-indigo-600 group-hover/card:text-white transition-all shadow-sm shrink-0 ml-auto sm:ml-0">
//                         <ChevronRight size={14} />
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-16 text-[11px] font-black text-slate-400 border border-dashed border-slate-300/60 rounded-2xl bg-white/10">
//                   Matrix cleared. Zero pending stream focus allocated.
//                 </div>
//               )}
//             </div>
//           </section>

//           {/* RUNTIME BREAKPOINTS / ISSUES */}
//           <section className="bg-white backdrop-blur-xl border border-gray-100 rounded-md shadow-sm p-6 md:p-8">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="flex w-full justify-between">
//                 <div className="flex gap-2">
//                   <div className="p-2 bg-white rounded-sm text-rose-500 border border-rose-200/20">
//                     <AlertTriangle size={16} />
//                   </div>
//                   <div className="">
//                     <h2 className="text-base font-black text-rose-950 tracking-tight">
//                       Ecosystem Breakpoints
//                     </h2>
//                     <p className="text-[10px] font-medium text-rose-700/50">
//                       Runtime exceptions halting staging or edge branches.
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => navigate("/dev/issues")}
//                   className="text-[9px] font-black text-slate-600 bg-white/80 hover:bg-indigo-600 hover:text-white border border-white px-4 py-2 rounded-xl transition-all tracking-widest uppercase shadow-sm flex items-center gap-2"
//                 >
//                   All Errors <ArrowUpRight size={12} />
//                 </button>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {issues.length > 0 ? (
//                 issues.map((alert) => (
//                   <div
//                     key={alert.id}
//                     className="bg-white backdrop-blur-md border border-white/60 p-5 rounded-2xl hover:bg-white/80 hover:shadow-lg hover:border-rose-300/40 transition-all duration-500 group/alert cursor-pointer flex flex-col justify-between gap-4"
//                   >
//                     <p className="font-extrabold text-slate-800 text-sm tracking-tight leading-snug group-hover/alert:text-rose-600 transition-colors">
//                       {alert.title}
//                     </p>
//                     <div className="flex items-center justify-between pt-2 border-t border-slate-200/20">
//                       <span className="text-[9px] font-black tracking-widest text-rose-600 uppercase bg-rose-100/40 border border-rose-200/30 px-2 py-0.5 rounded">
//                         {alert?.description || "Global Stack"}
//                       </span>
//                       <SoftBadge
//                         className="flex justify-center items-center"
//                         text={alert?.severity}
//                       />
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="col-span-2 text-center py-8 text-[11px] font-bold text-emerald-600 bg-white border border-emerald-100/40 rounded-2xl shadow-inner">
//                   ✓ Core arrays and clusters completely stable. No trace errors
//                   found.
//                 </div>
//               )}
//             </div>
//           </section>
//         </div>

//         {/* SIDE PANEL COLUMNS */}
//         <div className="col-span-12 lg:col-span-4 space-y-8">
//           {/* REPOS NODES */}
//           <section className="bg-white backdrop-blur-2xl border border-gray-100 rounded-md shadow-sm p-6 md:p-8 relative overflow-hidden">
//             <div className="flex justify-between items-center mb-8">
//               <h2 className="text-base font-black text-slate-900 flex items-center gap-2 tracking-tight">
//                 <Layers size={16} className="text-indigo-500" /> Active Repos
//               </h2>
//               <button
//                 onClick={() => navigate("/dev/my-projects")}
//                 className="text-[9px] font-black text-indigo-600 bg-indigo-50/50 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-xl border border-indigo-100/40 transition-all tracking-widest uppercase shadow-sm"
//               >
//                 All Matrix
//               </button>
//             </div>

//             <div className="space-y-5">
//               {portfolioResponse?.data.length > 0 ? (
//                 portfolioResponse?.data.map((project) => {
//                   return (
//                     <div
//                       key={project.id}
//                       onClick={() =>
//                         handleProjectNavigation(project.id, project.name)
//                       }
//                       className="group cursor-pointer p-2.5 -mx-1 rounded-2xl hover:bg-white/60 border border-transparent hover:border-white transition-all duration-500"
//                     >
//                       <div className="flex justify-between items-start mb-2">
//                         <div className="space-y-0.5">
//                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
//                             Cluster Sprint {project.current_sprint}
//                           </p>
//                           <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors tracking-tight">
//                             {project.name}
//                           </h3>
//                         </div>
//                         <span className="text-[10px] font-black text-slate-700 bg-white border border-white shadow-sm rounded-lg px-2 py-0.5 tabular-nums">
//                           {project.progress}%
//                         </span>
//                       </div>

//                       <div className="w-full h-1 bg-slate-200/60 rounded-full overflow-hidden mb-2">
//                         <div
//                           className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
//                           style={{ width: `${project.progress}%` }}
//                         />
//                       </div>
//                     </div>
//                   );
//                 })
//               ) : (
//                 <div className="text-center py-8 text-[11px] font-bold text-slate-400 border border-dashed border-slate-200 rounded-2xl">
//                   No active instances deployed.
//                 </div>
//               )}
//             </div>
//           </section>

//           {/* ECOSYSTEM SYNC (MEETINGS MODULE WITH JITSI TRIGGER) */}
//           <section className="relative rounded-md shadow-sm p-5 bg-gradient-to-br text-white overflow-hidden group">
//             <div className="flex items-center justify-between mb-4 relative z-10">
//               <div className="flex items-center gap-2.5">
//                 <div className="text-base font-black text-slate-900 flex items-center gap-2 tracking-tight">
//                   <Activity size={14} className="animate-pulse" /> Ecosystem Sync
//                 </div>
//               </div>
//               <button
//                 onClick={() => navigate("/dev/meetings")}
//                 className="text-[9px] font-black text-black/80 hover:text-black/80 hover:cursor-pointer bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/5 transition-all tracking-wider uppercase backdrop-blur-md"
//               >
//                 All Meetings
//               </button>
//             </div>

//             <div className="max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent">
//               {notCompletedMeetings.length === 0 ? (
//                 <div className="text-center py-8 text-[11px] font-bold text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white/5">
//                   No upcoming meetings scheduled.
//                 </div>
//               ) : (
//                 notCompletedMeetings.map((meeting) => {
//                   const meetingDate = new Date(meeting?.start_time).toLocaleDateString([], {
//                     month: "short",
//                     day: "numeric",
//                   });

//                   const startTime = new Date(meeting?.start_time).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   });

//                   const endTime = new Date(meeting?.end_time).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   });

//                   return (
//                     <div
//                       key={meeting?.id || meeting?._id}
//                       className="mb-4 rounded-2xl bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md text-left"
//                     >
//                       {/* Header */}
//                       <div className="flex items-center justify-between gap-3">
//                         <div className="flex min-w-0 items-center gap-3">
//                           <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600">
//                             <Video size={17} className="text-white" />
//                           </div>

//                           <div className="min-w-0">
//                             <h3 className="truncate text-sm font-black tracking-tight text-slate-900">
//                               {meeting?.title}
//                             </h3>
//                             <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-blue-600">
//                               Upcoming Meeting
//                             </p>
//                           </div>
//                         </div>

//                         <span className="shrink-0 rounded-lg bg-blue-600 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-white">
//                           Meeting
//                         </span>
//                       </div>

//                       {/* Date & Time */}
//                       <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-slate-900">
//                         <Clock size={12} className="shrink-0 text-blue-600" />
//                         <span>{meetingDate}</span>
//                         <span className="text-slate-300">•</span>
//                         <span>
//                           {startTime} — {endTime}
//                         </span>
//                       </div>

//                       {/* 2. CONVERTED ANCHOR TO BUTTON CLICK FOR LOCAL JITSI DISPATCH */}
//                       <button
//                         type="button"
//                         onClick={() => setActiveMeeting(meeting)}
//                         className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all duration-300 hover:bg-blue-700 cursor-pointer border-0"
//                       >
//                         Join Stream Room
//                         <ExternalLink size={11} />
//                       </button>
//                     </div>
//                   );
//                 })
//               )}
//             </div>
//           </section>
//         </div>
//       </div>

//       {/* 3. INJECTED ACTIVE JITSI STREAMING PORTAL GATE */}
//       {activeMeeting && (
//         <JitsiVideoCall
//           isOpen={!!activeMeeting}
//           onClose={() => setActiveMeeting(null)}
//           roomName={activeMeeting.title}
//           userName={user_name}
//           activeChat={activeMeeting.id || activeMeeting._id}
//           userEmail={parsedUser?.email || ""}
//           currentMeetingId={activeMeeting.id || activeMeeting._id}
//         />
//       )}
//     </div>
//   );
// };

// export default Dashboard;




import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { projectService } from "../../../api/services/projectService";
import { taskService } from "../../../api/services/taskService";
import {
  ClipboardList,
  AlertTriangle,
  Video,
  Clock,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  Activity,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAssignedIssues } from "../../../hooks/useIssues";
import { useMeetingsHub } from "../../../hooks/useMeetingsHub";
import API from "../../../api/axios";
import JitsiVideoCall from "../../shared/centralchatt/Video/JitsiVideoCall"; 

// Mobile App Style Compact Micro-Badge
const SoftBadge = ({ text }) => {
  const styles = {
    todo: "bg-slate-100 text-slate-600 border-slate-200",
    inprogress: "bg-blue-50 text-blue-700 border-blue-200",
    "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
    review: "bg-violet-50 text-violet-700 border-violet-200",
    done: "bg-emerald-50 text-emerald-700 border-emerald-200",
    HIGH: "bg-rose-50 text-rose-700 border-rose-200 animate-pulse",
    Success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const displayTexts = {
    todo: "To Do",
    inprogress: "In Progress",
    review: "Review",
    done: "Done",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${styles[text] || "bg-white text-slate-600 border-slate-200"}`}
    >
      {displayTexts[text] || text}
    </span>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [activeMeeting, setActiveMeeting] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: myProjectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["my-projects"],
    queryFn: () => projectService.getMyProjects(),
  });

  const { data: todaysTasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["todays-tasks"],
    queryFn: () => taskService.getTodayTasks(),
  });

  const { data: portfolioResponse } = useQuery({
    queryKey: ["developer-project-dashboard"],
    queryFn: async () => {
      const res = await API.get("/projects/developer-project-dashboard");
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  const localUserRaw = localStorage.getItem("user");
  const parsedUser = localUserRaw ? JSON.parse(localUserRaw) : null;
  const user_name = parsedUser?.full_name || "Developer";

  const todaysTasks = todaysTasksData?.data || [];
  const { meetings } = useMeetingsHub();
  const { data: issues = [] } = useAssignedIssues();

  const handleProjectNavigation = (id, name, taskId) => {
    const encodedName = encodeURIComponent(name);
    const highlightParam = taskId ? `&highlightTaskId=${taskId}` : "";
    navigate(
      `/dev/board?projectId=${id}&projectName=${encodedName}${highlightParam}`,
    );
  };

  const notCompletedMeetings = meetings.filter((meeting) => {
    return meeting.status !== "completed";
  });

  if (projectsLoading || tasksLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-[#f8fafc]">
        <div className="w-9 h-9 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 text-center">
          Initializing Native Workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 lg:p-8 min-h-screen font-sans text-slate-800 bg-[#f8fafc] relative overflow-hidden pb-12">
      
      {/* 📱 MODERN NATIVE MOBILE APP BACKGROUND HEADER */}
      <header className="relative mx-auto mb-4 sm:mb-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white shadow-lg shadow-blue-500/10 overflow-hidden">
        
        {/* Glow Spheres Inside Mobile App Header */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/25 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* User Mobile Profile Section */}
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-white/20 backdrop-blur-md p-[1.5px] border border-white/30 shadow-md">
                <div className="w-full h-full bg-blue-950 rounded-[14px] flex items-center justify-center text-white font-black text-lg uppercase tracking-wider">
                  {user_name.charAt(0)}
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-blue-600 rounded-full flex items-center justify-center">
                <span className="w-1 h-1 bg-white rounded-full animate-ping" />
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-[9px] font-extrabold text-blue-100 uppercase tracking-widest">
                  <Sparkles size={10} className="text-amber-300" /> Mobile Core
                </span>
              </div>

              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                Welcome, <span className="text-blue-200">{user_name}</span> 👋
              </h1>

              <p className="text-blue-100/80 text-[11px] sm:text-xs font-semibold">
                You have <span className="font-extrabold text-white bg-blue-500/40 px-1.5 py-0.2 rounded border border-blue-400/30">{todaysTasks.length} pending tasks</span> for today
              </p>
            </div>
          </div>

          {/* Time & Action Chips */}
          <div className="flex items-center justify-between sm:justify-end gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
            
            {/* Live App Clock */}
            <div className="flex items-center gap-2 bg-black/20 border border-white/15 px-3 py-1.5 rounded-xl backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs font-black text-blue-50 tracking-wider tabular-nums">
                {time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>

            {/* Quick Board Trigger */}
            <button
              onClick={() => navigate("/dev/board")}
              className="px-3.5 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs active:scale-95 transition-all flex items-center gap-1.5 shadow-md shadow-blue-900/20"
            >
              <Zap size={13} className="fill-current text-blue-600" />
              <span className="text-[10px] uppercase tracking-wider">Quick Board</span>
            </button>

          </div>
        </div>
      </header>

      {/* 📱 NATIVE APP MAIN CONTENT LAYOUT */}
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 relative z-10">
        
        {/* LEFT COLUMN: Main App Streams */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          
          {/* TASK LIST STREAM PANEL */}
          <section className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="space-y-0.5">
                <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2 tracking-tight">
                  <ClipboardList size={17} className="text-blue-600 shrink-0" />{" "}
                  Current Session Stream
                </h2>
                <p className="text-slate-400 text-[10px] font-medium hidden sm:block">
                  Click a task node to jump directly into the workspace board.
                </p>
              </div>
              <button
                onClick={() => navigate("/dev/board")}
                className="text-[9px] font-black text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-100 px-3 py-1.5 rounded-xl transition-all tracking-wider uppercase flex items-center gap-1 shrink-0"
              >
                Board View <ArrowUpRight size={12} />
              </button>
            </div>

            <div className="space-y-2.5">
              {todaysTasks.length > 0 ? (
                todaysTasks.map((task, idx) => (
                  <div
                    key={task.id}
                    onClick={() =>
                      handleProjectNavigation(
                        task.project_id || task.projectId,
                        task.Project?.name || task.projectName,
                        task.id,
                      )
                    }
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-blue-300 hover:bg-white active:scale-[0.99] transition-all duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-600 text-[10px] shrink-0 mt-0.5 sm:mt-0">
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm tracking-tight line-clamp-1">
                          {task.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <SoftBadge text={task.status} />
                          {task.priority && <SoftBadge text={task.priority} />}
                          <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline-block" />
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            <Clock size={11} className="text-blue-500" />{" "}
                            {new Date(task.due_time).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/50">
                      <span className="text-[9px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md sm:hidden">
                        {task.Project?.name || "System"}
                      </span>
                      <div className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-400 shrink-0 ml-auto sm:ml-0">
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[11px] font-bold text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  Matrix cleared. Zero pending stream focus allocated.
                </div>
              )}
            </div>
          </section>

          {/* RUNTIME BREAKPOINTS / ISSUES */}
          <section className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-50 rounded-xl text-rose-600 border border-rose-100 shrink-0">
                  <AlertTriangle size={15} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    Ecosystem Breakpoints
                  </h2>
                </div>
              </div>
              <button
                onClick={() => navigate("/dev/issues")}
                className="text-[9px] font-black text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-100 px-3 py-1.5 rounded-xl transition-all tracking-wider uppercase flex items-center gap-1 shrink-0"
              >
                All Errors <ArrowUpRight size={12} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {issues.length > 0 ? (
                issues.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-slate-50/80 border border-slate-200/80 p-3.5 rounded-2xl hover:bg-white hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between gap-2.5"
                  >
                    <p className="font-extrabold text-slate-800 text-xs tracking-tight line-clamp-2">
                      {alert.title}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-[9px] font-black tracking-wider text-rose-600 uppercase bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                        {alert?.description || "Global Stack"}
                      </span>
                      <SoftBadge text={alert?.severity} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="sm:col-span-2 text-center py-6 text-[11px] font-bold text-emerald-600 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                  ✓ Core arrays and clusters completely stable. No trace errors found.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR: Repos & Sync Stream */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          
          {/* REPOS NODES */}
          <section className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4 sm:p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2 tracking-tight">
                <Layers size={16} className="text-blue-600" /> Active Repos
              </h2>
              <button
                onClick={() => navigate("/dev/my-projects")}
                className="text-[9px] font-black text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-2.5 py-1 rounded-xl border border-blue-100 transition-all tracking-wider uppercase"
              >
                All Matrix
              </button>
            </div>

            <div className="space-y-2.5">
              {portfolioResponse?.data?.length > 0 ? (
                portfolioResponse?.data.map((project) => (
                  <div
                    key={project.id}
                    onClick={() =>
                      handleProjectNavigation(project.id, project.name)
                    }
                    className="cursor-pointer p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-blue-300 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          Sprint {project.current_sprint}
                        </p>
                        <h3 className="text-xs font-extrabold text-slate-800 tracking-tight">
                          {project.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-md px-2 py-0.5 tabular-nums">
                        {project.progress}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-[11px] font-bold text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  No active instances deployed.
                </div>
              )}
            </div>
          </section>

          {/* ECOSYSTEM SYNC (MEETINGS MODULE) */}
          <section className="rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 bg-white">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-blue-600 animate-pulse" />
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  Ecosystem Sync
                </h2>
              </div>
              <button
                onClick={() => navigate("/dev/meetings")}
                className="text-[9px] font-black text-slate-600 hover:text-blue-600 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 uppercase tracking-wider"
              >
                All Meetings
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto pr-1 space-y-2.5">
              {notCompletedMeetings.length === 0 ? (
                <div className="text-center py-6 text-[11px] font-bold text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  No upcoming meetings scheduled.
                </div>
              ) : (
                notCompletedMeetings.map((meeting) => {
                  const meetingDate = new Date(meeting?.start_time).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  });

                  const startTime = new Date(meeting?.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const endTime = new Date(meeting?.end_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={meeting?.id || meeting?._id}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 transition-all hover:bg-white hover:border-blue-300 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                            <Video size={14} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-xs font-extrabold text-slate-900">
                              {meeting?.title}
                            </h3>
                            <p className="text-[9px] font-black uppercase tracking-wider text-blue-600">
                              Upcoming Meeting
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                        <Clock size={11} className="shrink-0 text-blue-600" />
                        <span>{meetingDate}</span>
                        <span className="text-slate-300">•</span>
                        <span>
                          {startTime} - {endTime}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveMeeting(meeting)}
                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-[10px] font-black uppercase tracking-wider text-white hover:bg-blue-700 transition-colors active:scale-[0.98] shadow-xs"
                      >
                        Join Stream Room
                        <ExternalLink size={11} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      {/* JITSI STREAMING MODAL */}
      {activeMeeting && (
        <JitsiVideoCall
          isOpen={!!activeMeeting}
          onClose={() => setActiveMeeting(null)}
          roomName={activeMeeting.title}
          userName={user_name}
          activeChat={activeMeeting.id || activeMeeting._id}
          userEmail={parsedUser?.email || ""}
          currentMeetingId={activeMeeting.id || activeMeeting._id}
        />
      )}
    </div>
  );
};

export default Dashboard;