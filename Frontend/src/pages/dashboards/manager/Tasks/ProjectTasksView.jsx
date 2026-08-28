import React, { useEffect, useState } from "react";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Paperclip,
  Send,
  X,
  MessageSquare,
  Layout,
  Table as TableIcon,
  Clock,
  CheckCircle2,
  FolderKanban,
} from "lucide-react";
import KanbanBoard from "./KanbanBoard";
import socket from "../../../../context/SocketContext";
import { useMyProjects, useProjectsData } from "../../../../hooks/useProjects";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { taskService } from "../../../../api/services/taskService";
import toast from "react-hot-toast";
import { triggerToast } from "../../../../utils/toastHelper";
import CreateSprintModal from "./CreateSprintModal";
import API from "../../../../api/axios";

const ProjectTasksView = () => {
  const [selectedSprintId, setSelectedSprintId] = useState("backlog"); // default backlogs layout
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [showSprintDropdown, setShowSprintDropdown] = useState(false);

  const [activeView, setActiveView] = useState("Table View");
  const [showActive, setShowActive] = useState(true);
  const [showBackgroundTasks, setShowBackgroundTasks] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const [projectId, setProjectId] = useState(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const queryClient = useQueryClient();

  const { data: myProjects } = useMyProjects();
  const projects = myProjects?.data || [];

  // 1. Fetch Sprints array dynamically for current selected projectId
  const { data: sprintsResponse } = useQuery({
    queryKey: ["project-sprints", projectId],
    queryFn: async () => {
      // Apne API handler standard endpoints ke mutabiq map karna
      const res = await API.get(`/sprints/project/${projectId}`);
      return res.data.data || [];
    },
    enabled: !!projectId,
  });
  const sprints = sprintsResponse || [];

  console.log("Hello World Hello World:", sprints);

  // 2. Mutation for creating new sprint row structure
  const createSprintMutation = useMutation({
    mutationFn: async (sprintData) => {
      console.log(sprintData);
      // sprintData ke andar ab name, start_date, end_date aur project_id teeno cheezein mojood hain
      return await API.post("/sprints", sprintData);
    },
    onSuccess: (data, variables) => {
      // Jis project ke andar sprint bana hai, usi ka data refresh ho jaye
      queryClient.invalidateQueries(["project-sprints", variables.project_id]);
      setShowSprintModal(false);
      toast.success(
        "New sprint cycle created and linked to project successfully!",
      );
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to initiate sprint");
    },
  });

  const activateSprintMutation = useMutation({
    mutationFn: async ({ sprintId, project_id }) => {
      // Apni API ka base URL check kar lena (e.g., /api/sprints)
      const response = await API.patch(`/sprints/${sprintId}/start`, {
        project_id,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // ⚡ Bohat important: Sprints aur project data ko invalidate karo taake UI automatic update ho
      queryClient.invalidateQueries(["project-sprints", projectId]);
      queryClient.invalidateQueries(["project-details", projectId]); // Taake current_sprint column update ho jaye
      queryClient.invalidateQueries(["kanban-board", projectId]); // Board view ko refresh karne ke liye

      toast.success(data.message || "Sprint activated successfully!");
    },
    onError: (error) => {
      console.error("Sprint activation error:", error);
      toast.error(
        error.response?.data?.message || "Failed to activate sprint.",
      );
    },
  });

  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  const { data, isLoading } = useQuery({
    queryKey: ["board", projectId],
    queryFn: () => taskService.getBoard(projectId),
    enabled: !!projectId,
  });

  const allTasksArray = data?.tasks ? Object.values(data.tasks) : [];

  // Filter logic updates inside ProjectTasksView.jsx
  const filteredTasksBySprint = allTasksArray.filter((task) => {
    if (selectedSprintId === "backlog") {
      // Master backlog contains issues that are either in 'backlog' status OR not tied to any sprint yet
      return task.status === "backlog" || !task.sprint_id;
    }
    // If a sprint is explicitly targeted, show tasks coupled with that sprint ID exclusively
    return task.sprint_id === Number(selectedSprintId);
  });

  // Segment categorization arrays parameters ko rewrite karo filtered output se map karne k liye:
  const activeTasks = filteredTasksBySprint.filter(
    (task) =>
      task.status !== "done" &&
      task.status !== "backlog" &&
      task.type !== "epic",
  );
  const backlogTasks = filteredTasksBySprint.filter(
    (task) => task.status === "backlog" && task.type !== "epic",
  );
  const completedTasks = filteredTasksBySprint.filter(
    (task) => task.status === "done" && task.type !== "epic",
  );

  // const activeTasks = allTasksArray.filter(
  //   (task) =>
  //     task.status !== "done" &&
  //     task.status !== "backlog" &&
  //     task.type !== "epic",
  // );
  // const backlogTasks = allTasksArray.filter(
  //   (task) => task.status === "backlog" && task.type !== "epic",
  // );
  // const completedTasks = allTasksArray.filter(
  //   (task) => task.status === "done" && task.type !== "epic",
  // );

  console.log(activeTasks, backlogTasks, completedTasks);

  const { data: databaseComments = [], isLoading: isLoadingComments } =
    useQuery({
      queryKey: ["taskComments", selectedTask?.id],
      queryFn: () => taskService.getComments(selectedTask.id),
      enabled: !!selectedTask?.id,
    });

  const postCommentMutation = useMutation({
    mutationFn: (commentText) =>
      taskService.postComment(selectedTask.id, commentText),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["taskComments", selectedTask?.id],
      });
    },
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || postCommentMutation.isPending) return;
    postCommentMutation.mutate(inputText.trim());
    setInputText("");
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-800">
      {/* HEADER SECTION */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-100 p-1.5 rounded-md border border-slate-200">
            <button
              onClick={() => setActiveView("Table View")}
              className={`px-6 py-2 rounded-md text-xs font-black flex items-center gap-2 transition-all ${activeView === "Table View" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <TableIcon size={16} /> Table View
            </button>
            <button
              onClick={() => setActiveView("Kanban")}
              className={`px-6 py-2 rounded-md text-xs font-black flex items-center gap-2 transition-all ${activeView === "Kanban" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Layout size={16} /> Kanban Board
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-12 flex gap-6 items-center">
            <div className="relative">
              <button
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-md px-4 py-2.5 shadow-sm text-slate-700 hover:bg-slate-50 transition-colors z-50 relative"
              >
                <FolderKanban size={18} className="text-blue-600" />
                <span className="font-bold text-sm">
                  {projects?.find((p) => p.id === projectId)?.name ||
                    "Select Project"}
                </span>
                <ChevronDown size={14} className="text-slate-400 ml-1" />
              </button>

              {showProjectDropdown && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-100 rounded-md shadow-xl z-[200] py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {projects.length > 0 ? "Switch Project" : ""}
                  </div>
                  {projects.length > 0 ? (
                    projects?.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          setProjectId(project.id);
                          setShowProjectDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center justify-between transition-colors ${project.id === projectId ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-50"}`}
                      >
                        {project.name}
                        {project.id === projectId && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="text-[12px] font-black text-slate-400 flex justify-center items-center">
                      No Project Assigned
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSprintDropdown(!showSprintDropdown)}
                className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-md px-4 py-2.5 shadow-sm text-slate-700 hover:bg-slate-50 transition-colors z-50 relative"
              >
                <Clock size={16} className="text-indigo-600" />
                <span className="font-bold text-sm">
                  {selectedSprintId === "backlog"
                    ? "Global Backlog Pool"
                    : sprints.find((s) => s.id === Number(selectedSprintId))
                        ?.name || "Select Sprint Focus"}
                </span>
                <ChevronDown size={14} className="text-slate-400 ml-1" />
              </button>

              {showSprintDropdown && (
                <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-100 rounded-md shadow-xl z-[200] py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => {
                      setSelectedSprintId("backlog");
                      setShowSprintDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-black uppercase flex items-center justify-between border-b border-slate-50 ${selectedSprintId === "backlog" ? "text-indigo-600 bg-indigo-50/50" : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    Master Project Backlog
                  </button>

                  <hr className="text-slate-300" />

                  <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">
                    Sprints Framework
                  </div>

                  {/* ⚡ SCROLLABLE CONTAINER WITH TIMELINE DATES */}
                  <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                    {sprints.map((sprint) => {
                      // Safely formatting dates into "MMM DD" format (e.g., Jun 25)
                      const sDate = sprint.start_date
                        ? new Date(sprint.start_date).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })
                        : "TBD";
                      const eDate = sprint.end_date
                        ? new Date(sprint.end_date).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })
                        : "TBD";

                      return (
                        <div
                          key={sprint.id}
                          className={`w-full px-6 py-2.5 flex items-center justify-between group/row transition-colors border-b border-slate-50/30 ${
                            Number(selectedSprintId) === sprint.id
                              ? "bg-indigo-50/70"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          {/* Clickable Area */}
                          <button
                            onClick={() => {
                              setSelectedSprintId(sprint.id);
                              setShowSprintDropdown(false);
                            }}
                            className={`text-left text-[12px] font-semibold flex-1 ${
                              Number(selectedSprintId) === sprint.id
                                ? "text-indigo-600 font-bold"
                                : "text-slate-600"
                            }`}
                          >
                            <div className="flex flex-col gap-0.5">
                              <span>{sprint.name}</span>

                              {/* 🗓️ SPRINT TIMELINE RANGE AND STATUS ROW */}
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                                <span className="text-slate-500 bg-slate-100 px-1 rounded text-[9px]">
                                  {sDate} — {eDate}
                                </span>
                                <span>•</span>
                                <span className="capitalize">
                                  {sprint.status}
                                </span>
                              </div>
                            </div>
                          </button>

                          {/* Right Action Badge Section */}
                          <div className="flex items-center shrink-0 ml-2">
                            {sprint.status === "active" ? (
                              <span className="text-[8px] bg-emerald-50 text-emerald-600 font-black px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wide shadow-sm">
                                Active
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Dropdown ko band hone se rokne ke liye ya extra clicks manage karne ke liye

                                  // Trigger mutation
                                  activateSprintMutation.mutate({
                                    sprintId: sprint.id,
                                    project_id: projectId, // Yeh projectId aapki screen context se aayegi
                                  });
                                }}
                                disabled={activateSprintMutation.isPending}
                                className="hidden group-hover/row:block text-[9px] bg-indigo-600 text-white font-black px-2 py-1 rounded shadow-sm hover:bg-indigo-700 transition-all uppercase tracking-wider disabled:opacity-50"
                              >
                                {activateSprintMutation.isPending
                                  ? "Starting..."
                                  : "Start"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <hr className="text-slate-300" />

                  <button
                    onClick={() => {
                      setShowSprintModal(true);
                      setShowSprintDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 mt-2 text-xs font-black text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 border-t border-slate-50"
                  >
                    Create New Sprint Cycle
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* VIEW CONTROLLER CONTENT */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Loading project tasks...
              </p>
            </div>
          ) : activeView === "Table View" ? (
            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 font-black text-slate-400 text-xs uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Task</th>
                    <th className="px-6 py-5">Priority</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-8 py-5">Assignees</th>
                  </tr>
                </thead>

                <tbody>
                  {/* --- ACTIVE TASKS SECTION --- */}
                  <tr
                    className="cursor-pointer hover:bg-blue-50/30 transition-colors"
                    onClick={() => setShowBackgroundTasks(!showBackgroundTasks)}
                  >
                    <td
                      colSpan="4"
                      className="px-8 py-5 bg-slate-50/50 border-y border-slate-100 font-black text-sm uppercase text-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1 rounded-lg bg-white border border-slate-200 shadow-sm">
                          {showBackgroundTasks ? (
                            <ChevronDown size={18} className="text-blue-600" />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </div>
                        Backlogs ({backlogTasks.length})
                      </div>
                    </td>
                  </tr>

                  {showBackgroundTasks &&
                    backlogTasks.map((task) => (
                      <tr
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={`border-b border-slate-50 hover:bg-blue-50/40 cursor-pointer group transition-all ${selectedTask?.id === task.id ? "bg-blue-50" : ""}`}
                      >
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1.5">
                            {/* Dynamic Parent Epic Tag Integration 🔥 */}
                            {task.ParentTask && (
                              <div className="flex">
                                <span
                                  className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md"
                                  style={{
                                    backgroundColor: `${task.ParentTask.color_code}15`,
                                    color: task.ParentTask.color_code,
                                  }}
                                >
                                  {task.ParentTask.title}
                                </span>
                              </div>
                            )}
                            <span className="text-[15px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                              {task.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <PriorityBadge level={task.priority} />
                        </td>
                        <td className="px-6 py-6 text-xs font-black text-blue-500 uppercase">
                          {task.status}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center -space-x-2 overflow-hidden">
                            {task.assignees && task.assignees.length > 0 ? (
                              task.assignees.map((user) => (
                                <div className="rounded-full border border-blue-100 bg-blue-600 w-8 h-8 flex items-center justify-center text-white font-black text-xs shadow-sm uppercase overflow-hidden">
                                  {user?.avatar_url ? (
                                    <img
                                      src={
                                        user?.avatar_url
                                      }
                                      alt="Avatar"
                                      crossOrigin="anonymous"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : user.full_name ? (
                                    user.full_name[0]
                                  ) : (
                                    "U"
                                  )}
                                </div>
                              ))
                            ) : (
                              <span className="text-xs font-bold text-slate-300">
                                Unassigned
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                  <tr
                    className="cursor-pointer hover:bg-blue-50/30 transition-colors"
                    onClick={() => setShowActive(!showActive)}
                  >
                    <td
                      colSpan="4"
                      className="px-8 py-5 bg-slate-50/50 border-y border-slate-100 font-black text-sm uppercase text-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1 rounded-lg bg-white border border-slate-200 shadow-sm">
                          {showActive ? (
                            <ChevronDown size={18} className="text-blue-600" />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </div>
                        Active Tasks ({activeTasks.length})
                      </div>
                    </td>
                  </tr>

                  {showActive &&
                    activeTasks.map((task) => (
                      <tr
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={`border-b border-slate-50 hover:bg-blue-50/40 cursor-pointer group transition-all ${selectedTask?.id === task.id ? "bg-blue-50" : ""}`}
                      >
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1.5">
                            {/* Dynamic Parent Epic Tag Integration 🔥 */}
                            {task.ParentTask && (
                              <div className="flex">
                                <span
                                  className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md"
                                  style={{
                                    backgroundColor: `${task.ParentTask.color_code}15`,
                                    color: task.ParentTask.color_code,
                                  }}
                                >
                                  {task.ParentTask.title}
                                </span>
                              </div>
                            )}
                            <span className="text-[15px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                              {task.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <PriorityBadge level={task.priority} />
                        </td>
                        <td className="px-6 py-6 text-xs font-black text-blue-500 uppercase">
                          {task.status}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center -space-x-2 overflow-hidden">
                            {task.assignees && task.assignees.length > 0 ? (
                              task.assignees.map((user) => (
                                <div className="rounded-full border border-blue-100 bg-blue-600 w-8 h-8 flex items-center justify-center text-white font-black text-xs shadow-sm uppercase overflow-hidden">
                                  {user?.avatar_url ? (
                                    <img
                                      src={
                                        user?.avatar_url
                                      }
                                      alt="Avatar"
                                      crossOrigin="anonymous"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : user.full_name ? (
                                    user.full_name[0]
                                  ) : (
                                    "U"
                                  )}
                                </div>
                              ))
                            ) : (
                              <span className="text-xs font-bold text-slate-300">
                                Unassigned
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                  {/* --- COMPLETED TASKS SECTION --- */}
                  <tr
                    className="cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => setShowCompleted(!showCompleted)}
                  >
                    <td
                      colSpan="4"
                      className="px-8 py-5 bg-slate-50/50 border-y border-slate-100 font-black text-sm uppercase text-slate-400"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1 rounded-lg bg-white border border-slate-200 shadow-sm">
                          {showCompleted ? (
                            <ChevronDown size={18} />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </div>
                        Completed Tasks ({completedTasks.length})
                      </div>
                    </td>
                  </tr>

                  {showCompleted &&
                    completedTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="border-b border-slate-50 opacity-60 italic bg-slate-50/20"
                      >
                        <td className="px-8 py-6 text-[15px] font-bold text-slate-400 line-through">
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              size={16}
                              className="text-green-500 shrink-0"
                            />
                            {task.title}
                          </div>
                        </td>
                        <td className="px-6 py-6 opacity-50">
                          <PriorityBadge level={task.priority} />
                        </td>
                        <td className="px-6 py-6 text-xs font-black text-green-500 uppercase">
                          Done
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center -space-x-2 overflow-hidden grayscale">
                            {task.assignees?.map((user) => (
                              <div className="rounded-full border border-blue-100 bg-blue-600 w-8 h-8 flex items-center justify-center text-white font-black text-xs shadow-sm uppercase overflow-hidden">
                                {user?.avatar_url ? (
                                  <img
                                    src={
                                      user?.avatar_url
                                    }
                                    alt="Avatar"
                                    crossOrigin="anonymous"
                                    className="w-full h-full object-cover"
                                  />
                                ) : user.full_name ? (
                                  user.full_name[0]
                                ) : (
                                  "U"
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <KanbanBoard
              showProjectDropdown={showProjectDropdown}
              projects={projects}
              projectId={projectId}
              selectedSprintId={selectedSprintId}
            />
          )}
        </div>

        {showSprintModal && (
          <CreateSprintModal
            onClose={() => setShowSprintModal(false)}
            onCreate={(sprintData) => createSprintMutation.mutate(sprintData)}
            initialProjectId={projectId}
          />
        )}

        {/* DISCUSSION PANEL */}
        {/* DISCUSSION SIDE PANEL */}
        {selectedTask && (
          <aside className="w-[450px] flex flex-col bg-white border-l border-slate-200 shadow-2xl animate-in slide-in-from-right duration-300 z-40">
            {/* 1. HEADER SECTION (Hamesha dikhega taake Close button aur title toggle/work karein) */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-md text-blue-600">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                    Discussion
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 truncate w-48">
                    {selectedTask.title}
                  </p>
                </div>
              </div>
              {/* Task Close Button - Jo setSelectedTask(null) ko call karega */}
              <button
                onClick={() => setSelectedTask(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* 2. COMMENTS MIDDLE BODY (Table View check ke sath) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
              {/* System Welcome Message */}
              <div className="bg-white border border-slate-100 p-4 rounded-md shadow-sm max-w-[90%]">
                <p className="text-[10px] font-black text-blue-600 uppercase mb-1">
                  {selectedTask.assignees?.[0]?.full_name || "System"}
                </p>
                <p className="text-sm font-bold text-slate-700">
                  Checking the latest updates on this task...
                </p>
              </div>

              {isLoadingComments && (
                <div className="text-center text-xs font-bold text-slate-400 py-2 animate-pulse">
                  Loading discussion...
                </div>
              )}

              {/* Dynamic Comments Render */}
              {databaseComments?.map((comment) => {
                const isMe =
                  comment.isMe || comment.User?.full_name === "Yasir Saleem";

                return (
                  <div
                    key={comment.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-md text-sm font-bold shadow-sm flex flex-col gap-1 ${
                        isMe
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                      }`}
                    >
                      {!isMe && (
                        <span className="text-[9px] font-black uppercase text-blue-500 block mb-0.5">
                          {comment.User?.full_name || "Team Member"}
                        </span>
                      )}

                      {/* Backend key structure mapping 'content' */}
                      <p className="leading-relaxed font-semibold">
                        {comment.content || comment.content}
                      </p>

                      <span
                        className={`text-[9px] block text-right mt-1 ${isMe ? "text-blue-200" : "text-slate-400"}`}
                      >
                        {comment.createdAt
                          ? new Date(comment.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Just now"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. INPUT FOOTER PANEL (Hamesha form interactive rahega submission ke liye) */}
            <form
              onSubmit={handleSendMessage}
              className="p-6 border-t border-slate-100 flex gap-2 bg-white shrink-0"
            >
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-100 px-4 py-3 rounded-md text-sm font-bold outline-none border border-transparent focus:border-blue-200 text-slate-700"
                placeholder="Type a message..."
                disabled={postCommentMutation?.isPending}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || postCommentMutation?.isPending}
                className="bg-blue-600 text-white p-3 rounded-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                <Send size={20} />
              </button>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
};

const PriorityBadge = ({ level }) => {
  const color =
    level?.toLowerCase() === "high"
      ? "bg-red-50 text-red-600 border-red-100"
      : level?.toLowerCase() === "medium"
        ? "bg-orange-50 text-orange-600 border-orange-100"
        : "bg-slate-50 text-slate-600 border-slate-100";
  return (
    <span
      className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border ${color}`}
    >
      {level || "Low"}
    </span>
  );
};

export default ProjectTasksView;
