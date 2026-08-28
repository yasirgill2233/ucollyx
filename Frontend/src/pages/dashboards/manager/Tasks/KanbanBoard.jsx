// import React, { useState } from "react";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
// import {
//   ChevronDown,
//   MessageSquare,
//   Video,
//   MoreVertical,
//   Bug,
//   BookText,
//   ClipboardList,
//   Link2,
//   Unlink,
//   Plus,
//   X,
//   Zap,
//   CheckSquare,
//   Calendar,
//   Send,
//   CheckCircle2,
//   FolderKanban,
// } from "lucide-react";
// import TaskModal from "./TaskModal";
// import LinkEpicModal from "./LinkEpicModal";
// import ChatModal from "../../../dashboards/developer/board/ChatModal";
// import MeetingModal from "../../../dashboards/developer/board/MeetingModal";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { taskService } from "../../../../api/services/taskService";

// const KanbanBoard = ({
//   projectId,
//   selectedSprintId,
// }) => {
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [openMenuId, setOpenMenuId] = useState(null);
//   const [linkingTaskId, setLinkingTaskId] = useState(null);

//   const [activeChatTask, setActiveChatTask] = useState(null);
//   const [activeMeetingTask, setActiveMeetingTask] = useState(null);

//   const queryClient = useQueryClient();
//   const [isCreating, setIsCreating] = useState(false);
//   const [newTaskTitle, setNewTaskTitle] = useState("");
//   const [selectedType, setSelectedType] = useState("task");

//   const { data, isLoading } = useQuery({
//     queryKey: ["board", projectId],
//     queryFn: () => taskService.getBoard(projectId),
//     enabled: !!projectId,
//   });

//   // Custom computed filter map array block to parse columns mapping safely
//   const filteredColumnTaskIds = (columnId) => {
//     if (!data || !data.columns || !data.columns[columnId]) return [];

//     return data.columns[columnId].taskIds.filter((taskId) => {
//       const currentTask = data.tasks[taskId];
//       if (!currentTask) return false;

//       if (selectedSprintId === "backlog") {
//         return currentTask.status === "backlog" || !currentTask.sprint_id;
//       }
//       return currentTask.sprint_id === Number(selectedSprintId);
//     });
//   };

//   console.log(
//     "HELLO HELLO HELLO #####################################################3",
//     data,
//   );
//   const dragMutation = useMutation({
//     mutationFn: (vars) =>
//       console.log(vars) || taskService.updateTaskPosition(vars.id, vars.data),
//     onMutate: async (newVars) => {
//       await queryClient.cancelQueries(["board", projectId]);
//       const previousData = queryClient.getQueryData(["board", projectId]);

//       queryClient.setQueryData(["board", projectId], (old) => {
//         const updatedTasks = { ...old.tasks };
//         const updatedColumns = { ...old.columns };

//         const task = updatedTasks[newVars.id];
//         const sourceColId = Object.keys(updatedColumns).find((id) =>
//           updatedColumns[id].taskIds.includes(newVars.id),
//         );

//         updatedColumns[sourceColId].taskIds = updatedColumns[
//           sourceColId
//         ].taskIds.filter((id) => id !== newVars.id);
//         updatedColumns[newVars.data.status].taskIds.splice(
//           newVars.data.position,
//           0,
//           newVars.id,
//         );
//         task.status = newVars.data.status;

//         return { ...old, tasks: updatedTasks, columns: updatedColumns };
//       });

//       return { previousData };
//     },
//     onError: (err, newVars, context) => {
//       queryClient.setQueryData(["board", projectId], context.previousData);
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries(["board", projectId]);
//     },
//     onSuccess: () => queryClient.invalidateQueries(["board", projectId]),
//   });

//   const createMutation = useMutation({
//     mutationFn: (newTask) => taskService.createTask(newTask),
//     onSuccess: () => {
//       queryClient.invalidateQueries(["board", projectId]);
//       setIsCreating(false);
//       setNewTaskTitle("");
//     },
//   });

//   const onDragEnd = (result) => {
//     const { destination, source, draggableId } = result;
//     if (!destination) return;
//     if (
//       destination.droppableId === source.droppableId &&
//       destination.index === source.index
//     )
//       return;

