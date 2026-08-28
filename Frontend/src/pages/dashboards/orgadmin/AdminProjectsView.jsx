import { useState, useEffect, useMemo } from "react";
import ProjectSidebar from "./ProjectSidebar";
import CreateProjectModal from "./CreateProjectModal";
import TeamManagementModal from "./TeamManagementModal";
import ArchiveProjectModal from "./ArchiveProjectModal";
import ActiveProjectModal from "./ActiveProjectModal copy";
import { triggerToast } from "../../../utils/toastHelper";
import {
  useProjectMutations,
  useProjectsData,
} from "../../../hooks/useProjects";

const AdminProjectsView = () => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedProjectForSidebar, setSelectedProjectForSidebar] =
    useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedUserId, setSelectedUserId] = useState("");
  const { data: serverData, isLoading } = useProjectsData();
  const { createMutation, teamMutation, archiveMutation, activeMutation } =
    useProjectMutations();

  const [activeFilter, setActiveFilter] = useState("All Projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTeam, setProjectTeam] = useState([]);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "ACTIVE",
    managerId: "",
  });

  const projects = serverData?.projectsRes?.projects || [];
  const allUsers = serverData?.usersRes?.users || [];
  const baseStats = serverData?.projectsRes?.stats || {
    total: 0,
    active: 0,
    archived: 0,
  };

  const stats = useMemo(() => {
    const noManagerCount = projects.filter(
      (p) =>
        !p.members?.some((m) => m.ProjectMember?.project_role === "Manager"),
    ).length;
    return { ...baseStats, noManager: noManagerCount };
  }, [projects, baseStats]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.project_code?.toLowerCase().includes(searchQuery.toLowerCase());

      const status = p.status?.toUpperCase();
      if (activeFilter === "Active")
        return matchesSearch && status === "ACTIVE";
      if (activeFilter === "Archived")
        return matchesSearch && status === "ARCHIVED";
      if (activeFilter === "No Manager") return matchesSearch && !p.manager_id;

      return matchesSearch;
    });
  }, [searchQuery, activeFilter, projects]);

  const handleCreateSubmit = (e, createChannel) => {
    e.preventDefault();
    createMutation.mutate(
      {
        ...newProject,
        manager_id: newProject.managerId || 1,
        createChannel,
      },
      {
        onSuccess: (res) => {
          setSelectedProject(res.data);
          setActiveModal("team");
          setNewProject({
            name: "",
            description: "",
            status: "ACTIVE",
            managerId: "",
          });
        },
        onError: (err) => {
          const errorMsg = err.response?.data?.errors
            ? err.response.data.errors
                .map((e) => `${e.field}: ${e.message}`)
                .join("\n")
            : err.response?.data?.message || "Creation failed";
          triggerToast(errorMsg, "error");
        },
      },
    );
  };

  useEffect(() => {
    if (activeModal === "team" && selectedProject) {
      const currentProj = projects.find((p) => p.id === selectedProject.id);
      if (currentProj) {
        const initialTeam = currentProj.members.map((id) => {
          const user = allUsers.find((u) => u.id === id);
          return {
            ...user,
            role:
              user?.full_name === currentProj.manager ? "Manager" : "Member",
          };
        });
        setProjectTeam(initialTeam);
      }
    }
  }, [activeModal, selectedProject, projects, allUsers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMember = () => {
    if (!selectedUserId) return triggerToast("Select a user", "error");
    const userId = parseInt(selectedUserId);
    const currentMembers = selectedProject?.members || [];

    if (currentMembers.some((m) => m.id === userId)) {
      return triggerToast("Already added to this project team", "error");
    }

    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      const newMemberWithPivot = {
        ...user,
        ProjectMember: { project_role: "Member" },
      };
      setSelectedProject((prevProject) => {
        if (!prevProject) return prevProject;
        return {
          ...prevProject,
          members: [...currentMembers, newMemberWithPivot],
        };
      });
      setSelectedUserId("");
      triggerToast(
        `${user.full_name || "Member"} added successfully!`,
        "success",
      );
    } else {
      triggerToast("User context resource not found", "error");
    }
  };

  const handleRoleChange = (memberId, newRole) => {
    setSelectedProject((prevProject) => {
      if (!prevProject || !prevProject.members) return prevProject;
      const updatedMembers = prevProject.members.map((m) => {
        const currentPivot = m.ProjectMember || { project_role: "Member" };
        if (newRole === "Manager") {
          return m.id === memberId
            ? {
                ...m,
                ProjectMember: { ...currentPivot, project_role: "Manager" },
              }
            : {
                ...m,
                ProjectMember: { ...currentPivot, project_role: "Member" },
              };
        } else {
          return m.id === memberId
            ? {
                ...m,
                ProjectMember: { ...currentPivot, project_role: "Member" },
              }
            : m;
        }
      });
      return { ...prevProject, members: updatedMembers };
    });
  };

  const removeMember = (userId) => {
    setSelectedProject((prevProject) => {
      if (!prevProject) return prevProject;
      return {
        ...prevProject,
        members: prevProject.members
          ? prevProject.members.filter((m) => m.id !== userId)
          : [],
      };
    });
  };

  const handleSaveTeam = () => {
    const membersList = selectedProject?.members || [];
    const formattedMembers = membersList.map((m) => ({
      id: m.id,
      role: m.ProjectMember?.project_role || "Member",
    }));

    teamMutation.mutate(
      { projectId: selectedProject.id, members: formattedMembers },
      {
        onSuccess: () => {
          triggerToast("Team metadata synchronized successfully!", "success");
          setActiveModal(null);
        },
        onError: (error) => {
          triggerToast(
            error?.response?.data?.message || "Failed to save team.",
            "error",
          );
        },
      },
    );
  };

  if (isLoading)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#fdfcff]">
        <div className="w-10 h-10 border-4 border-indigo-600/15 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="mt-4 font-bold text-slate-400 tracking-widest text-[10px] uppercase animate-pulse">
          Syncing Architecture...
        </span>
      </div>
    );

  const renderAvatarGroup = (memberIds = []) => {
    if (!Array.isArray(memberIds)) return null;
    const maxVisible = 3;
    const visibleIds = memberIds.slice(0, maxVisible);
    const remainingCount = memberIds.length - maxVisible;

    return (
      <div className="flex items-center -space-x-2">
        {visibleIds.map((id) => {
          const user = allUsers.find((u) => u.id === id);
          return (
            <div
              key={id}
              title={user?.full_name}
              className={`w-9 h-9 rounded-full overflow-hidden border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-1 ring-slate-200 ${user?.color || "bg-slate-400"}`}
            >
              {/* <div  className="rounded-full border border-blue-100 bg-blue-600 w-full h-full flex items-center justify-center text-white font-black text-xs shadow-sm uppercase overflow-hidden"> */}
              {user?.avatar_url ? (
                <img
                  src={user?.avatar_url}
                  alt="Avatar"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />
              ) : user?.full_name ? (
                user?.full_name[0].toUpperCase()
              ) : (
                "U"
              )}
              {/* </div> */}
            </div>
          );
        })}
        {remainingCount > 0 && (
          <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100/80 ring-1 ring-black/5 flex items-center justify-center text-[9px] font-bold text-slate-500 shadow-sm">
            +{remainingCount}
          </div>
        )}
      </div>
    );
  };

  return (
    // <div className="min-h-screen bg-gradient-to-tr from-[#fff7f5] via-[#faf9ff] to-[#f4f7ff] p-4 sm:p-8 lg:p-12 text-left font-sans relative overflow-x-hidden selection:bg-indigo-100">
    //   <div className="absolute top-0 left-0 w-[45vw] h-[45vw] max-w-[450px] bg-gradient-to-br from-cyan-200/20 to-blue-300/15 rounded-full filter blur-[100px] pointer-events-none" />
    //   <div className="absolute top-0 right-0 w-[35vw] h-[35vw] max-w-[400px] bg-gradient-to-bl from-purple-200/25 to-fuchsia-200/15 rounded-full filter blur-[100px] pointer-events-none" />
    //   <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] max-w-[450px] bg-gradient-to-tr from-amber-100/15 to-pink-200/20 rounded-full filter blur-[120px] pointer-events-none" />

    //   <div className="relative z-10 mx-auto">
    //     {/* --- HEADER BLOCK --- */}
    //     <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
    //       <div>
    //         <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
    //           Product Catalog
    //         </h1>
    //         <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
    //           It’s about connecting the right circles. Manage work and
    //           ownership.
    //         </p>
    //       </div>
    //       <button
    //         onClick={() => setActiveModal("create")}
    //         className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-md text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
    //       >
    //         <span className="text-sm font-bold">+</span> Create Project
    //       </button>
    //     </div>

    //     {/* --- CONTROLS: FILTERS & SEARCH --- */}
    //     <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8">
    //       <div className="flex p-1 bg-white/70 backdrop-blur-md border border-white/60 rounded-md shadow-sm overflow-x-auto whitespace-nowrap scrollbar-none max-w-full">
    //         {["All Projects", "Active", "Archived"].map((tab) => (
    //           <button
    //             key={tab}
    //             onClick={() => setActiveFilter(tab)}
    //             className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
    //               activeFilter === tab
    //                 ? "bg-slate-900 text-white shadow-sm"
    //                 : "text-slate-500 hover:text-slate-900 bg-transparent"
    //             }`}
    //           >
    //             {tab}
    //           </button>
    //         ))}
    //       </div>

    //       <div className="relative w-full md:w-80">
    //         <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
    //           🔍
    //         </span>
    //         <input
    //           value={searchQuery}
    //           onChange={(e) => setSearchQuery(e.target.value)}
    //           placeholder="Search projects..."
    //           className="w-full bg-white/70 backdrop-blur-md border border-white/60 rounded-md pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600/50 shadow-sm transition-all"
    //         />
    //       </div>
    //     </div>

    //     {/* --- STATS GRID --- */}
    //     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    //       {[
    //         {
    //           label: "Total Managed",
    //           value: stats.total,
    //           color: "text-slate-800",
    //           stroke: "#334155",
    //           ring: "border-t-slate-400",
    //         },
    //         {
    //           label: "Active Pipelines",
    //           value: stats.active,
    //           color: "text-blue-600",
    //           stroke: "#2563eb",
    //           ring: "border-t-blue-500",
    //         },
    //         {
    //           label: "Awaiting Manager",
    //           value: stats.noManager,
    //           color: "text-purple-600",
    //           stroke: "#9333ea",
    //           ring: "border-t-purple-500",
    //         },
    //         {
    //           label: "Archived Assets",
    //           value: stats.archived,
    //           color: "text-slate-400",
    //           stroke: "#94a3b8",
    //           ring: "border-t-slate-300",
    //         },
    //       ].map((s, i) => {
    //         // Total mein se percentage calculate karna
    //         const percentage =
    //           stats.total > 0
    //             ? Math.min(100, Math.round((s.value / stats.total) * 100))
    //             : 0;

    //         // Half-Pie Chart Dash Calculation (Circumference based)
    //         const radius = 16;
    //         const circumference = Math.PI * radius; // Half circle
    //         const strokeDashoffset =
    //           circumference - (percentage / 100) * circumference;

    //         return (
    //           <div
    //             key={i}
    //             className={`p-5 bg-white/60 backdrop-blur-lg border border-white/60 border-t-4 ${s.ring} rounded-md shadow-sm flex items-center justify-between`}
    //           >
    //             <div>
    //               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
    //                 {s.label}
    //               </p>
    //               <p
    //                 className={`text-2xl font-extrabold tracking-tight ${s.color} mt-1`}
    //               >
    //                 {s.value < 10 ? `0${s.value}` : s.value}
    //               </p>
    //               <span className="text-[10px] font-medium text-slate-400 mt-1 block">
    //                 {percentage}% of total
    //               </span>
    //             </div>

    //             {/* Half Donut / Gauge Chart */}
    //             <div className="relative w-14 h-16 flex items-center justify-center overflow-hidden">
    //               <svg
    //                 className="w-14 h-14 transform -rotate-180"
    //                 viewBox="0 0 40 40"
    //               >
    //                 {/* Background Track */}
    //                 <circle
    //                   cx="20"
    //                   cy="20"
    //                   r={radius}
    //                   className="text-slate-200"
    //                   strokeWidth="4"
    //                   stroke="currentColor"
    //                   fill="transparent"
    //                   strokeDasharray={circumference}
    //                 />
    //                 {/* Value Progress */}
    //                 <circle
    //                   cx="20"
    //                   cy="20"
    //                   r={radius}
    //                   stroke={s.stroke}
    //                   strokeWidth="4"
    //                   fill="transparent"
    //                   strokeDasharray={circumference}
    //                   strokeDashoffset={strokeDashoffset}
    //                   strokeLinecap="round"
    //                   className="transition-all duration-500 ease-out"
    //                 />
    //               </svg>
    //             </div>
    //           </div>
    //         );
    //       })}
    //     </div>

    //     {/* ========================================================================= */}
    //     {/* 💻 DESKTOP VIEW: STANDARD COMPACT GLASS TABLE (Hidden on mobile/tablet) */}
    //     {/* ========================================================================= */}
    //     <div className="hidden md:block bg-white/50 backdrop-blur-xl border border-white/70 rounded-md shadow-sm overflow-hidden">
    //       <div className="overflow-x-auto w-full">
    //         <table className="w-full text-left border-collapse">
    //           <thead className="bg-slate-50/50 backdrop-blur-md border-b border-slate-100/80">
    //             <tr>
    //               <th className="pl-6 pr-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[28%]">
    //                 Project Context
    //               </th>
    //               <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center w-[12%]">
    //                 Status
    //               </th>
    //               <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[25%]">
    //                 Assigned Lead / Owner
    //               </th>
    //               <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[15%]">
    //                 Team
    //               </th>
    //               <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[15%]">
    //                 Created At
    //               </th>
    //               <th className="pr-6 pl-4 py-4 w-[5%]"></th>
    //             </tr>
    //           </thead>
    //           <tbody className="divide-y divide-slate-100/60">
    //             {filteredProjects.map((project) => (
    //               <tr
    //                 key={project?.id}
    //                 className="hover:bg-white/60 group transition-all duration-150"
    //               >
    //                 <td
    //                   onClick={() => {
    //                     setSelectedProjectForSidebar(project);
    //                     setActiveTab("Overview");
    //                   }}
    //                   className="pl-6 pr-4 py-4 hover:cursor-pointer"
    //                 >
    //                   <div className="flex items-center gap-3">
    //                     <div className="w-9 h-9 shrink-0 bg-gradient-to-br from-white to-slate-50 rounded-md flex items-center justify-center text-indigo-600 font-bold border border-slate-200/60 text-xs shadow-sm">
    //                       {project?.name
    //                         ? project.name.charAt(0).toUpperCase()
    //                         : "P"}
    //                     </div>
    //                     <div className="overflow-hidden">
    //                       <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
    //                         {project?.name || "Untitled Project"}
    //                       </p>
    //                       <div className="flex items-center gap-1.5 mt-0.5">
    //                         <span className="text-[10px] text-slate-400 font-medium tracking-tight truncate">
    //                           {project?.code || "N/A"}
    //                         </span>
    //                         <span className="text-[9px] text-indigo-500/90 font-semibold bg-indigo-50/50 px-1 py-0.2 rounded border border-indigo-100/40 shrink-0">
    //                           #
    //                           {project?.name
    //                             ?.toLowerCase()
    //                             .replace(/\s+/g, "-")
    //                             .slice(0, 12) || "proj"}
    //                         </span>
    //                       </div>
    //                     </div>
    //                   </div>
    //                 </td>

    //                 <td className="px-4 py-4 text-center whitespace-nowrap">
    //                   <span
    //                     className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${
    //                       project.status === "ACTIVE"
    //                         ? "bg-emerald-50/70 text-emerald-600 border-emerald-100"
    //                         : "bg-rose-50/70 text-rose-600 border-rose-100"
    //                     }`}
    //                   >
    //                     {project.status || "UNKNOWN"}
    //                   </span>
    //                 </td>

    //                 <td className="px-4 py-4 whitespace-nowrap">
    //                   {(() => {
    //                     const manager = project.members?.find(
    //                       (m) => m.ProjectMember?.project_role === "Manager",
    //                     );
    //                     return manager ? (
    //                       <div className="flex items-center gap-2.5">
    //                         <div className="w-7 h-7 shrink-0 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-600 shadow-sm">
    //                           {manager.full_name
    //                             ?.split(" ")
    //                             .map((n) => n[0])
    //                             .join("")
    //                             .toUpperCase()
    //                             .slice(0, 2)}
    //                         </div>
    //                         <div className="overflow-hidden">
    //                           <p className="text-xs font-semibold text-slate-700 truncate">
    //                             {manager.full_name}
    //                           </p>
    //                           <p className="text-[10px] text-slate-400 truncate mt-0.5">
    //                             {manager.email}
    //                           </p>
    //                         </div>
    //                       </div>
    //                     ) : (
    //                       <span className="bg-amber-50/60 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded border border-amber-200/60 uppercase tracking-wide">
    //                         Unassigned
    //                       </span>
    //                     );
    //                   })()}
    //                 </td>

    //                 <td className="px-4 py-4">
    //                   <div className="flex justify-start">
    //                     {renderAvatarGroup(
    //                       project.members?.map((m) => m.id || m),
    //                     )}
    //                   </div>
    //                 </td>

    //                 <td className="px-4 py-4 text-xs font-semibold text-slate-400 whitespace-nowrap">
    //                   {project.createdAt
    //                     ? new Date(project.createdAt).toLocaleDateString(
    //                         "en-US",
    //                         { month: "short", day: "2-digit", year: "numeric" },
    //                       )
    //                     : "—"}
    //                 </td>

    //                 <td className="pr-6 pl-4 py-4 text-right relative whitespace-nowrap">
    //                   <button
    //                     onClick={() =>
    //                       setOpenDropdownId(
    //                         openDropdownId === project.id ? null : project.id,
    //                       )
    //                     }
    //                     className="text-slate-400 hover:text-slate-700 text-sm font-black p-1.5 rounded-md hover:bg-white/80"
    //                   >
    //                     ⋮
    //                   </button>
    //                   {openDropdownId === project.id && (
    //                     <div className="absolute right-12 -top-14 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-xl rounded-md py-1.5 z-50 w-44 text-left">
    //                       <button
    //                         onClick={() => {
    //                           setSelectedProject(project);
    //                           const initialTeam = project.members.map(
    //                             (member) => ({
    //                               ...member,
    //                               role: member.ProjectMember?.project_role,
    //                             }),
    //                           );
    //                           setProjectTeam(initialTeam);
    //                           setActiveModal("team");
    //                           setOpenDropdownId(null);
    //                         }}
    //                         className="w-full px-4 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
    //                       >
    //                         Manage Team
    //                       </button>
    //                       <button
    //                         onClick={() => {
    //                           setSelectedProject(project);
    //                           setActiveModal("active");
    //                           setOpenDropdownId(null);
    //                         }}
    //                         className="w-full px-4 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
    //                       >
    //                         Active Project
    //                       </button>
    //                       <hr className="border-slate-100 my-1" />
    //                       <button
    //                         onClick={() => {
    //                           setSelectedProject(project);
    //                           setActiveModal("archive");
    //                           setOpenDropdownId(null);
    //                         }}
    //                         className="w-full px-4 py-2 text-[11px] font-semibold text-rose-500 hover:bg-rose-50 flex items-center gap-2"
    //                       >
    //                         Archive Project
    //                       </button>
    //                     </div>
    //                   )}
    //                 </td>
    //               </tr>
    //             ))}
    //           </tbody>
    //         </table>
    //       </div>
    //     </div>

    //     {/* ========================================================================= */}
    //     {/* 📱 MOBILE VIEW: PREMIUM RESPONSIVE CARDS (Block layout shown on small screens) */}
    //     {/* ========================================================================= */}
    //     <div className="block md:hidden grid grid-cols-1 gap-4">
    //       {filteredProjects.map((project) => (
    //         <div
    //           key={project?.id}
    //           className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-md shadow-sm relative overflow-hidden flex flex-col justify-between group"
    //         >
    //           {/* Header inside Mobile Card */}
    //           <div className="flex justify-between items-start gap-2 mb-4">
    //             <div
    //               className="flex items-center gap-3 cursor-pointer overflow-hidden"
    //               onClick={() => {
    //                 setSelectedProjectForSidebar(project);
    //                 setActiveTab("Overview");
    //               }}
    //             >
    //               <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-white to-slate-50 rounded-md flex items-center justify-center text-indigo-600 font-bold border border-slate-200/60 text-sm shadow-xs">
    //                 {project?.name ? project.name.charAt(0).toUpperCase() : "P"}
    //               </div>
    //               <div className="overflow-hidden">
    //                 <h3 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
    //                   {project?.name || "Untitled Project"}
    //                 </h3>
    //                 <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5">
    //                   {project?.project_code || "N/A"} •{" "}
    //                   <span className="text-indigo-500 font-semibold">
    //                     #
    //                     {project?.name
    //                       ?.toLowerCase()
    //                       .replace(/\s+/g, "-")
    //                       .slice(0, 10)}
    //                   </span>
    //                 </p>
    //               </div>
    //             </div>

    //             {/* Mobile Action Actions Button */}
    //             <div className="relative shrink-0">
    //               <button
    //                 onClick={() =>
    //                   setOpenDropdownId(
    //                     openDropdownId === project.id ? null : project.id,
    //                   )
    //                 }
    //                 className="text-slate-400 hover:text-slate-700 font-black p-1.5 rounded-md bg-white/40 border border-slate-200/40 text-xs"
    //               >
    //                 ⋮
    //               </button>
    //               {openDropdownId === project.id && (
    //                 <div className="absolute right-0 top-7 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-xl rounded-md py-1.5 z-50 w-44 text-left">
    //                   <button
    //                     onClick={() => {
    //                       setSelectedProject(project);
    //                       const initialTeam = project.members.map((member) => ({
    //                         ...member,
    //                         role: member.ProjectMember?.project_role,
    //                       }));
    //                       setProjectTeam(initialTeam);
    //                       setActiveModal("team");
    //                       setOpenDropdownId(null);
    //                     }}
    //                     className="w-full px-4 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
    //                   >
    //                     Manage Cluster Team
    //                   </button>
    //                   <button
    //                     onClick={() => {
    //                       setSelectedProject(project);
    //                       setActiveModal("active");
    //                       setOpenDropdownId(null);
    //                     }}
    //                     className="w-full px-4 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
    //                   >
    //                     Restore Pipeline
    //                   </button>
    //                   <hr className="border-slate-100 my-1" />
    //                   <button
    //                     onClick={() => {
    //                       setSelectedProject(project);
    //                       setActiveModal("archive");
    //                       setOpenDropdownId(null);
    //                     }}
    //                     className="w-full px-4 py-2 text-[11px] font-semibold text-rose-500 hover:bg-rose-50 flex items-center gap-2"
    //                   >
    //                     Archive Workspace
    //                   </button>
    //                 </div>
    //               )}
    //             </div>
    //           </div>

    //           {/* Status Badge Line */}
    //           <div className="flex justify-between items-center border-t border-slate-100/60 pt-3 mt-1">
    //             <span className="text-[10px] text-slate-400 font-medium">
    //               Pipeline Status:
    //             </span>
    //             <span
    //               className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${
    //                 project.status === "ACTIVE"
    //                   ? "bg-emerald-50/70 text-emerald-600 border-emerald-100"
    //                   : "bg-rose-50/70 text-rose-600 border-rose-100"
    //               }`}
    //             >
    //               {project.status || "UNKNOWN"}
    //             </span>
    //           </div>

    //           {/* Owner / Manager Line */}
    //           <div className="flex justify-between items-center mt-2.5">
    //             <span className="text-[10px] text-slate-400 font-medium">
    //               Assigned Owner:
    //             </span>
    //             <div>
    //               {(() => {
    //                 const manager = project.members?.find(
    //                   (m) => m.ProjectMember?.project_role === "Manager",
    //                 );
    //                 return manager ? (
    //                   <span className="text-xs font-semibold text-slate-700 bg-white/80 border border-slate-200/40 px-2 py-1 rounded-md shadow-2xs">
    //                     {manager.full_name}
    //                   </span>
    //                 ) : (
    //                   <span className="bg-amber-50/60 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded border border-amber-200/60 uppercase tracking-wide">
    //                     Unassigned
    //                   </span>
    //                 );
    //               })()}
    //             </div>
    //           </div>

    //           {/* Team Allocation Line */}
    //           <div className="flex justify-between items-center mt-2.5">
    //             <span className="text-[10px] text-slate-400 font-medium">
    //               Allocated Cluster:
    //             </span>
    //             <div className="flex justify-end">
    //               {renderAvatarGroup(project.members?.map((m) => m.id || m))}
    //             </div>
    //           </div>

    //           {/* Timestamp Line */}
    //           <div className="flex justify-between items-center mt-2.5 border-t border-slate-100/40 pt-2.5 text-[10px] font-semibold text-slate-400">
    //             <span>Deployment Date:</span>
    //             <span>
    //               {project.createdAt
    //                 ? new Date(project.createdAt).toLocaleDateString("en-US", {
    //                     month: "short",
    //                     day: "2-digit",
    //                     year: "numeric",
    //                   })
    //                 : "—"}
    //             </span>
    //           </div>
    //         </div>
    //       ))}
    //     </div>
    //   </div>

    //   {/* --- MODAL INJECTION BOUNDS --- */}
    //   {activeModal && (
    //     <div className="fixed inset-0 bg-slate-900/15 backdrop-blur-xs z-[100] flex items-center justify-center p-4 transition-all">
    //       {activeModal === "create" && (
    //         <CreateProjectModal
    //           setActiveModal={setActiveModal}
    //           newProject={newProject}
    //           handleInputChange={handleInputChange}
    //           handleCreateSubmit={handleCreateSubmit}
    //           allUsers={allUsers}
    //           isLoading={createMutation.isLoading}
    //         />
    //       )}

    //       {activeModal === "team" && (
    //         <TeamManagementModal
    //           setActiveModal={setActiveModal}
    //           selectedProject={selectedProject}
    //           selectedUserId={selectedUserId}
    //           setSelectedUserId={setSelectedUserId}
    //           allUsers={allUsers}
    //           projectTeam={projectTeam}
    //           handleAddMember={handleAddMember}
    //           handleRoleChange={handleRoleChange}
    //           removeMember={removeMember}
    //           handleSaveChanges={handleSaveTeam}
    //           isLoading={teamMutation.isLoading}
    //         />
    //       )}

    //       {activeModal === "archive" && (
    //         <ArchiveProjectModal
    //           setActiveModal={setActiveModal}
    //           selectedProject={selectedProject}
    //           isLoading={archiveMutation.isLoading}
    //           onConfirm={() => {
    //             archiveMutation.mutate(selectedProject.id, {
    //               onSuccess: () => {
    //                 setActiveModal(null);
    //                 setSelectedProjectForSidebar(null);
    //                 triggerToast("Project Archived!", "success");
    //               },
    //             });
    //           }}
    //         />
    //       )}

    //       {activeModal === "active" && (
    //         <ActiveProjectModal
    //           setActiveModal={setActiveModal}
    //           selectedProject={selectedProject}
    //           isLoading={activeMutation.isLoading}
    //           onConfirm={() => {
    //             activeMutation.mutate(selectedProject.id, {
    //               onSuccess: () => {
    //                 setActiveModal(null);
    //                 setSelectedProjectForSidebar(null);
    //                 triggerToast("Project Restored!", "success");
    //               },
    //             });
    //           }}
    //         />
    //       )}
    //     </div>
    //   )}

    //   {/* --- SIDEBAR WORKSPACE DETAIL OVERVIEW --- */}
    //   {activeModal !== "archive" &&
    //     activeModal !== "team" &&
    //     selectedProjectForSidebar && (
    //       <ProjectSidebar
    //         selectedProjectForSidebar={selectedProjectForSidebar}
    //         setSelectedProjectForSidebar={setSelectedProjectForSidebar}
    //         activeTab={activeTab}
    //         setActiveTab={setActiveTab}
    //         allUsers={allUsers}
    //         setActiveModal={setActiveModal}
    //         setSelectedProjectId={setSelectedProject?.id}
    //         setSelectedProject={setSelectedProject}
    //         projects={projects}
    //       />
    //     )}
    // </div>
    <div className="min-h-screen bg-gradient-to-tr from-[#fff7f5] via-[#faf9ff] to-[#f4f7ff] p-3 sm:p-6 lg:p-10 text-left font-sans relative overflow-x-hidden selection:bg-indigo-100 pb-20 sm:pb-8">
    
    {/* Blurred Background Orbs */}
    <div className="absolute top-0 left-0 w-[45vw] h-[45vw] max-w-[450px] bg-gradient-to-br from-cyan-200/20 to-blue-300/15 rounded-full filter blur-[100px] pointer-events-none" />
    <div className="absolute top-0 right-0 w-[35vw] h-[35vw] max-w-[400px] bg-gradient-to-bl from-purple-200/25 to-fuchsia-200/15 rounded-full filter blur-[100px] pointer-events-none" />
    <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] max-w-[450px] bg-gradient-to-tr from-amber-100/15 to-pink-200/20 rounded-full filter blur-[120px] pointer-events-none" />

    <div className="relative z-10 mx-auto">
      
      {/* --- HEADER BLOCK --- */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Connect circles, manage work & team ownership.
          </p>
        </div>
        
        {/* Create Button (Mobile Native Touch Optimized) */}
        <button
          onClick={() => setActiveModal("create")}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 sm:py-2.5 rounded-2xl sm:rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation"
        >
          <span className="text-base font-extrabold">+</span> Create Project
        </button>
      </div>

      {/* --- CONTROLS: FILTERS & SEARCH --- */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-6">
        
        {/* Pill Tabs with Touch Scroll */}
        <div className="flex p-1 bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl shadow-sm overflow-x-auto whitespace-nowrap scrollbar-none max-w-full">
          {["All Projects", "Active", "Archived"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all touch-manipulation ${
                activeFilter === tab
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "text-slate-500 hover:text-slate-900 bg-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Glass Search Input */}
        <div className="relative w-full md:w-80">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
            🔍
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl pl-9 pr-4 py-2.5 sm:py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 shadow-inner transition-all"
          />
        </div>
      </div>

      {/* --- STATS GRID (Mobile Native Horizontal Carousel / Grid) --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          {
            label: "Total Managed",
            value: stats.total,
            color: "text-slate-800",
            stroke: "#334155",
            ring: "border-t-slate-400",
          },
          {
            label: "Active Pipelines",
            value: stats.active,
            color: "text-blue-600",
            stroke: "#2563eb",
            ring: "border-t-blue-500",
          },
          {
            label: "Awaiting Manager",
            value: stats.noManager,
            color: "text-purple-600",
            stroke: "#9333ea",
            ring: "border-t-purple-500",
          },
          {
            label: "Archived Assets",
            value: stats.archived,
            color: "text-slate-400",
            stroke: "#94a3b8",
            ring: "border-t-slate-300",
          },
        ].map((s, i) => {
          const percentage =
            stats.total > 0
              ? Math.min(100, Math.round((s.value / stats.total) * 100))
              : 0;

          const radius = 16;
          const circumference = Math.PI * radius;
          const strokeDashoffset =
            circumference - (percentage / 100) * circumference;

          return (
            <div
              key={i}
              className={`p-4 sm:p-5 bg-white/70 backdrop-blur-xl border border-white/80 border-t-4 ${s.ring} rounded-2xl shadow-sm flex items-center justify-between transition-transform active:scale-98`}
            >
              <div>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {s.label}
                </p>
                <p
                  className={`text-xl sm:text-2xl font-black tracking-tight ${s.color} mt-0.5`}
                >
                  {s.value < 10 ? `0${s.value}` : s.value}
                </p>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 mt-0.5 block">
                  {percentage}% of total
                </span>
              </div>

              {/* Half Donut Gauge Chart */}
              <div className="relative w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center overflow-hidden">
                <svg
                  className="w-12 h-12 sm:w-14 sm:h-14 transform -rotate-180"
                  viewBox="0 0 40 40"
                >
                  <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    className="text-slate-200/80"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    strokeDasharray={circumference}
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    stroke={s.stroke}
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 💻 DESKTOP VIEW: STANDARD COMPACT GLASS TABLE (Hidden on Mobile) */}
      {/* ========================================================================= */}
      <div className="hidden md:block bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 backdrop-blur-md border-b border-slate-100/80">
              <tr>
                <th className="pl-6 pr-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-[28%]">
                  Project Context
                </th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center w-[12%]">
                  Status
                </th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-[25%]">
                  Assigned Lead / Owner
                </th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-[15%]">
                  Team
                </th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-[15%]">
                  Created At
                </th>
                <th className="pr-6 pl-4 py-4 w-[5%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {filteredProjects.map((project) => (
                <tr
                  key={project?.id}
                  className="hover:bg-white/80 group transition-all duration-150"
                >
                  <td
                    onClick={() => {
                      setSelectedProjectForSidebar(project);
                      setActiveTab("Overview");
                    }}
                    className="pl-6 pr-4 py-4 hover:cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 shrink-0 bg-gradient-to-br from-white to-slate-50 rounded-xl flex items-center justify-center text-indigo-600 font-black border border-slate-200/60 text-xs shadow-sm">
                        {project?.name
                          ? project.name.charAt(0).toUpperCase()
                          : "P"}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                          {project?.name || "Untitled Project"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-bold tracking-tight truncate">
                            {project?.code || "N/A"}
                          </span>
                          <span className="text-[9px] text-indigo-500 font-extrabold bg-indigo-50/80 px-1.5 py-0.2 rounded-md border border-indigo-100/60 shrink-0">
                            #
                            {project?.name
                              ?.toLowerCase()
                              .replace(/\s+/g, "-")
                              .slice(0, 12) || "proj"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <span
                      className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${
                        project.status === "ACTIVE"
                          ? "bg-emerald-50/80 text-emerald-600 border-emerald-200/80"
                          : "bg-rose-50/80 text-rose-600 border-rose-200/80"
                      }`}
                    >
                      {project.status || "UNKNOWN"}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    {(() => {
                      const manager = project.members?.find(
                        (m) => m.ProjectMember?.project_role === "Manager",
                      );
                      return manager ? (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 shrink-0 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[9px] font-extrabold text-slate-700 shadow-xs">
                            {manager.full_name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-700 truncate">
                              {manager.full_name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                              {manager.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="bg-amber-50/80 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-md border border-amber-200/80 uppercase tracking-wide">
                          Unassigned
                        </span>
                      );
                    })()}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-start">
                      {renderAvatarGroup(
                        project.members?.map((m) => m.id || m),
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-xs font-bold text-slate-400 whitespace-nowrap">
                    {project.createdAt
                      ? new Date(project.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "2-digit", year: "numeric" },
                        )
                      : "—"}
                  </td>

                  <td className="pr-6 pl-4 py-4 text-right relative whitespace-nowrap">
                    <button
                      onClick={() =>
                        setOpenDropdownId(
                          openDropdownId === project.id ? null : project.id,
                        )
                      }
                      className="text-slate-400 hover:text-slate-700 text-base font-black p-1.5 rounded-lg hover:bg-white/80 transition-colors"
                    >
                      ⋮
                    </button>
                    {openDropdownId === project.id && (
                      <div className="absolute right-12 -top-14 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-xl rounded-2xl py-1.5 z-50 w-48 text-left animate-in fade-in zoom-in-95 duration-150">
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            const initialTeam = project.members.map(
                              (member) => ({
                                ...member,
                                role: member.ProjectMember?.project_role,
                              }),
                            );
                            setProjectTeam(initialTeam);
                            setActiveModal("team");
                            setOpenDropdownId(null);
                          }}
                          className="w-full px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                        >
                          Manage Team
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setActiveModal("active");
                            setOpenDropdownId(null);
                          }}
                          className="w-full px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                        >
                          Active Project
                        </button>
                        <hr className="border-slate-100 my-1" />
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setActiveModal("archive");
                            setOpenDropdownId(null);
                          }}
                          className="w-full px-4 py-2.5 text-[11px] font-black text-rose-500 hover:bg-rose-50 flex items-center gap-2"
                        >
                          Archive Project
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📱 MOBILE VIEW: APP-STYLE GLASS NATIVE CARDS (Only on Small Screens) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredProjects.map((project) => (
          <div
            key={project?.id}
            className="bg-white/70 backdrop-blur-xl border border-white/90 p-4 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between active:scale-[0.99] transition-transform"
          >
            {/* Header: Avatar, Name & Dropdown */}
            <div className="flex justify-between items-start gap-2 mb-3">
              <div
                className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1"
                onClick={() => {
                  setSelectedProjectForSidebar(project);
                  setActiveTab("Overview");
                }}
              >
                <div className="w-10 h-10 shrink-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
                  {project?.name ? project.name.charAt(0).toUpperCase() : "P"}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-xs font-black text-slate-800 truncate active:text-blue-600">
                    {project?.name || "Untitled Project"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold tracking-tight mt-0.5 truncate">
                    {project?.project_code || "N/A"} •{" "}
                    <span className="text-indigo-600 font-extrabold">
                      #
                      {project?.name
                        ?.toLowerCase()
                        .replace(/\s+/g, "-")
                        .slice(0, 10)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Menu Trigger */}
              <div className="relative shrink-0">
                <button
                  onClick={() =>
                    setOpenDropdownId(
                      openDropdownId === project.id ? null : project.id,
                    )
                  }
                  className="text-slate-500 font-black px-2.5 py-1 rounded-xl bg-white/80 border border-slate-200/60 text-xs shadow-xs touch-manipulation"
                >
                  ⋮
                </button>
                {openDropdownId === project.id && (
                  <div className="absolute right-0 top-8 bg-white/95 backdrop-blur-xl border border-white/80 shadow-xl rounded-2xl py-1.5 z-50 w-48 text-left animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        const initialTeam = project.members.map((member) => ({
                          ...member,
                          role: member.ProjectMember?.project_role,
                        }));
                        setProjectTeam(initialTeam);
                        setActiveModal("team");
                        setOpenDropdownId(null);
                      }}
                      className="w-full px-4 py-2.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      Manage Cluster Team
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setActiveModal("active");
                        setOpenDropdownId(null);
                      }}
                      className="w-full px-4 py-2.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      Restore Pipeline
                    </button>
                    <hr className="border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setActiveModal("archive");
                        setOpenDropdownId(null);
                      }}
                      className="w-full px-4 py-2.5 text-[11px] font-black text-rose-500 hover:bg-rose-50 flex items-center gap-2"
                    >
                      Archive Workspace
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Pipeline Status */}
            <div className="flex justify-between items-center border-t border-slate-100/80 pt-2.5 mt-1">
              <span className="text-[10px] text-slate-400 font-bold">
                Pipeline Status:
              </span>
              <span
                className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${
                  project.status === "ACTIVE"
                    ? "bg-emerald-50/80 text-emerald-600 border-emerald-200/80"
                    : "bg-rose-50/80 text-rose-600 border-rose-200/80"
                }`}
              >
                {project.status || "UNKNOWN"}
              </span>
            </div>

            {/* Owner Details */}
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-slate-400 font-bold">
                Assigned Owner:
              </span>
              <div>
                {(() => {
                  const manager = project.members?.find(
                    (m) => m.ProjectMember?.project_role === "Manager",
                  );
                  return manager ? (
                    <span className="text-[11px] font-bold text-slate-700 bg-white/90 border border-slate-200/60 px-2 py-0.5 rounded-lg shadow-xs">
                      {manager.full_name}
                    </span>
                  ) : (
                    <span className="bg-amber-50/80 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-md border border-amber-200/80 uppercase tracking-wide">
                      Unassigned
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Team Avatars */}
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-slate-400 font-bold">
                Allocated Cluster:
              </span>
              <div className="flex justify-end">
                {renderAvatarGroup(project.members?.map((m) => m.id || m))}
              </div>
            </div>

            {/* Deployment Date */}
            <div className="flex justify-between items-center mt-2.5 border-t border-slate-100/60 pt-2 text-[10px] font-bold text-slate-400">
              <span>Deployment Date:</span>
              <span className="text-slate-600">
                {project.createdAt
                  ? new Date(project.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* --- MODAL INJECTION BOUNDS (Full Screen Mobile Glass Overlay) --- */}
    {activeModal && (
      <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 transition-all">
        {activeModal === "create" && (
          <CreateProjectModal
            setActiveModal={setActiveModal}
            newProject={newProject}
            handleInputChange={handleInputChange}
            handleCreateSubmit={handleCreateSubmit}
            allUsers={allUsers}
            isLoading={createMutation.isLoading}
          />
        )}

        {activeModal === "team" && (
          <TeamManagementModal
            setActiveModal={setActiveModal}
            selectedProject={selectedProject}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            allUsers={allUsers}
            projectTeam={projectTeam}
            handleAddMember={handleAddMember}
            handleRoleChange={handleRoleChange}
            removeMember={removeMember}
            handleSaveChanges={handleSaveTeam}
            isLoading={teamMutation.isLoading}
          />
        )}

        {activeModal === "archive" && (
          <ArchiveProjectModal
            setActiveModal={setActiveModal}
            selectedProject={selectedProject}
            isLoading={archiveMutation.isLoading}
            onConfirm={() => {
              archiveMutation.mutate(selectedProject.id, {
                onSuccess: () => {
                  setActiveModal(null);
                  setSelectedProjectForSidebar(null);
                  triggerToast("Project Archived!", "success");
                },
              });
            }}
          />
        )}

        {activeModal === "active" && (
          <ActiveProjectModal
            setActiveModal={setActiveModal}
            selectedProject={selectedProject}
            isLoading={activeMutation.isLoading}
            onConfirm={() => {
              activeMutation.mutate(selectedProject.id, {
                onSuccess: () => {
                  setActiveModal(null);
                  setSelectedProjectForSidebar(null);
                  triggerToast("Project Restored!", "success");
                },
              });
            }}
          />
        )}
      </div>
    )}

    {/* --- SIDEBAR WORKSPACE DETAIL OVERVIEW --- */}
    {activeModal !== "archive" &&
      activeModal !== "team" &&
      selectedProjectForSidebar && (
        <ProjectSidebar
          selectedProjectForSidebar={selectedProjectForSidebar}
          setSelectedProjectForSidebar={setSelectedProjectForSidebar}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          allUsers={allUsers}
          setActiveModal={setActiveModal}
          setSelectedProjectId={setSelectedProject?.id}
          setSelectedProject={setSelectedProject}
          projects={projects}
        />
      )}
    </div>
  );
};

export default AdminProjectsView;
