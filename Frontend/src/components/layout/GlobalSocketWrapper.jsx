import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import socket from "../../context/SocketContext";
import { useMyProjects } from "../../hooks/useProjects";
import { useNavigate } from "react-router";

const GlobalSocketWrapper = ({ children, currentUserId, activeChat }) => {
  const queryClient = useQueryClient();
  const { data: myProjects } = useMyProjects();
  const projects = myProjects?.data || [];
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  useEffect(() => {
    if (!socket || projects.length === 0) return;
    projects.forEach((project) => {
      socket.emit("project:join_room", { project_id: project.id });
    });
    console.log(
      `📡 Globally connected to ${projects.length} project rooms in background.`,
    );
    socket.on("board:task_moved_received", (data) => {
      const targetProject = projects.find(
        (p) => p.id === Number(data.project_id),
      );
      const projectName = targetProject
        ? targetProject.name
        : `Project #${data.project_id}`;
      const actionBy = data.updated_by || "A Team Member";
      toast.success(
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between items-center gap-4">
            <span className="font-black text-blue-400 text-[10px] uppercase tracking-wider">
              {projectName}
            </span>
            <span className="text-[9px] text-slate-400 font-bold bg-slate-800 px-1.5 py-0.5 rounded">
              By: {actionBy}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-1">
            Task #{data.task_id} shifted to{" "}
            <span className="text-blue-400 font-bold">
              {data.status.toUpperCase()}
            </span>
          </p>
        </div>,
        { duration: 5000, icon: "🔄" },
      );

      queryClient.invalidateQueries({
        queryKey: ["board", Number(data.project_id)],
      });
    });

    socket.on("board:task_created_received", (data) => {
      const targetProject = projects.find(
        (p) => p.id === Number(data.project_id),
      );
      const projectName = targetProject ? targetProject.name : "Workspace";

      toast.success(
        <div className="flex flex-col gap-0.5">
          <span className="font-black text-green-400 text-[10px] uppercase tracking-wider">
            {projectName}
          </span>
          <p className="text-xs font-semibold text-slate-200">
            🆕 New task created: "{data.task?.title || "Task"}"
          </p>
        </div>,
        { duration: 4000 },
      );

      queryClient.invalidateQueries({
        queryKey: ["board", Number(data.project_id)],
      });
    });

    socket.on("board:task_updated_received", (data) => {
      queryClient.invalidateQueries({
        queryKey: ["board", Number(data.project_id)],
      });
      queryClient.invalidateQueries({
        queryKey: ["projectEpics", Number(data.project_id)],
      });
    });

    return () => {
      socket.off("board:task_moved_received");
      socket.off("board:task_created_received");
      socket.off("board:task_updated_received");
    };
  }, [socket, projects, queryClient]);

  // ==========================================
  // 🚀 1. SEPARATE EFFECT: Pipeline Webhook Notifications
  // ==========================================
  useEffect(() => {
    if (!socket) return;

    socket.on("pipeline:status_received", (data) => {
      const targetProject = projects.find(
        (p) => p.id === Number(data.project_id),
      );
      const projectName = targetProject
        ? targetProject.name
        : `Project #${data.project_id}`;

      // 🌟 FIX: Added .toLowerCase() to support both "Success"/"success" or "Failed"/"failed" safely
      const normalizedStatus = data.status ? data.status.toLowerCase() : "";
      const isSuccess =
        normalizedStatus === "success" || normalizedStatus === "passed";

      toast(
        <div className="flex flex-col gap-0.5 min-w-[220px]">
          <div className="flex justify-between items-center gap-4">
            <span
              className={`font-black text-[10px] uppercase tracking-wider ${isSuccess ? "text-emerald-400" : "text-rose-500"}`}
            >
              {projectName}
            </span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isSuccess ? "bg-emerald-950 text-emerald-300" : "bg-rose-950 text-rose-300"}`}
            >
              {data.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-1">
            {isSuccess
              ? "Deployment pipeline completed!"
              : "Pipeline execution failed!"}
          </p>
          {data.log_summary && (
            <p className="text-[10px] font-mono text-slate-400 bg-slate-900/50 p-1 rounded mt-1 border border-slate-800/40 truncate">
              {data.log_summary}
            </p>
          )}
        </div>,
        {
          duration: 6000,
          icon: isSuccess ? "🟢" : "🔴",
        },
      );

      // Deployments dynamic cache refresh
      queryClient.invalidateQueries({
        queryKey: ["project_deployments", Number(data.project_id)],
      });
    });

    return () => {
      socket.off("pipeline:status_received");
    };
  }, [socket, projects, queryClient]);

  // ==========================================
  // 2. CHAT GLOBAL REAL-TIME ENGINE (DMs & Channels)
  // ==========================================
useEffect(() => {
  if (!socket) return;
  if (currentUserId) {
    socket.emit("user_online", currentUserId);
  }

  const handleGlobalIncomingMessage = (newIncomingMessage) => {
    const currentActiveNumericId = activeChat?.id?.toString().split("-").pop();
    const isSenderMe = Number(newIncomingMessage.sender_id) === Number(currentUserId);

    console.log("Global Wrapper intercepted a message:", newIncomingMessage, isSenderMe, activeChat);

    const isCurrentChatOpen =
      activeChat?.id &&
      ((activeChat.type === "channel" &&
        Number(newIncomingMessage.channel_id) === Number(currentActiveNumericId)) ||
        (activeChat.type === "dm" &&
          ((Number(newIncomingMessage.sender_id) === Number(currentActiveNumericId) &&
            Number(newIncomingMessage.receiver_id) === Number(currentUserId)) ||
            (Number(newIncomingMessage.sender_id) === Number(currentUserId) &&
              Number(newIncomingMessage.receiver_id) === Number(currentActiveNumericId)))));

    if (!isSenderMe && !isCurrentChatOpen) {
      const senderName = newIncomingMessage.Sender?.full_name || "Team Member";
      let messagePreview = "";

      const hasContent = Boolean(newIncomingMessage.content?.trim());
      const hasAttachments = Array.isArray(newIncomingMessage.attachments) && newIncomingMessage.attachments.length > 0;

      if (hasContent && hasAttachments) {
        const count = newIncomingMessage.attachments.length;
        messagePreview = `${newIncomingMessage.content} 📎 (${count} attachment${count > 1 ? "s" : ""})`;
      } else if (hasContent) {
        messagePreview = newIncomingMessage.content;
      } else if (hasAttachments) {
        const count = newIncomingMessage.attachments.length;
        messagePreview = `📎 Sent ${count} attachment${count > 1 ? "s" : ""}`;
      } else {
        messagePreview = "Sent a message...";
      }

      // Slack Style Channel name or DM label
      const chatContext = newIncomingMessage.channel_id ? "# group-channel" : "Direct Message";

      const avatarUrl = newIncomingMessage.Sender?.avatar_url
        ? `${newIncomingMessage.Sender?.avatar_url}`
        : null;
        
      const isMobile = window.innerWidth < 768;

      if (!isMobile) {
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-sm w-full bg-[#1A1D21] text-[#D1D2D3] shadow-2xl rounded-lg pointer-events-auto flex overflow-hidden border border-[#35373B] transition-all`}
            >
              {/* Slack Sidebar Active Strip - Blue for Messages */}
              <div className="w-1.5 bg-[#1D9BD1] shrink-0" />

              <div className="flex-1 p-3.5 flex gap-3 items-start">
                {/* Slack Avatar (Square with slight radius) */}
                <div className="shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={senderName}
                      crossOrigin="anonymous"
                      className="w-9 h-9 rounded-[4px] object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-[4px] bg-[#611f69] flex items-center justify-center text-white font-black text-sm uppercase">
                      {senderName[0]}
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                  {/* Header: Sender Name & Context */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-black text-white text-sm tracking-tight truncate">
                      {senderName}
                    </span>
                    <span className="text-[10px] text-[#ABABAD] font-medium truncate">
                      {chatContext}
                    </span>
                  </div>

                  {/* Slack Message Body */}
                  <p className="text-sm text-[#D1D2D3] mt-0.5 break-words line-clamp-2 leading-relaxed">
                    {messagePreview}
                  </p>

                  {/* Actions Row */}
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        navigate(`/${role?.split("_")?.join("-")}/chat`);
                      }}
                      className="text-[11px] bg-[#222529] hover:bg-[#2A2D31] text-[#1D9BD1] hover:text-[#147BB1] font-bold px-2.5 py-1 rounded border border-[#35373B] transition-all shadow-sm"
                    >
                      Open Chat
                    </button>
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="text-[11px] text-[#ABABAD] hover:text-white font-medium px-2 py-1 transition-all"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ),
          { duration: 5000, position: "bottom-right" }
        );
      }
    }

    queryClient.invalidateQueries(["conversations"]);
    queryClient.invalidateQueries(["channels"]);
    
    const audio = new Audio("/sounds/short_bongo.mp3");
    audio.volume = 0.5;
    audio.play().catch((e) => console.log("Sound blocked by browser policy"));
  };

  socket.on("chat:receive_message", handleGlobalIncomingMessage);
  return () => {
    socket.off("chat:receive_message", handleGlobalIncomingMessage);
  };
}, [currentUserId, activeChat, queryClient, navigate, role]);

  // =========================================================
  // ⚡ 1. BULLETPROOF PRESENCE PIPELINE (ROOM REGISTRATION)
  // =========================================================
  useEffect(() => {
    if (!socket) return;
    const registerPresence = () => {
      let rawUser = localStorage.getItem("user");
      let devId = null;
      if (rawUser) {
        try {
          if (rawUser.startsWith("{")) {
            devId = JSON.parse(rawUser)?.id;
          } else {
            devId = rawUser;
          }
        } catch (e) {
          devId = rawUser;
        }
      }
      if (devId && devId !== "undefined" && devId !== "null") {
        console.log(
          `🟢 [Presence Verification] Emitting 'user_online' for Developer ID: ${devId}`,
        );
        socket.emit("user_online", devId);
      } else {
        console.log(
          "⚠️ [Presence Verification] Failed to extract Developer ID from localStorage.",
        );
      }
    };
    registerPresence();
    socket.on("connect", registerPresence);
    return () => {
      socket.off("connect", registerPresence);
    };
  }, [socket]);

  // =========================================================
  // 🪲 2. QA BUG DETECTION REAL-TIME LISTENER
  // =========================================================
  useEffect(() => {
    if (!socket) return;

    const handleQABugDetected = (data) => {
      // Severity ke mutabiq vertical line ka color (Slack sidebar style)
      const severityColor =
        data.severity?.toLowerCase() === "critical"
          ? "bg-red-500"
          : data.severity?.toLowerCase() === "high"
            ? "bg-orange-500"
            : "bg-yellow-500";

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-sm w-full bg-[#1A1D21] text-[#D1D2D3] shadow-xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden border border-[#35373B]`}
          >
            {/* Slack Left Indicator Bar */}
            <div className={`w-1.5 ${severityColor} shrink-0`} />

            <div className="flex-1 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {/* Header / App Name */}
                  <div className="flex items-center gap-1.5 text-xs text-[#ABABAD]">
                    <span className="font-black text-[#E8912D]"># Project</span>
                    <span>•</span>
                    <span className="font-semibold text-xs capitalize text-slate-300">
                      {data.projectName}
                    </span>
                  </div>

                  {/* Bug Message Text */}
                  <p className="text-sm mt-1 text-[#D1D2D3] leading-normal font-medium">
                    <span className="font-bold text-white">
                      QA Bug Detected:
                    </span>{" "}
                    "{data.title}"
                  </p>

                  {/* Meta details with Slack attachment style feel */}
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-[#ABABAD]">
                    <span className="px-1.5 py-0.5 rounded bg-[#222529] font-semibold uppercase text-xs text-red-400 border border-red-900/50">
                      {data.severity || "High"}
                    </span>
                    <span>•</span>
                    <span className="italic">Fix it as soon as possible</span>
                  </div>
                </div>

                {/* Right Side Action Button */}
                <div className="flex shrink-0">
                  <button
                    onClick={() => {
                      navigate(`/${role?.split("_")?.join("-")}/issues`);
                      toast.dismiss(t.id); // Click hone par toast band ho jaye
                    }}
                    className="text-xs bg-[#222529] hover:bg-[#2A2D31] text-[#1D9BD1] hover:text-[#147BB1] font-bold px-3 py-1.5 rounded border border-[#35373B] transition-all self-start shadow-sm"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        ),
        {
          duration: 8000,
          position: "bottom-right",
        },
      );

      // =========================================================
      // 🔥 TARGETED LIVE CACHE INVALIDATION TREE (FOR YOUR HOOKS)
      // =========================================================
      console.log(
        "🔄 [Cache Pipeline] Invalidating dynamic hooks layout queries...",
      );
      queryClient.invalidateQueries({ queryKey: ["assignedIssues"] });
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
    };

    socket.on("qa:bug_detected", handleQABugDetected);
    return () => {
      socket.off("qa:bug_detected", handleQABugDetected);
    };
  }, [socket, queryClient, navigate]);

  const handleNavigate = (status) => {
    if (!status) return;
    switch (status) {
      case "Ready for QA":
        navigate("/qa/verify-task");
        break;
      case "In Progress":
        navigate("/qa/dashboard");
        break;
    }
  };

  // =========================================================
  // 🎯 REAL-TIME DEVELOPER ACTION DETECTION (NOTIFY QA)
  // =========================================================
  useEffect(() => {
    if (!socket) return;
    const handleDevStatusUpdated = (data) => {
      console.log(
        "📥 [QA ENGINE MATRIX] Received status update from developer:",
        data,
      );
      toast.success(
        <div className="flex flex-col gap-1 w-full max-w-xs text-left">
          <div className="flex justify-between items-center gap-4 border-b border-white/5 pb-1">
            <span className="font-black text-amber-400 text-[10px] uppercase tracking-wider animate-pulse">
              VERIFICATION REQUIRED
            </span>
            <span className="text-[8px] text-emerald-300 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded uppercase border border-emerald-800">
              {data.newStatus}
            </span>
          </div>

          <div className="mt-1">
            <span className="text-[10px] text-slate-400 block font-medium">
              Project:{" "}
              <span className="text-slate-200 font-bold">
                {data.projectName}
              </span>
            </span>
            <p className="text-xs font-bold text-slate-100 mt-0.5 line-clamp-1">
              "{data.title}"
            </p>
          </div>

          <div className="flex justify-between items-center mt-2 pt-1 border-t border-white/5">
            <span className="text-[9px] text-slate-500 italic">
              By Dev: {data.devName}
            </span>
            <button
              onClick={() => handleNavigate(data.newStatus)}
              className="text-[9px] bg-slate-800 hover:bg-slate-700 text-amber-400 font-black px-2 py-0.5 rounded transition-all"
            >
              Test Now →
            </button>
          </div>
        </div>,
        {
          duration: 7000,
          position: "bottom-right",
          style: {
            background: "#0f172a",
            border: "1px solid rgba(245, 158, 11, 0.2)",
          },
        },
      );
      console.log(
        "🔄 [QA Cache Reset] Invalidating readyForQA and issue queues...",
      );
      queryClient.invalidateQueries({ queryKey: ["issues", "readyForQA"] });
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
      
    };
    socket.on("developer:status_updated", handleDevStatusUpdated);
    return () => {
      socket.off("developer:status_updated", handleDevStatusUpdated);
    };
  }, [socket, queryClient, navigate]);

  // =========================================================
  // REAL-TIME COMMENTS NOTIFIER & PIPELINE SYNC
  // =========================================================
  useEffect(() => {
    if (!socket) return;
    const handleCommentReceived = (data) => {
      toast(
        (t) => (
          <div className="flex flex-col gap-1 w-full max-w-xs text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <span className="font-black text-blue-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                💬 New Comment
              </span>
              <span className="text-[8px] text-slate-400 font-semibold bg-slate-800 px-1 py-0.5 rounded">
                Issue #{data.issueId}
              </span>
            </div>

            <div className="mt-1">
              <span className="text-[10px] text-slate-300 font-black block">
                {data.senderName}:
              </span>
              <p className="text-xs font-medium text-slate-100 italic line-clamp-2 mt-0.5">
                "{data.commentText}"
              </p>
            </div>

            <div className="flex justify-end mt-2 pt-1 border-t border-white/5">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate(
                    window.location.pathname.startsWith("/qa")
                      ? `/qa/alerts`
                      : `/dev/issues`,
                  );
                }}
                className="text-[9px] bg-slate-800 hover:bg-slate-700 text-blue-400 font-black px-2 py-0.5 rounded transition-all"
              >
                Reply →
              </button>
            </div>
          </div>
        ),
        {
          position: "bottom-right",
          style: {
            background: "#0f172a",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          },
          duration: 5000,
        },
      );

      // =========================================================
      // FIXED: FORCE ACTIVE RE-FETCH ON CURRENT SCREEN
      // =========================================================
      queryClient.refetchQueries({
        type: "active",
      });
    };
    socket.on("issue:comment_received", handleCommentReceived);
    return () => {
      socket.off("issue:comment_received", handleCommentReceived);
    };
  }, [socket, queryClient, navigate]);

  // =========================================================
  // REAL-TIME TEAM ALLOCATION MONITOR (PROJECT ASSIGNMENT)
  // =========================================================
  useEffect(() => {
    if (!socket) return;
    const handleProjectTeamUpdated = (data) => {
      toast.success(
        <div className="flex flex-col gap-1 w-full max-w-xs text-left">
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="font-black text-emerald-400 text-[10px] uppercase tracking-wider animate-pulse">
              💼 Team Allocated
            </span>
            <span className="text-[8px] text-slate-400 font-semibold bg-slate-800 px-1 py-0.5 rounded">
              Live Core
            </span>
          </div>

          <div className="mt-1">
            <p className="text-xs font-bold text-slate-100 mt-0.5">
              {data.message}
            </p>
          </div>

          <div className="flex justify-end mt-2 pt-1 border-t border-white/5">
            <button
              onClick={() =>
                navigate(`/developer/issues?project=${data.projectId}`)
              }
              className="text-[9px] bg-slate-800 hover:bg-slate-700 text-emerald-400 font-black px-2 py-0.5 rounded transition-all"
            >
              Open Workspace →
            </button>
          </div>
        </div>,
        {
          position: "bottom-right",
          style: {
            background: "#0f172a",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          },
          duration: 6000,
        },
      );
      console.log(
        "🔄 [Team Matrix Reset] Invalidating projects query client caches...",
      );
      queryClient.invalidateQueries({ queryKey: ["projects-data"] });
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      queryClient.refetchQueries({ type: "active" });
    };
    socket.on("project:team_updated", handleProjectTeamUpdated);
    return () => {
      socket.off("project:team_updated", handleProjectTeamUpdated);
    };
  }, [socket, queryClient, navigate]);

  return <>{children}</>;
};

export default GlobalSocketWrapper;