//     dragMutation.mutate({
//       id: draggableId,
//       data: {
//         status: destination.droppableId,
//         position: destination.index,
//         project_id: Number(projectId),
//       },
//     });
//   };

//   const handleQuickCreate = () => {
//     if (!newTaskTitle.trim()) return;

//     // Dynamic payload setup based on active view state
//     const taskPayload = {
//       project_id: projectId,
//       title: selectedType === "story" ? `Story: ${newTaskTitle}` : newTaskTitle,
//       type: selectedType,
//       status: "backlog", // Default column state inside sprint layout
//       priority: "Low",
//     };

    
//     // Agar global pool / generic backlog select nahi hai, toh sprint_id attachment apply karo
//     if (selectedSprintId && selectedSprintId !== "backlog") {
//       taskPayload.sprint_id = Number(selectedSprintId);
//     }
    
//     createMutation.mutate(taskPayload);
//   };
//   console.log("Selected Spring:::",selectedSprintId)

//   const [showTypeDropdown, setShowTypeDropdown] = useState(false);

//   const mutation = useMutation({
//     mutationFn: (vars) => taskService.updateTaskPosition(vars.id, vars.data),
//     onSuccess: () => queryClient.invalidateQueries(["board", projectId]),
//   });

//   const updateTaskMutation = useMutation({
//     mutationFn: ({ taskId, updatedFields }) =>
//       taskService.updateTask(taskId, updatedFields),

//     onMutate: async ({ taskId, updatedFields }) => {
//       await queryClient.cancelQueries({ queryKey: ["board", projectId] });
//       const previousBoardData = queryClient.getQueryData(["board", projectId]);
//       if (previousBoardData) {
//         queryClient.setQueryData(["board", projectId], {
//           ...previousBoardData,
//           tasks: {
//             ...previousBoardData.tasks,
//             [taskId]: {
//               ...previousBoardData.tasks[taskId],
//               ...updatedFields,
//             },
//           },
//         });
//       }
//       return { previousBoardData };
//     },
//     onError: (err, variables, context) => {
//       if (context?.previousBoardData) {
//         queryClient.setQueryData(
//           ["board", projectId],
//           context.previousBoardData,
//         );
//       }
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: ["board", projectId] });
//     },
//   });

//   const handleUpdateTask = (updatedTask) => {
//     updateTaskMutation.mutate({
//       taskId: updatedTask.id,
//       updatedFields: {
//         title: updatedTask.title,
//         description: updatedTask.description,
//         status: updatedTask.status,
//         priority: updatedTask.priority,
//         due_time: updatedTask.due_time,
//         project_id: updatedTask.project_id,
//         sprint_id: updatedTask.sprint_id,
//       },
//     });
//   };

//   const { data: projectEpics = [] } = useQuery({
//     queryKey: ["projectEpics", projectId],
//     queryFn: () => taskService.getProjectEpics(projectId),
//     enabled: !!projectId,
//   });

//   const updateEpicMutation = useMutation({
//     mutationFn: ({ taskId, epicId }) =>
//       taskService.updateTaskEpic(taskId, epicId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["board", projectId] });
//       setLinkingTaskId(null);
//     },
//   });

//   const handleLinkEpic = (taskId, epicId) => {
//     updateEpicMutation.mutate({ taskId, epicId });
//   };

//   const handleRemoveEpic = (taskId) => {
//     updateEpicMutation.mutate({ taskId, epicId: null });
//   };
//   if (isLoading) return <div>Loading Board...</div>;

//   return (
//     <div className=" bg-[#F8FAFC] min-h-screen font-sans">
//       <DragDropContext onDragEnd={onDragEnd}>
//         <div className="flex gap-4 overflow-x-auto px-2 pb-10 h-[calc(100vh-64px)]">
//           {data?.columns &&
//             Object.values(data.columns).map((column) => (
//               <div
//                 key={column.id}
//                 className="bg-slate-100/50 rounded-lg p-4 flex flex-col w-[20%] h-full border border-slate-200/50"
//               >
//                 <div className="flex justify-between items-center mb-5 px-2">
//                   <div className="flex items-center gap-2">
//                     <div
//                       className={`w-2 h-2 rounded-full ${column.id === "backlog" ? "bg-slate-400" : "bg-blue-400"}`}
//                     />
//                     <h3 className="font-black text-slate-700 text-sm uppercase tracking-tight">
//                       {column.title}
//                     </h3>
//                   </div>
//                   <span className="bg-white border border-slate-200 text-slate-500 text-[11px] font-black px-3 py-1 rounded-full shadow-sm">
//                     {filteredColumnTaskIds(column.id).length}
//                   </span>
//                 </div>

