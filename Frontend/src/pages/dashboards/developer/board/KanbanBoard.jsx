import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../../../../api/services/taskService";
import {
  MessageSquare,
  Bug,
  BookText,
  ClipboardList,
  FolderKanban,
  ChevronDown,
  Layers,
} from "lucide-react";
import TaskModal from "./TaskModal";
import ChatModal from "./ChatModal";
import MeetingModal from "./MeetingModal";
import { useMyProjects } from "../../../../hooks/useProjects";
import socket from "../../../../context/SocketContext";
import { useSearchParams } from "react-router-dom";

const KanbanBoard = () => {
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeChatTask, setActiveChatTask] = useState(null);
  const [activeMeetingTask, setActiveMeetingTask] = useState(null);

  const [searchParams] = useSearchParams();
  const queryProjectId = searchParams.get("projectId");
  const queryProjectName = searchParams.get("projectName");

  const [projectId, setProjectId] = useState(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  
  // Mobile Swimlane active column tab state
  const [activeMobileColumn, setActiveMobileColumn] = useState("todo");

  const { data: myProjects } = useMyProjects();
  const projects = myProjects?.data || [];

  useEffect(() => {
    if (queryProjectId) {
      setProjectId(Number(queryProjectId));
    } else if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects, queryProjectId]);

  const { data: boardData, isLoading } = useQuery({
    queryKey: ["board", projectId],
    queryFn: () => taskService.getAssignedBoard(projectId),
    enabled: !!projectId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (vars) =>
      console.log("Updating Task Position with:", vars.id, vars.data) ||
      taskService.updateTaskPosition(vars.id, vars.data),
    onMutate: async ({
      taskId,
      status,
      sourceCol,
      destCol,
      sourceIndex,
      destIndex,
    }) => {
      await queryClient.cancelQueries({ queryKey: ["board", projectId] });
      const previousBoard = queryClient.getQueryData(["board", projectId]);

      if (previousBoard) {
        const updatedTasks = { ...previousBoard.tasks };
        if (updatedTasks[taskId]) {
          updatedTasks[taskId] = { ...updatedTasks[taskId], status: destCol };
        }

        const updatedColumns = { ...previousBoard.columns };
        const sourceIds = Array.from(updatedColumns[sourceCol]?.taskIds || []);
        
        sourceIds.splice(sourceIndex, 1);

        if (sourceCol === destCol) {
          sourceIds.splice(destIndex, 0, taskId);
          updatedColumns[sourceCol] = {
            ...updatedColumns[sourceCol],
            taskIds: sourceIds,
          };
        } else {
          const destIds = Array.from(updatedColumns[destCol]?.taskIds || []);
          destIds.splice(destIndex, 0, taskId);

          updatedColumns[sourceCol] = {
            ...updatedColumns[sourceCol],
            taskIds: sourceIds,
          };
          updatedColumns[destCol] = {
            ...updatedColumns[destCol],
            taskIds: destIds,
          };
        }

        queryClient.setQueryData(["board", projectId], {
          ...previousBoard,
          tasks: updatedTasks,
          columns: updatedColumns,
        });
      }
      return { previousBoard };
    },
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(["board", projectId], context.previousBoard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["board", projectId] });
    },
  });

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    updateStatusMutation.mutate({
      id: draggableId,
      data: {
        status: destination.droppableId,
        position: destination.index,
      },
    });
  };

  const columnsOrder = ["todo", "inprogress", "review", "done"];
  const tasks = boardData?.tasks || {};
  const columns = boardData?.columns || {};

  const activeProjectObject = projects?.find((p) => p.id === projectId);
  const currentDisplayedName =
    activeProjectObject?.name || queryProjectName || "Select Project";

  const getColumnTitle = (id) => {
    switch (id) {
      case "todo":
        return "To Do";
      case "inprogress":
        return "In Progress";
      case "review":
        return "Review";
      case "done":
        return "Done";
      default:
        return id;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Loading Workspace Board...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-[#F8FAFC] min-h-screen font-sans">
      {/* Upper Navigation & Project Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="w-full sm:w-auto flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-4 py-2.5 shadow-sm text-slate-800 hover:bg-slate-50 transition-all text-left"
          >
            <div className="flex items-center gap-2.5">
              <FolderKanban size={18} className="text-blue-600 shrink-0" />
              <span className="font-extrabold text-sm truncate max-w-[200px]">
                {currentDisplayedName}
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400 shrink-0" />
          </button>

          {showProjectDropdown && (
            <div className="absolute left-0 mt-2 w-full sm:w-72 bg-white border border-slate-100 rounded-xl shadow-xl z-[200] py-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Switch Workspace
              </div>
              <div className="max-h-60 overflow-y-auto">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        setProjectId(project.id);
                        setShowProjectDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between transition-colors ${
                        project.id === projectId
                          ? "bg-blue-50/80 text-blue-600"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{project.name}</span>
                      {project.id === projectId && (
                        <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="text-xs font-bold text-slate-400 text-center py-3">
                    No Projects Assigned
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center text-xs text-slate-400 font-semibold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <Layers size={14} className="text-slate-400" />
          <span>
            Workspace ID: <strong className="text-slate-700">#{projectId || "N/A"}</strong>
          </span>
        </div>
      </div>

      {/* 📱 MOBILE NAVIGATION TABS (< 768px) */}
      <div className="flex md:hidden overflow-x-auto gap-2 mb-4 pb-1 scrollbar-none">
        {columnsOrder.map((columnId) => {
          const count = (columns[columnId]?.taskIds || []).filter(
            (id) => tasks[id] && tasks[id].type !== "epic"
          ).length;

          return (
            <button
              key={columnId}
              onClick={() => setActiveMobileColumn(columnId)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all ${
                activeMobileColumn === columnId
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-slate-500 border border-slate-200"
              }`}
            >
              <span>{getColumnTitle(columnId)}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeMobileColumn === columnId
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Kanban Grid Container */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {columnsOrder.map((columnId) => {
            const currentColumn = columns[columnId] || {
              id: columnId,
              taskIds: [],
            };

            const columnTasks = currentColumn.taskIds
              .map((id) => tasks[id])
              .filter((task) => task && task.type !== "epic");

            const columnTitle = getColumnTitle(columnId);

            return (
              <div
                key={columnId}
                className={`bg-slate-100/60 rounded-2xl p-4 flex flex-col min-h-[70vh] border border-slate-200/70 transition-all ${
                  activeMobileColumn !== columnId ? "hidden md:flex" : "flex"
                }`}
              >
                <div className="flex justify-between items-center mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <h3 className="font-black text-slate-800 text-xs tracking-wider uppercase">
                      {columnTitle}
                    </h3>
                  </div>
                  <span className="bg-white border border-slate-200 text-slate-600 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                    {columnTasks.length}
                  </span>
                </div>

                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-3.5 flex-1 transition-colors rounded-xl min-h-[150px] ${
                        snapshot.isDraggingOver ? "bg-blue-50/50" : ""
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <DraggableCard
                          key={task.id}
                          task={task}
                          index={index}
                          onOpen={() => openTaskDetail(task)}
                          onChatClick={() => setActiveChatTask(task)}
                          onMeetingClick={() => setActiveMeetingTask(task)}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Workspace Interactive Modals */}
      {isModalOpen && (
        <TaskModal task={selectedTask} onClose={() => setIsModalOpen(false)} />
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

const DraggableCard = ({
  task,
  index,
  onOpen,
  onChatClick,
  onMeetingClick,
}) => {
  const [searchParams] = useSearchParams();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const cardRef = useRef(null);

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((sub) => sub.is_done).length || 0;

  useEffect(() => {
    const highlightId = searchParams.get("highlightTaskId");

    if (highlightId && String(task.id) === String(highlightId)) {
      setIsHighlighted(true);

      setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);

      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, task.id]);

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={(node) => {
            provided.innerRef(node);
            cardRef.current = node;
          }}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onOpen}
          className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 select-none group cursor-pointer ${
            snapshot.isDragging
              ? "border-blue-500 shadow-2xl rotate-2 z-50 bg-white"
              : isHighlighted
              ? "border-blue-500 ring-4 ring-blue-500/20 shadow-xl scale-[1.02] bg-gradient-to-br from-white to-blue-50/50 z-40"
              : "bg-white border-slate-200/80 shadow-sm hover:border-blue-400 hover:shadow-md"
          }`}
        >
          <div className="flex justify-between items-start mb-2.5">
            <span
              className={`text-[10px] font-black transition-colors uppercase tracking-widest ${
                isHighlighted
                  ? "text-blue-600"
                  : "text-slate-400 group-hover:text-blue-600"
              }`}
            >
              #{task.id}
            </span>
            <div
              className={`p-1.5 rounded-xl transition-colors ${
                isHighlighted
                  ? "bg-blue-100/60"
                  : "bg-slate-100 group-hover:bg-blue-50"
              }`}
            >
              {task.type === "bug" ? (
                <Bug size={14} className="text-red-500" />
              ) : task.type === "story" ? (
                <BookText size={14} className="text-emerald-600" />
              ) : (
                <ClipboardList size={14} className="text-blue-500" />
              )}
            </div>
          </div>

          <p className="text-[13px] sm:text-[14px] font-bold text-slate-800 leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
            {task.title}
          </p>

          {task.ParentTask && (
            <div className="mb-3">
              <span className="bg-pink-50 text-pink-600 text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-tight border border-pink-100/60 inline-block truncate max-w-full">
                EPIC : {task.ParentTask.title}
              </span>
            </div>
          )}

          {task.priority && (
            <div className="flex items-center gap-1.5 mb-3">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  task.priority === "High" ? "bg-red-500" : "bg-blue-500"
                }`}
              />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                Priority: {task.priority}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <div className="flex -space-x-1.5">
              {(task.assignees || []).map((user, i) => (
                <div
                  key={user.id || i}
                  title={user.full_name}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm bg-blue-600 text-white flex items-center justify-center text-[9px] font-black uppercase overflow-hidden shrink-0"
                >
                  {user?.avatar_url ? (
                    <img
                      src={user?.avatar_url}
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

            <div className="flex items-center gap-2.5 text-slate-400 font-bold">
              <span className="text-[10px] font-black text-slate-400">
                {completedSubtasks}/{totalSubtasks}
              </span>
              <div className="flex gap-1 pl-2 border-l border-slate-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChatClick();
                  }}
                  className="hover:text-blue-600 text-slate-400 transition-colors p-1"
                >
                  <MessageSquare size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanBoard;