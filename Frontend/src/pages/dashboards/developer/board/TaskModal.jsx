import React, { useState } from "react";
import { X, Plus, CheckCircle2, Send } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../../../../api/services/taskService";

const TaskModal = ({ task, onClose }) => {
  const [activeTab, setActiveTab] = useState("Overview");

  const [currentStatus, setCurrentStatus] = useState(task.status || "To Do");

  const queryClient = useQueryClient();

  const [newComment, setNewComment] = useState("");

  const { data: serverComments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ["taskComments", task.id],
    queryFn: () => taskService.getComments(task.id),
    enabled: !!task.id && activeTab === "Comments",
  });

  const { data: serverSubtasks = [], isLoading: isSubtasksLoading } = useQuery({
    queryKey: ["taskSubtasks", task.id],
    queryFn: () => taskService.getSubtasks(task.id), // Ensure taskService mein yeh fetch call api bani ho
    enabled: !!task?.id, // Isay true rakhein taake Overview tab ka progress bar bhi load hote hi update ho jaye
  });

  const addCommentMutation = useMutation({
    mutationFn: (commentText) => taskService.postComment(task.id, commentText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskComments", task.id] });
      setNewComment("");
    },
  });

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment);
  };

const toggleSubtaskMutation = useMutation({
  mutationFn: (subtaskId) => taskService.toggleSubtask(subtaskId),
  onSettled: async () => {
    await Promise.all([
      queryClient.invalidateQueries({ 
        queryKey: ["taskSubtasks", task.id],
      }),
      queryClient.invalidateQueries({ 
        queryKey: ["board", task.project_id] // Apne board ki primary ID check karlein (agar dynamic hai to workspace/project id lagayein)
      })
    ]);
  },
});

  const toggleSubtask = (subId) => {
    console.log(subId);
    toggleSubtaskMutation.mutate(subId);
  };

  if (!task) return null;

  const subtasks = serverSubtasks.length;
  const doneCount = serverSubtasks.filter((s) => s.is_done).length;
  const progressPercent = serverSubtasks.length > 0 ? (doneCount / subtasks) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 pb-2">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 font-bold text-lg">{task.id}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  task.priority === "High"
                    ? "bg-orange-50 border-orange-200 text-orange-600"
                    : "bg-green-50 border-green-200 text-green-600"
                }`}
              >
                ● {task.priority}
              </span>
              <span className="text-blue-600 text-sm font-medium">
                {task?.ParentTask?.title || "No Epic"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            {task?.title}
          </h2>

          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-400 mb-2 font-medium">
              <span>Subtasks Progress</span>
              <span>
                {doneCount}/{subtasks}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex gap-8 border-b border-gray-100">
            {["Overview", "Subtasks", "Comments"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold transition-all relative ${
                  activeTab === tab
                    ? "text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto bg-white">
          {activeTab === "Overview" && (
            <OverviewContent
              currentStatus={currentStatus}
              setCurrentStatus={setCurrentStatus}
              content={task.description}
            />
          )}
          {activeTab === "Subtasks" && (
            <SubtasksContent
              subtasks={serverSubtasks}
              task={task}
              onToggleSubtask={toggleSubtask}
            />
          )}
          {activeTab === "Comments" && (
            <CommentsContent
              serverComments={serverComments}
              newComment={newComment}
              setNewComment={setNewComment}
              handlePostComment={handlePostComment}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const OverviewContent = ({ currentStatus, content }) => {
  const activeStatus = currentStatus || "todo";

  return (
    <div className="flex flex-col md:flex-row gap-10">
      <div className="flex-1">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
          Description
        </h4>
        <div className="p-4 border border-gray-100 rounded-xl min-h-[150px] text-gray-600 text-sm leading-relaxed">
          {content}
        </div>
        <div className="mt-8">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
            Assignees
          </h4>
          <div className="flex gap-2">
            {["bg-red-500", "bg-blue-500", "bg-green-500", "bg-pink-500"].map(
              (c, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 border-white shadow-sm ${c}`}
                />
              ),
            )}
          </div>
        </div>
      </div>

      <div className="w-full md:w-64">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
          Update Status
        </h4>
        <div className="space-y-2">
          {["To Do", "In Progress", "Review", "Done"].map((status) => {
            const isActive =
              status.toLowerCase().replace(" ", "") == activeStatus;

            return (
              <div
                key={status}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors flex justify-between items-center group ${
                  isActive
                    ? "border-blue-500 bg-blue-50/30 text-blue-700"
                    : "border-gray-100 text-gray-600"
                }`}
              >
                {status}
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SubtasksContent = ({ subtasks, task, onToggleSubtask }) => {
  if (!subtasks || subtasks.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          No subtasks found for this task.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subtasks.map((item) => (
        <div
          key={item.id}
          onClick={() => onToggleSubtask(item.id)}
          className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer select-none ${
            item.is_done
              ? "bg-green-50/20 border-green-100/70"
              : "bg-white border-gray-100 hover:border-blue-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                item.is_done
                  ? "bg-blue-600 border-blue-600 shadow-sm"
                  : "border-gray-300 bg-white"
              }`}
            >
              {item.is_done && (
                <CheckCircle2 size={13} className="text-white" />
              )}
            </div>
            <span
              className={`text-sm font-bold transition-all ${
                item.is_done ? "text-gray-400 line-through" : "text-slate-700"
              }`}
            >
              {item.title}
            </span>
          </div>

          {/* Assignees Overlapping Stack Avatars */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              {(task?.assignees || []).map((user) => (
                <div
                  key={user.id}
                  title={user.full_name}
                  className="rounded-full border-2 border-white bg-blue-600 w-6 h-6 flex items-center justify-center text-white font-black text-[9px] shadow-sm uppercase overflow-hidden shrink-0"
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
          </div>
        </div>
      ))}
    </div>
  );
};

const CommentsContent = ({
  serverComments,
  newComment,
  setNewComment,
  handlePostComment,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {serverComments?.length > 0 ? (
          serverComments.map((comment) => {
            const uniqueKey = comment.id || comment.User?.id;

            return (
              <div
                key={uniqueKey}
                className="flex gap-4 animate-in fade-in slide-in-from-left-2"
              >
                <div className="rounded-full border border-blue-100 bg-blue-600 w-10 h-10 flex items-center justify-center text-white font-black text-xs shadow-sm uppercase overflow-hidden shrink-0">
                  {comment.User?.avatar_url ? (
                    <img
                      src={
                        comment.User?.avatar_url
                      }
                      alt="Avatar"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  ) : comment.User?.full_name ? (
                    comment.User.full_name[0]
                  ) : (
                    "U"
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-black text-slate-700">
                      {comment.User?.full_name || "Unknown User"}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      {comment.createdAt
                        ? new Date(comment.createdAt).toLocaleDateString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Just now"}
                    </span>
                  </div>
                  <div className="bg-slate-50/80 border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              No comments yet. Start the discussion!
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-slate-50 pt-8 mt-4">
        <div className="flex gap-4">
          <div className="flex-1 space-y-4">
            <textarea
              className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 transition-all resize-none min-h-[100px] shadow-inner"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePostComment();
                }
              }}
            />
            <button
              onClick={handlePostComment}
              disabled={!newComment.trim()}
              className="bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg transition-all tracking-widest active:scale-95"
            >
              Post Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