//                 <Droppable droppableId={column.id}>
//                   {(provided) => (
//                     <div
//                       {...provided.droppableProps}
//                       ref={provided.innerRef}
//                       className="space-y-4 flex-1 overflow-y-auto pr-1 min-h-[50px]"
//                     >
//                       {filteredColumnTaskIds(column.id).map((taskId, index) => (
//                         <DraggableCard
//                           key={taskId}
//                           task={data.tasks[taskId]}
//                           index={index}
//                           isMenuOpen={openMenuId === taskId}
//                           setOpenMenuId={setOpenMenuId}
//                           onOpenEpicLink={(id) => setLinkingTaskId(id)}
//                           onRemoveEpic={(id) => handleRemoveEpic(id)}
//                           onClick={() => setSelectedTask(data.tasks[taskId])}
//                           onChat={() => setActiveChatTask(data.tasks[taskId])}
//                           onMeeting={() =>
//                             setActiveMeetingTask(data.tasks[taskId])
//                           }
//                         />
//                       ))}
//                       {provided.placeholder}
//                       {column.id === "backlog" &&
//                         (isCreating ? (
//                           <div className="bg-white p-4 rounded-2xl border-2 border-blue-400 shadow-lg animate-in fade-in zoom-in-95">
//                             <textarea
//                               autoFocus
//                               className="w-full text-sm font-bold text-slate-700 outline-none resize-none placeholder-slate-300 mb-2"
//                               value={newTaskTitle}
//                               onChange={(e) => setNewTaskTitle(e.target.value)}
//                               onKeyDown={(e) =>
//                                 e.key === "Enter" &&
//                                 (e.preventDefault(), handleQuickCreate())
//                               }
//                             />
//                             <div className="flex justify-between items-center pt-2 border-t border-slate-50">
//                               <div className="relative">
//                                 <button
//                                   onClick={() =>
//                                     setShowTypeDropdown(!showTypeDropdown)
//                                   }
//                                   className="flex items-center gap-1.5 p-1.5 hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors"
//                                 >
//                                   <TypeIcon type={selectedType} size={14} />{" "}
//                                   <ChevronDown
//                                     size={12}
//                                     className="text-slate-400"
//                                   />
//                                 </button>
//                                 {showTypeDropdown && (
//                                   <div className="absolute left-12 -bottom-4 mb-2 w-28 bg-white border border-slate-100 rounded-lg shadow-xl z-[110]">
//                                     {["task", "bug", "story", "epic"].map(
//                                       (t) => (
//                                         <button
//                                           key={t}
//                                           onClick={() => {
//                                             setSelectedType(t);
//                                             setShowTypeDropdown(false);
//                                           }}
//                                           className="w-full px-2 py-1.5 text-left text-[10px] font-black uppercase hover:bg-slate-50 flex items-center gap-2 text-slate-600"
//                                         >
//                                           <TypeIcon type={t} size={14} /> {t}
//                                         </button>
//                                       ),
//                                     )}
//                                   </div>
//                                 )}
//                               </div>
//                               <div className="flex gap-2">
//                                 <button onClick={() => setIsCreating(false)}>
//                                   <X size={16} className="text-slate-400" />
//                                 </button>
//                                 <button
//                                   onClick={handleQuickCreate}
//                                   className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm"
//                                 >
//                                   Add
//                                 </button>
//                               </div>
//                             </div>
//                           </div>
//                         ) : (
//                           <button
//                             onClick={() => setIsCreating(true)}
//                             className="w-full flex items-center gap-2 px-3 py-3 text-slate-400 hover:text-blue-600 font-bold text-sm transition-colors"
//                           >
//                             <Plus size={18} /> Create
//                           </button>
//                         ))}
//                     </div>
//                   )}
//                 </Droppable>
//               </div>
//             ))}
//         </div>
//       </DragDropContext>

//       {/* RENDER MODALS */}
//       {linkingTaskId && (
//         <LinkEpicModal
//           epics={projectEpics}
//           onSelect={(epicId) => {
//             (handleLinkEpic(linkingTaskId, epicId), setSelectedTask(null));
//           }}
//           onClose={() => setLinkingTaskId(null)}
//           isPending={updateEpicMutation.isPending}
//         />
//       )}
//       {selectedTask && (
//         <TaskModal
//           task={selectedTask}
//           onClose={() => setSelectedTask(null)}
//           onUpdateTask={handleUpdateTask}
//           projectId={projectId}
//           selectedSprintId={selectedSprintId !== "backlog" ? selectedSprintId : null}
//           onOpenLinkEpic={() => setLinkingTaskId(selectedTask.id)}
//         />
//       )}
//       {activeChatTask && (
//         <ChatModal
//           task={activeChatTask}
//           onClose={() => setActiveChatTask(null)}
//         />
//       )}
//       {activeMeetingTask && (
//         <MeetingModal
//           task={activeMeetingTask}
//           onClose={() => setActiveMeetingTask(null)}
//         />
//       )}
//     </div>
//   );
// };

// const TypeIcon = ({ type, size }) => {
//   if (type === "bug") return <Bug size={size} className="text-red-500" />;
//   if (type === "story")
//     return <BookText size={size} className="text-green-600" />;
//   if (type === "epic") return <Zap size={size} className="text-purple-600" />;
//   return <CheckSquare size={size} className="text-blue-500" />;
// };

// const DraggableCard = ({
//   task,
//   index,
//   onClick,
//   isMenuOpen,
//   setOpenMenuId,
//   onOpenEpicLink,
//   onRemoveEpic,
//   onChat,
//   onMeeting,
// }) => {
//   const isBacklog =
//     task.status === "backlog" &&
//     (!task.assignees || task.assignees.length === 0);

//   return (
//     <Draggable draggableId={task.id} index={index}>
//       {(provided, snapshot) => (
//         <div
//           ref={provided.innerRef}
//           {...provided.draggableProps}
//           {...provided.dragHandleProps}
//           onClick={onClick}
//           className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer relative group ${snapshot.isDragging ? "border-blue-500 shadow-2xl z-50" : "border-slate-100 shadow-sm hover:border-blue-300"}`}
//         >
//           <div className="flex justify-between items-start mb-3">
//             <span className="text-[10px] font-black text-slate-300 group-hover:text-blue-400 uppercase tracking-widest">
//               {task.id}
//             </span>
//             <div
//               className="flex items-center gap-2 relative"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <TypeIcon type={task.type} size={14} />
//               {task.type === "story" && (
//                 <div className="relative">
//                   <button
//                     onClick={() => setOpenMenuId(isMenuOpen ? null : task.id)}
//                     className="p-1 hover:bg-slate-50 rounded-md text-slate-300"
//                   >
//                     <MoreVertical size={14} />
//                   </button>
//                   {isMenuOpen && (
//                     <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-[150] py-2">
//                       <button
//                         onClick={() => {
//                           onOpenEpicLink(task.id);
//                           setOpenMenuId(null);
//                         }}
//                         className="w-full text-left px-4 py-2 text-[10px] font-black text-slate-600 hover:bg-blue-50 flex items-center gap-2 uppercase"
//                       >
//                         <Link2 size={12} /> Link Epic
//                       </button>
//                       {task.ParentTask && (
//                         <button
//                           onClick={() => {
//                             onRemoveEpic(task.id);
//                             setOpenMenuId(null);
//                           }}
//                           className="w-full text-left px-4 py-2 text-[10px] font-black text-red-500 hover:bg-red-50 flex items-center gap-2 uppercase"
//                         >
//                           <Unlink size={12} /> Remove Epic
//                         </button>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//           <p className="text-sm font-bold text-slate-800 leading-snug mb-2">
//             {task.title}
//           </p>
//           {!isBacklog && (
//             <div className="mt-3">
//               {task?.ParentTask && (
//                 <div className="mb-3">
//                   <span className="bg-pink-50 text-pink-600 text-[9px] font-black px-2 py-1 rounded-md border border-pink-100 uppercase tracking-tighter">
//                     EPIC: {task.ParentTask?.title}
//                   </span>
//                 </div>
//               )}
//               <div className="flex items-center gap-2 mb-4">
//                 <div
//                   className={`w-1.5 h-1.5 rounded-full ${task.priority === "High" ? "bg-orange-500" : "bg-blue-500"}`}
//                 />
//                 <span className="text-[10px] font-black text-slate-400 uppercase">
//                   Priority: {task.priority}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center pt-3 border-t border-slate-50">
//                 <div className="flex -space-x-2 justify-center items-center">
//                   {(task.assignees || []).map((user) => (
//                     <div className="w-7 h-7 rounded-full border border-blue-100 bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm uppercase overflow-hidden">
//                       {user?.avatar_url ? (
//                         <img
//                           src={
//                             user?.avatar_url
//                           }
//                           alt="Avatar"
//                           crossOrigin="anonymous"
//                           className="w-full h-full object-cover"
//                         />
//                       ) : user.full_name ? (
//                         user.full_name[0]
//                       ) : (
//                         "U"
//                       )}
//                     </div>
//                   ))}
//                 </div>

//                 {/* ICON BUTTONS WITH EVENT PROTECTION */}
//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onChat();
//                     }}
//                     className="text-slate-300 hover:text-blue-500 transition-colors p-1"
//                   >
//                     <MessageSquare size={14} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </Draggable>
//   );
// };

// export default KanbanBoard;



import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  ChevronDown,
  ChevronRight,
  MessageSquare,
  MoreVertical,
  Bug,
  BookText,
  Link2,
  Unlink,
  Plus,
  X,
  Zap,
  CheckSquare,
} from "lucide-react";
import TaskModal from "./TaskModal";
import LinkEpicModal from "./LinkEpicModal";
import ChatModal from "../../../dashboards/developer/board/ChatModal";
import MeetingModal from "../../../dashboards/developer/board/MeetingModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../../../../api/services/taskService";

const KanbanBoard = ({ projectId, selectedSprintId }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [linkingTaskId, setLinkingTaskId] = useState(null);

  const [activeChatTask, setActiveChatTask] = useState(null);
  const [activeMeetingTask, setActiveMeetingTask] = useState(null);

  // 📱 Mobile Accordion States (< sm screens only)
  const [openColumnsMobile, setOpenColumnsMobile] = useState({
    backlog: true,
    todo: true,
    in_progress: true,
    done: true,
  });

  const toggleMobileColumn = (colId) => {
    setOpenColumnsMobile((prev) => ({ ...prev, [colId]: !prev[colId] }));
  };

  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedType, setSelectedType] = useState("task");

  const { data, isLoading } = useQuery({
    queryKey: ["board", projectId],
    queryFn: () => taskService.getBoard(projectId),
    enabled: !!projectId,
  });

  const filteredColumnTaskIds = (columnId) => {
    if (!data || !data.columns || !data.columns[columnId]) return [];

    return data.columns[columnId].taskIds.filter((taskId) => {
      const currentTask = data.tasks[taskId];
      if (!currentTask) return false;

      if (selectedSprintId === "backlog") {
        return currentTask.status === "backlog" || !currentTask.sprint_id;
      }
      return currentTask.sprint_id === Number(selectedSprintId);
    });
  };

  const dragMutation = useMutation({
    mutationFn: (vars) => taskService.updateTaskPosition(vars.id, vars.data),
    onMutate: async (newVars) => {
      await queryClient.cancelQueries(["board", projectId]);
      const previousData = queryClient.getQueryData(["board", projectId]);

      queryClient.setQueryData(["board", projectId], (old) => {
        if (!old) return old;
        const updatedTasks = { ...old.tasks };
        const updatedColumns = { ...old.columns };

        const task = updatedTasks[newVars.id];
        const sourceColId = Object.keys(updatedColumns).find((id) =>
          updatedColumns[id].taskIds.includes(newVars.id)
        );

        if (sourceColId && updatedColumns[sourceColId]) {
          updatedColumns[sourceColId].taskIds = updatedColumns[
            sourceColId
          ].taskIds.filter((id) => id !== newVars.id);
        }

        if (updatedColumns[newVars.data.status]) {
          updatedColumns[newVars.data.status].taskIds.splice(
            newVars.data.position,
            0,
            newVars.id
          );
        }

        if (task) task.status = newVars.data.status;

        return { ...old, tasks: updatedTasks, columns: updatedColumns };
      });

      return { previousData };
    },
    onError: (err, newVars, context) => {
      queryClient.setQueryData(["board", projectId], context?.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["board", projectId]);
    },
  });

  const createMutation = useMutation({
    mutationFn: (newTask) => taskService.createTask(newTask),
    onSuccess: () => {
      queryClient.invalidateQueries(["board", projectId]);
      setIsCreating(false);
      setNewTaskTitle("");
    },
  });

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    dragMutation.mutate({
      id: draggableId,
      data: {
        status: destination.droppableId,
        position: destination.index,
        project_id: Number(projectId),
      },
    });
  };

  const handleQuickCreate = () => {
    if (!newTaskTitle.trim()) return;

    const taskPayload = {
      project_id: projectId,
      title: selectedType === "story" ? `Story: ${newTaskTitle}` : newTaskTitle,
      type: selectedType,
      status: "backlog",
      priority: "Low",
    };

    if (selectedSprintId && selectedSprintId !== "backlog") {
      taskPayload.sprint_id = Number(selectedSprintId);
    }

    createMutation.mutate(taskPayload);
  };

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updatedFields }) =>
      taskService.updateTask(taskId, updatedFields),
    onMutate: async ({ taskId, updatedFields }) => {
      await queryClient.cancelQueries({ queryKey: ["board", projectId] });
      const previousBoardData = queryClient.getQueryData(["board", projectId]);
      if (previousBoardData) {
        queryClient.setQueryData(["board", projectId], {
          ...previousBoardData,
          tasks: {
            ...previousBoardData.tasks,
            [taskId]: {
              ...previousBoardData.tasks[taskId],
              ...updatedFields,
            },
          },
        });
      }
      return { previousBoardData };
    },
    onError: (err, variables, context) => {
      if (context?.previousBoardData) {
        queryClient.setQueryData(["board", projectId], context.previousBoardData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["board", projectId] });
    },
  });

  const handleUpdateTask = (updatedTask) => {
    updateTaskMutation.mutate({
      taskId: updatedTask.id,
      updatedFields: {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priority: updatedTask.priority,
        due_time: updatedTask.due_time,
        project_id: updatedTask.project_id,
        sprint_id: updatedTask.sprint_id,
      },
    });
  };

  const { data: projectEpics = [] } = useQuery({
    queryKey: ["projectEpics", projectId],
    queryFn: () => taskService.getProjectEpics(projectId),
    enabled: !!projectId,
  });

  const updateEpicMutation = useMutation({
    mutationFn: ({ taskId, epicId }) =>
      taskService.updateTaskEpic(taskId, epicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", projectId] });
      setLinkingTaskId(null);
    },
  });

  const handleLinkEpic = (taskId, epicId) => {
    updateEpicMutation.mutate({ taskId, epicId });
  };

  const handleRemoveEpic = (taskId) => {
    updateEpicMutation.mutate({ taskId, epicId: null });
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-xs font-black text-slate-400 uppercase tracking-widest">
        Loading Board...
      </div>
    );

  const columnsList = data?.columns ? Object.values(data.columns) : [];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans p-2 sm:p-4 lg:p-6 antialiased overflow-x-hidden">
      <DragDropContext onDragEnd={onDragEnd}>
        {/* 📱 Mobile: Vertical Accordion | 💻 Middle/Desktop Screens: Horizontally Scrollable Flex Row */}
        <div className="flex flex-col sm:flex-row sm:overflow-x-auto sm:items-start gap-3 sm:gap-4 pb-10 sm:h-[calc(100vh-100px)]">
          {columnsList.map((column) => {
            const taskIds = filteredColumnTaskIds(column.id);
            const isExpandedOnMobile = openColumnsMobile[column.id] ?? true;

            return (
              <div
                key={column.id}
                /* 
                   🔥 Middle screen fix: 
                   - sm:w-[280px] (Tablets / Medium screens)
                   - lg:w-[320px] (Laptops)
                   - xl:w-[350px] (Large Desktops)
                   - sm:shrink-0 prevents columns from collapsing or compressing!
                */
                className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-2.5 sm:p-3.5 flex flex-col w-full sm:w-[280px] lg:w-[320px] xl:w-[350px] sm:shrink-0 sm:h-full transition-all shadow-2xs"
              >
                {/* Column Header */}
                <div
                  onClick={() => toggleMobileColumn(column.id)}
                  className="flex justify-between items-center px-1 py-1 sm:py-0 cursor-pointer sm:cursor-default select-none mb-2 sm:mb-4"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="sm:hidden text-slate-400 shrink-0">
                      {isExpandedOnMobile ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </span>
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        column.id === "backlog" ? "bg-slate-400" : "bg-blue-600"
                      }`}
                    />
                    <h3 className="font-black text-slate-800 text-xs sm:text-sm uppercase tracking-tight truncate">
                      {column.title}
                    </h3>
                  </div>
                  <span className="bg-white border border-slate-200/80 text-slate-600 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-2xs shrink-0">
                    {taskIds.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <div
                  className={`${
                    isExpandedOnMobile ? "block" : "hidden sm:block"
                  } flex-1 overflow-hidden flex flex-col`}
                >
                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3 flex-1 overflow-y-auto pr-1 min-h-[60px] sm:min-h-[50px]"
                      >
                        {taskIds.map((taskId, index) => (
                          <DraggableCard
                            key={taskId}
                            task={data.tasks[taskId]}
                            index={index}
                            isMenuOpen={openMenuId === taskId}
                            setOpenMenuId={setOpenMenuId}
                            onOpenEpicLink={(id) => setLinkingTaskId(id)}
                            onRemoveEpic={(id) => handleRemoveEpic(id)}
                            onClick={() => setSelectedTask(data.tasks[taskId])}
                            onChat={() =>
                              setActiveChatTask(data.tasks[taskId])
                            }
                            onMeeting={() =>
                              setActiveMeetingTask(data.tasks[taskId])
                            }
                          />
                        ))}
                        {provided.placeholder}

                        {/* Quick Task Creation inside Backlog */}
                        {column.id === "backlog" &&
                          (isCreating ? (
                            <div className="bg-white p-3 rounded-2xl border-2 border-blue-500 shadow-md animate-in fade-in zoom-in-95">
                              <textarea
                                autoFocus
                                className="w-full text-xs font-bold text-slate-800 outline-none resize-none placeholder-slate-300 mb-2"
                                rows={2}
                                placeholder="Task description..."
                                value={newTaskTitle}
                                onChange={(e) =>
                                  setNewTaskTitle(e.target.value)
                                }
                                onKeyDown={(e) =>
                                  e.key === "Enter" &&
                                  (e.preventDefault(), handleQuickCreate())
                                }
                              />
                              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowTypeDropdown(!showTypeDropdown)
                                    }
                                    className="flex items-center gap-1.5 px-2 py-1 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                                  >
                                    <TypeIcon type={selectedType} size={14} />
                                    <ChevronDown
                                      size={12}
                                      className="text-slate-400"
                                    />
                                  </button>
                                  {showTypeDropdown && (
                                    <div className="absolute left-0 bottom-8 w-28 bg-white border border-slate-200 rounded-xl shadow-xl z-[110] py-1">
                                      {["task", "bug", "story", "epic"].map(
                                        (t) => (
                                          <button
                                            key={t}
                                            type="button"
                                            onClick={() => {
                                              setSelectedType(t);
                                              setShowTypeDropdown(false);
                                            }}
                                            className="w-full px-3 py-1.5 text-left text-[10px] font-black uppercase hover:bg-slate-50 flex items-center gap-2 text-slate-600"
                                          >
                                            <TypeIcon type={t} size={14} /> {t}
                                          </button>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="p-1 hover:bg-slate-100 rounded-lg"
                                  >
                                    <X size={16} className="text-slate-400" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleQuickCreate}
                                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-xs active:scale-95 transition-transform"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setIsCreating(true)}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-slate-500 hover:text-blue-600 font-bold text-xs bg-white/60 border border-dashed border-slate-300 hover:border-blue-400 rounded-xl transition-all shadow-2xs"
                            >
                              <Plus size={16} /> Create Task
                            </button>
                          ))}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* MODALS */}
      {linkingTaskId && (
        <LinkEpicModal
          epics={projectEpics}
          onSelect={(epicId) => {
            handleLinkEpic(linkingTaskId, epicId);
            setSelectedTask(null);
          }}
          onClose={() => setLinkingTaskId(null)}
          isPending={updateEpicMutation.isPending}
        />
      )}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
          projectId={projectId}
          selectedSprintId={
            selectedSprintId !== "backlog" ? selectedSprintId : null
          }
          onOpenLinkEpic={() => setLinkingTaskId(selectedTask.id)}
        />
      )}
      {activeChatTask && (
        <ChatModal
          task={activeChatTask}
          onClose={() => setActiveChatTask(null)}
        />
      )}
      {activeMeetingTask && (
        <MeetingModal
          task={activeMeetingTask}
          onClose={() => setActiveMeetingTask(null)}
        />
      )}
    </div>
  );
};

const TypeIcon = ({ type, size }) => {
  if (type === "bug") return <Bug size={size} className="text-red-500" />;
  if (type === "story")
    return <BookText size={size} className="text-emerald-600" />;
  if (type === "epic") return <Zap size={size} className="text-purple-600" />;
  return <CheckSquare size={size} className="text-blue-500" />;
};

const DraggableCard = ({
  task,
  index,
  onClick,
  isMenuOpen,
  setOpenMenuId,
  onOpenEpicLink,
  onRemoveEpic,
  onChat,
}) => {
  const isBacklog =
    task.status === "backlog" &&
    (!task.assignees || task.assignees.length === 0);

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
            snapshot.isDragging
              ? "border-blue-500 shadow-2xl scale-102 z-50 ring-2 ring-blue-500/20"
              : "border-slate-200/80 shadow-2xs hover:border-blue-300"
          }`}
        >
          <div className="flex justify-between items-start mb-1.5">
            <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-500 uppercase tracking-widest">
              #{task.id}
            </span>
            <div
              className="flex items-center gap-1.5 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <TypeIcon type={task.type} size={14} />
              {task.type === "story" && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(isMenuOpen ? null : task.id)}
                    className="p-1 hover:bg-slate-100 rounded-md text-slate-400"
                  >
                    <MoreVertical size={14} />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-xl z-[150] py-1">
                      <button
                        type="button"
                        onClick={() => {
                          onOpenEpicLink(task.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-[10px] font-black text-slate-600 hover:bg-blue-50 flex items-center gap-2 uppercase"
                      >
                        <Link2 size={12} /> Link Epic
                      </button>
                      {task.ParentTask && (
                        <button
                          type="button"
                          onClick={() => {
                            onRemoveEpic(task.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-[10px] font-black text-red-500 hover:bg-red-50 flex items-center gap-2 uppercase"
                        >
                          <Unlink size={12} /> Remove Epic
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug mb-2 line-clamp-2">
            {task.title}
          </p>

          {!isBacklog && (
            <div className="mt-2.5">
              {task?.ParentTask && (
                <div className="mb-2">
                  <span className="bg-pink-50 text-pink-600 text-[9px] font-black px-2 py-0.5 rounded-md border border-pink-100 uppercase tracking-tighter inline-block truncate max-w-full">
                    EPIC: {task.ParentTask?.title}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5 mb-2.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    task.priority === "High" ? "bg-rose-500" : "bg-blue-500"
                  }`}
                />
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  {task.priority} Priority
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <div className="flex -space-x-1.5 items-center">
                  {(task.assignees || []).map((user, uIdx) => (
                    <div
                      key={user.id || uIdx}
                      className="w-6 h-6 rounded-full border border-white bg-slate-900 flex items-center justify-center text-white font-black text-[10px] uppercase overflow-hidden shrink-0 shadow-2xs"
                    >
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
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

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChat();
                    }}
                    className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-slate-50"
                  >
                    <MessageSquare size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default KanbanBoard;