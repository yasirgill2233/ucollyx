import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  MessageSquare,
  MoreVertical,
  Search,
  Paperclip,
  Send,
  X,
  ShieldAlert,
} from "lucide-react";
import {
  useAddComment,
  useAssignedIssues,
  useUpdateIssueStatus,
} from "../../../../hooks/useIssues";

// --- 1. Update Status Modal (Fully Functional) ---
const UpdateStatusModal = ({ isOpen, onClose, issue }) => {
  const [selectedStatus, setSelectedStatus] = useState(
    issue?.status || "Resolved",
  );
  const [note, setNote] = useState("");
  const updateStatusMutation = useUpdateIssueStatus();

  if (!isOpen) return null;

  const handleSubmit = () => {
    updateStatusMutation.mutate(
      { issueId: issue.id, status: selectedStatus, note },
      {
        onSuccess: () => {
          onClose();
          setNote("");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-[200] w-[100%] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-md shadow-xl p-6 border w-[90%] md:w-[30%] border-slate-100 animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Update Status
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <p className="text-[13px] text-slate-500 mb-6 font-medium">
          Updating resolution for{" "}
          <span className="text-blue-600 font-bold">#{issue?.id}</span>
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              New Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-4 py-3 text-sm font-bold outline-none focus:ring-2 ring-blue-500/10 focus:border-blue-500 transition-all appearance-none bg-white"
            >
              {["Acknowledged", "In Progress", "Ready for QA"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Internal Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-4 py-3 text-sm h-28 resize-none outline-none focus:ring-2 ring-blue-500/10 focus:border-blue-500 font-medium"
              placeholder="Describe the progress or fix details..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 rounded-md text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={updateStatusMutation.isPending}
            className="flex-1 py-3 bg-blue-600 text-white rounded-md text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-50"
          >
            {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 2. Issue Detail Modal (Safeguarded Deep Read) ---
const IssueDetailModal = ({ isOpen, onClose, issue }) => {
  const [showUpdate, setShowUpdate] = useState(false);

  if (!isOpen || !issue) return null;

  // DB text string split safely handling
  const stepsArray =
    typeof issue?.steps_to_repro === "string"
      ? issue.steps_to_repro.split("\n")
      : [];

  console.log(issue);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-md shadow-2xl relative max-h-[94vh] flex flex-col overflow-hidden border border-white">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 z-10 p-2 bg-slate-50 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="flex gap-2 mb-6">
            <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1.5 rounded-md tracking-widest uppercase">
              BUG-#{issue.id}
            </span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-black text-slate-900 mb-3 leading-tight tracking-tight">
                {issue.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <span>
                  Module:{" "}
                  <span className="text-slate-700">
                    {issue.module || "General"}
                  </span>
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>
                  Reporter:{" "}
                  <span className="text-slate-700">
                    {issue.reporter?.full_name || "QA Engineer"}
                  </span>
                </span>
                <span>
                  Project:{" "}
                  <span className="text-slate-700">{issue.project_id}</span>
                </span>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => setShowUpdate(true)}
                className="px-5 py-2.5 border-2 border-slate-100 rounded-md text-xs font-black text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all"
              >
                Update Status
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-8 space-y-10">
              {issue.description && (
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <ShieldAlert size={14} className="text-orange-500" />{" "}
                    Description / Notes
                  </h3>
                  <div className="bg-orange-50/50 border-l-4 border-orange-400 rounded-md p-6 text-[14px] text-orange-900 leading-relaxed font-semibold italic">
                    "{issue.description}"
                  </div>
                </section>
              )}

              {stepsArray.length > 0 && (
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">
                    Steps to Reproduce
                  </h3>
                  <div className="space-y-4">
                    {stepsArray.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 text-[14px] text-slate-700 font-bold"
                      >
                        <span className="w-6 h-6 bg-red-500 text-white rounded-md flex items-center justify-center text-[11px] font-black shrink-0 shadow-sm">
                          {idx + 1}
                        </span>
                        {step}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                  Expected vs Actual
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/40 border border-emerald-100 rounded-md p-6">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-3 flex items-center gap-2">
                      <CheckCircle2 size={12} /> Expected
                    </h4>
                    <p className="text-[14px] text-slate-800 font-bold leading-snug">
                      {issue.expected_result || "No specific details provided."}
                    </p>
                  </div>
                  <div className="bg-red-50/40 border border-red-100 rounded-md p-6">
                    <h4 className="text-[10px] font-black text-red-600 uppercase mb-3 flex items-center gap-2">
                      <AlertCircle size={12} /> Actual
                    </h4>
                    <p className="text-[14px] text-slate-800 font-bold leading-snug">
                      {issue.actual_result || "No specific metrics captured."}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-8">
              <div className="bg-white border border-slate-100 rounded-md p-6 shadow-sm space-y-5">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Card Info
                </h3>
                <div className="space-y-4">
                  <InfoRow
                    label="Severity"
                    value={issue.severity}
                    valueClass={
                      issue.severity === "Critical"
                        ? "text-red-600"
                        : "text-slate-700"
                    }
                  />
                  <InfoRow
                    label="Environment"
                    value={issue.environment || "Staging"}
                  />
                  <InfoRow
                    label="Raised At"
                    value={
                      issue.created_at
                        ? new Date(issue.created_at).toLocaleDateString()
                        : "Recently"
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showUpdate && (
        <UpdateStatusModal
          isOpen={showUpdate}
          onClose={() => setShowUpdate(false)}
          issue={issue}
        />
      )}
    </div>
  );
};

// --- 3. Comments Modal (Discussion View Hub) ---
const CommentsModal = ({ isOpen, onClose, issue }) => {
  console.log("Comment Comment Comment:::", issue);

  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState([]);
  const chatEndRef = useRef(null);

  // Hook Connection (Jo parent standard module layout ko access karega)
  const addCommentMutation = useAddComment();

  // 1. Database se incoming comments real-time sync karein
  useEffect(() => {
    if (issue && Array.isArray(issue.comments)) {
      setLocalComments(issue.comments);
    } else {
      setLocalComments([]);
    }
  }, [issue, isOpen]);

  // 2. Chat input block automatic scroll-down handler
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localComments]);

  if (!isOpen || !issue) return null;

  // 3. Database Post Trigger Function
  const handleSend = () => {
    if (!newComment.trim() || addCommentMutation.isPending) return;

    addCommentMutation.mutate(
      {
        issueId: issue.id,
        comment_text: newComment.trim(),
      },
      {
        onSuccess: (response) => {
          // Backend service dynamic snapshot capture
          const savedComment = response.data;

          // Object hierarchy mapping (Log metrics ke mutabiq keys wrap ki hain)
          const structuredComment = {
            id: savedComment?.id || Date.now(),
            comment_text: newComment.trim(),
            createdAt: savedComment?.createdAt || new Date().toISOString(),
            user: savedComment?.user || { full_name: "You" },
          };

          setLocalComments((prev) => [...prev, structuredComment]);
          setNewComment(""); // Writing input area clear karein
        },
        onError: (err) => {
          console.error("Discussion logging failed:", err);
          alert("Failed to submit comment to database workflow pipeline.");
        },
      },
    );
  };

  // 4. Readable Date Utility
  const formatCommentTime = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    return (
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
      " - " +
      date.toLocaleDateString([], { month: "short", day: "numeric" })
    );
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-md shadow-2xl p-8 animate-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-[80vh]">
        {/* Header Setup */}
        <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-50 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-md text-blue-600">
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">
                Discussion
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                Context ID: #{issue.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Dynamic List Rendering (Rendering directly from mapped log structures) */}
        <div className="flex-1 space-y-6 overflow-y-auto mb-6 pr-2 custom-scrollbar min-h-[180px]">
          {localComments.map((c, i) => {
            // Mapping directly using issue data snapshot structure
            const userName = c?.user?.full_name || "Workspace Member";

            return (
              <div
                key={c.id || i}
                className="flex gap-4 group animate-in fade-in duration-150"
              >
                <div className="w-10 h-10 rounded-md bg-slate-50 flex items-center justify-center text-[12px] font-black text-slate-600 shrink-0 border border-slate-200 uppercase select-none">
                  {userName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="text-sm font-black text-slate-800">
                      {userName}
                    </p>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      {formatCommentTime(c.createdAt)}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-md px-5 py-3 text-[13px] text-slate-600 font-medium leading-relaxed break-words shadow-sm">
                    {c.comment_text}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty Safe State Configuration */}
          {localComments.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-10 text-center my-auto">
              <MessageSquare
                size={28}
                className="text-slate-200 mb-2 animate-bounce"
              />
              <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">
                No logs recorded
              </p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Text Form Area */}
        <div className="relative shrink-0 pt-2 border-t border-slate-50">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={addCommentMutation.isPending}
            className="w-full border-2 border-slate-100 rounded-md px-5 py-4 text-sm h-28 resize-none outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400 transition-all font-medium"
            placeholder={
              addCommentMutation.isPending
                ? "Syncing..."
                : "Add a comment or update for QA..."
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={!newComment.trim() || addCommentMutation.isPending}
            className="absolute bottom-4 right-4 bg-blue-600 text-white px-6 py-2 rounded-md text-xs font-black hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center gap-2 disabled:opacity-50 disabled:shadow-none transition-all select-none"
          >
            <Send size={14} />{" "}
            {addCommentMutation.isPending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

// // --- Main Console Dashboard Component ---
// const IssuesDashboard = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [severityFilter, setSeverityFilter] = useState("All");
//   const [openMenuId, setOpenMenuId] = useState(null);
//   const [selectedIssue, setSelectedIssue] = useState(null);
//   const [commentIssue, setCommentIssue] = useState(null);

//   // --- 1. REACT QUERY ASSIGNED LIVE FETCH ---
//   const {
//     data: issues = [],
//     isLoading,
//     isError,
//   } = useAssignedIssues(severityFilter);
//   const updateStatusMutation = useUpdateIssueStatus();

//   // --- 2. CLIENT-SIDE LIVE TEXT FILTERS ---
//   // --- CLIENT-SIDE LIVE SEARCH & SEVERITY FILTERS ---
//   const filteredIssues = useMemo(() => {
//     if (!Array.isArray(issues)) return [];

//     return issues.filter((issue) => {
//       // 1. Search Filter Logic
//       const titleText = issue?.title || "";
//       const matchesSearch = titleText
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase());

//       // 2. Frontend Severity Filter Logic 🔥
//       const bugSeverity = (issue?.severity || "").toUpperCase();
//       const matchesSeverity =
//         severityFilter === "All" ||
//         bugSeverity === severityFilter.toUpperCase();

//       // Dono conditions true hongi to hi record show hoga
//       return matchesSearch && matchesSeverity;
//     });
//   }, [searchTerm, severityFilter, issues]);

//   const handleInlineStatusUpdate = (issueId, nextStatus) => {
//     updateStatusMutation.mutate(
//       {
//         issueId,
//         status: nextStatus,
//         note: "Inline dashboard update status applied.",
//       },
//       { onSuccess: () => setOpenMenuId(null) },
//     );
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-[#F8FAFC]">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 md:p-12 bg-[#F8FAFC] font-sans min-h-screen">
//       <div className="mx-auto">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
//           <div>
//             <h1 className="text-3xl font-black text-slate-900 tracking-tight">
//               Project Health Console
//             </h1>
//             <p className="text-slate-500 font-bold text-sm mt-1">
//               Issues explicitly assigned for your review and resolution
//               pipelines.
//             </p>
//           </div>

//           <div className="flex flex-wrap gap-4 w-full md:w-auto">
//             <div className="relative flex-1 md:w-80">
//               <Search
//                 size={18}
//                 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//               />
//               <input
//                 type="text"
//                 placeholder="Filter by issue title..."
//                 className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-md text-sm font-bold outline-none focus:ring-4 ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm"
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             <select
//               value={severityFilter}
//               className="px-6 py-3 bg-white border border-slate-200 rounded-md text-xs font-black text-slate-600 outline-none cursor-pointer hover:border-slate-300 shadow-sm"
//               onChange={(e) => setSeverityFilter(e.target.value)}
//             >
//               <option value="All">All Severity</option>
//               <option value="Critical">Critical</option>
//               <option value="High">High</option>
//               <option value="Medium">Medium</option>
//               <option value="Low">Low</option>
//             </select>
//           </div>
//         </div>

//         {/* Issues Rendering Table Layout */}
//         <div className="bg-white rounded-md border border-slate-100 shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-slate-50/50 border-b border-slate-100">
//                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
//                     Severity
//                   </th>
//                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
//                     Assigned by
//                   </th>
//                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
//                     Issue Details
//                   </th>
//                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
//                     Status
//                   </th>
//                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-50">
//                 {filteredIssues.length > 0 ? (
//                   filteredIssues.map((issue) => (
//                     <tr
//                       key={issue.id}
//                       className="hover:bg-slate-50/80 transition-all group"
//                     >
//                       <td className="px-8 py-6">
//                         <span
//                           className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-sm inline-block ${
//                             (issue.severity || "").toUpperCase() === "CRITICAL"
//                               ? "bg-red-50 text-red-600 border-red-100"
//                               : "bg-white text-slate-500 border-slate-200"
//                           }`}
//                         >
//                           {issue.severity}
//                         </span>
//                       </td>

//                       <td className="px-8 py-6 max-w-md">
//                         <div className="flex gap-2  items-center">
//                         <div className="rounded-full border border-blue-100 bg-blue-600 w-10 h-10 flex items-center justify-center text-white font-black text-xs shadow-sm uppercase overflow-hidden">
//                           {issue.reporter?.avatar_url ? (
//                             <img
//                               src={
//                                 issue.reporter?.avatar_url
//                               }
//                               alt="Avatar"
//                               crossOrigin="anonymous"
//                               className="w-full h-full object-cover"
//                             />
//                           ) : issue.reporter.full_name ? (
//                             issue.reporter.full_name[0]
//                           ) : (
//                             "U"
//                           )}
//                         </div>
//                         <p className="text-[14px] font-bold text-slate-800 leading-tight mb-1">
//                           {issue.reporter.full_name}
//                         </p>
//                         </div>
//                       </td>

//                       <td className="px-8 py-6 max-w-md">
//                         <p className="text-[14px] font-bold text-slate-800 leading-tight mb-1">
//                           {issue.title}
//                         </p>
//                         <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-tight">
//                           <span>ID: #{issue.id}</span>
//                           <span className="w-1 h-1 bg-slate-300 rounded-full" />
//                           <span>
//                             {issue.created_at
//                               ? new Date(issue.created_at).toLocaleDateString()
//                               : "Recently"}
//                           </span>
//                         </div>
//                       </td>

//                       <td className="px-8 py-6">
//                         <div
//                           className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-tight ${
//                             issue.retest_status === "Failed"
//                               ? "bg-red-50 border-red-100 text-red-600"
//                               : issue.status === "In Progress"
//                                 ? "bg-blue-50 border-blue-100 text-blue-600"
//                                 : issue.status === "Acknowledged"
//                                   ? "bg-emerald-50 border-emerald-100 text-emerald-600"
//                                   : "bg-slate-50 border-slate-100 text-slate-500"
//                           }`}
//                         >
//                           <span
//                             className={`w-1.5 h-1.5 rounded-full ${
//                               issue.retest_status === "Failed"
//                                 ? "bg-red-500"
//                                 : issue.status === "In Progress"
//                                   ? "bg-blue-500"
//                                   : issue.status === "Acknowledged"
//                                     ? "bg-emerald-500"
//                                     : "bg-slate-300"
//                             }`}
//                           />
//                           {issue.retest_status === "Failed"
//                             ? issue.retest_status
//                             : issue.status}
//                         </div>
//                       </td>

//                       <td className="px-8 py-6 text-center">
//                         <div className="flex items-center justify-center gap-3">
//                           <button
//                             onClick={() => setSelectedIssue(issue)}
//                             className="px-5 py-2 bg-blue-600 text-white rounded-md text-[11px] font-bold hover:bg-blue-700 shadow-md transition-all"
//                           >
//                             View
//                           </button>
//                           <button
//                             onClick={() => setCommentIssue(issue)}
//                             className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md border border-transparent transition-all"
//                           >
//                             <MessageSquare size={16} />
//                           </button>

//                           <div className="relative">
//                             <button
//                               onClick={() =>
//                                 setOpenMenuId(
//                                   openMenuId === issue.id ? null : issue.id,
//                                 )
//                               }
//                               className="p-2.5 rounded-md text-slate-400 hover:text-slate-600"
//                             >
//                               <MoreVertical size={18} />
//                             </button>
//                             {openMenuId === issue.id && (
//                               <div className="absolute right-8 bottom-0 mt-3 w-48 bg-white border border-slate-100 rounded-md shadow-xl z-[50] py-2">
                               
//                                 {[
//                                   "Acknowledged",
//                                   "In Progress",
//                                   "Ready for QA",
//                                 ].map((st) => (
//                                   <button
//                                     key={st}
//                                     onClick={() =>
//                                       handleInlineStatusUpdate(issue.id, st)
//                                     }
//                                     className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
//                                   >
//                                     {st}
//                                   </button>
//                                 ))}
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan="5"
//                       className="px-8 py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-wider"
//                     >
//                       No issues matched requirements.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {selectedIssue && (
//         <IssueDetailModal
//           isOpen={!!selectedIssue}
//           onClose={() => setSelectedIssue(null)}
//           issue={selectedIssue}
//         />
//       )}
//       {commentIssue && (
//         <CommentsModal
//           isOpen={!!commentIssue}
//           onClose={() => setCommentIssue(null)}
//           issue={commentIssue}
//         />
//       )}
//     </div>
//   );
// };

const IssuesDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [commentIssue, setCommentIssue] = useState(null);

  // --- 1. REACT QUERY ASSIGNED LIVE FETCH ---
  const {
    data: issues = [],
    isLoading,
    isError,
  } = useAssignedIssues(severityFilter);
  const updateStatusMutation = useUpdateIssueStatus();

  // --- 2. CLIENT-SIDE LIVE TEXT FILTERS ---
  // --- CLIENT-SIDE LIVE SEARCH & SEVERITY FILTERS ---
  const filteredIssues = useMemo(() => {
    if (!Array.isArray(issues)) return [];

    return issues.filter((issue) => {
      // 1. Search Filter Logic
      const titleText = issue?.title || "";
      const matchesSearch = titleText
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // 2. Frontend Severity Filter Logic 🔥
      const bugSeverity = (issue?.severity || "").toUpperCase();
      const matchesSeverity =
        severityFilter === "All" ||
        bugSeverity === severityFilter.toUpperCase();

      // Dono conditions true hongi to hi record show hoga
      return matchesSearch && matchesSeverity;
    });
  }, [searchTerm, severityFilter, issues]);

  const handleInlineStatusUpdate = (issueId, nextStatus) => {
    updateStatusMutation.mutate(
      {
        issueId,
        status: nextStatus,
        note: "Inline dashboard update status applied.",
      },
      { onSuccess: () => setOpenMenuId(null) }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 md:p-12 bg-[#F8FAFC] font-sans min-h-screen">
      <div className="mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Project Health Console
            </h1>
            <p className="text-slate-500 font-bold text-xs sm:text-sm mt-1">
              Issues explicitly assigned for your review and resolution
              pipelines.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Filter by issue title..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-md text-sm font-bold outline-none focus:ring-4 ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={severityFilter}
              className="px-6 py-3 bg-white border border-slate-200 rounded-md text-xs font-black text-slate-600 outline-none cursor-pointer hover:border-slate-300 shadow-sm"
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="All">All Severity</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* 📱 MOBILE VIEW: Cards Layout (< 768px) */}
        <div className="block md:hidden space-y-4">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => {
              const reporterName = issue?.reporter?.full_name || "Unknown User";
              const avatarUrl = issue?.reporter?.avatar_url;

              return (
                <div
                  key={issue.id}
                  className="bg-white rounded-md border border-slate-100 p-5 shadow-sm space-y-4"
                >
                  {/* Top Badges: Severity & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-sm inline-block ${
                        (issue.severity || "").toUpperCase() === "CRITICAL"
                          ? "bg-red-50 text-red-600 border-red-100"
                          : "bg-white text-slate-500 border-slate-200"
                      }`}
                    >
                      {issue.severity || "Low"}
                    </span>

                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-tight ${
                        issue.retest_status === "Failed"
                          ? "bg-red-50 border-red-100 text-red-600"
                          : issue.status === "In Progress"
                          ? "bg-blue-50 border-blue-100 text-blue-600"
                          : issue.status === "Acknowledged"
                          ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                          : "bg-slate-50 border-slate-100 text-slate-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          issue.retest_status === "Failed"
                            ? "bg-red-500"
                            : issue.status === "In Progress"
                            ? "bg-blue-500"
                            : issue.status === "Acknowledged"
                            ? "bg-emerald-500"
                            : "bg-slate-300"
                        }`}
                      />
                      {issue.retest_status === "Failed"
                        ? issue.retest_status
                        : issue.status}
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div>
                    <p className="text-[14px] font-bold text-slate-800 leading-tight mb-1">
                      {issue.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-tight">
                      <span>ID: #{issue.id}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span>
                        {issue.created_at
                          ? new Date(issue.created_at).toLocaleDateString()
                          : "Recently"}
                      </span>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Reporter Info & Action Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex gap-2 items-center min-w-0">
                      <div className="rounded-full border border-blue-100 bg-blue-600 w-9 h-9 flex items-center justify-center text-white font-black text-xs shadow-sm uppercase overflow-hidden shrink-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Avatar"
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          reporterName.charAt(0)
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {reporterName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedIssue(issue)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-[11px] font-bold hover:bg-blue-700 shadow-md transition-all"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setCommentIssue(issue)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md border border-slate-100 transition-all"
                      >
                        <MessageSquare size={16} />
                      </button>

                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === issue.id ? null : issue.id
                            )
                          }
                          className="p-2 rounded-md text-slate-400 hover:text-slate-600 border border-slate-100"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {openMenuId === issue.id && (
                          <div className="absolute right-0 bottom-10 mt-3 w-48 bg-white border border-slate-100 rounded-md shadow-xl z-[50] py-2">
                            {[
                              "Acknowledged",
                              "In Progress",
                              "Ready for QA",
                            ].map((st) => (
                              <button
                                key={st}
                                onClick={() =>
                                  handleInlineStatusUpdate(issue.id, st)
                                }
                                className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-md border border-slate-100 p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
              No issues matched requirements.
            </div>
          )}
        </div>

        {/* 💻 DESKTOP VIEW: Table Layout (≥ 768px) */}
        <div className="hidden md:block bg-white rounded-md border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Severity
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Assigned by
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Issue Details
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Status
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredIssues.length > 0 ? (
                  filteredIssues.map((issue) => (
                    <tr
                      key={issue.id}
                      className="hover:bg-slate-50/80 transition-all group"
                    >
                      <td className="px-8 py-6">
                        <span
                          className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-sm inline-block ${
                            (issue.severity || "").toUpperCase() === "CRITICAL"
                              ? "bg-red-50 text-red-600 border-red-100"
                              : "bg-white text-slate-500 border-slate-200"
                          }`}
                        >
                          {issue.severity}
                        </span>
                      </td>

                      <td className="px-8 py-6 max-w-md">
                        <div className="flex gap-2 items-center">
                          <div className="rounded-full border border-blue-100 bg-blue-600 w-10 h-10 flex items-center justify-center text-white font-black text-xs shadow-sm uppercase overflow-hidden shrink-0">
                            {issue.reporter?.avatar_url ? (
                              <img
                                src={issue.reporter?.avatar_url}
                                alt="Avatar"
                                crossOrigin="anonymous"
                                className="w-full h-full object-cover"
                              />
                            ) : issue.reporter?.full_name ? (
                              issue.reporter.full_name[0]
                            ) : (
                              "U"
                            )}
                          </div>
                          <p className="text-[14px] font-bold text-slate-800 leading-tight mb-1">
                            {issue.reporter?.full_name || "Unknown"}
                          </p>
                        </div>
                      </td>

                      <td className="px-8 py-6 max-w-md">
                        <p className="text-[14px] font-bold text-slate-800 leading-tight mb-1">
                          {issue.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-tight">
                          <span>ID: #{issue.id}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span>
                            {issue.created_at
                              ? new Date(issue.created_at).toLocaleDateString()
                              : "Recently"}
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-tight ${
                            issue.retest_status === "Failed"
                              ? "bg-red-50 border-red-100 text-red-600"
                              : issue.status === "In Progress"
                              ? "bg-blue-50 border-blue-100 text-blue-600"
                              : issue.status === "Acknowledged"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                              : "bg-slate-50 border-slate-100 text-slate-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              issue.retest_status === "Failed"
                                ? "bg-red-500"
                                : issue.status === "In Progress"
                                ? "bg-blue-500"
                                : issue.status === "Acknowledged"
                                ? "bg-emerald-500"
                                : "bg-slate-300"
                            }`}
                          />
                          {issue.retest_status === "Failed"
                            ? issue.retest_status
                            : issue.status}
                        </div>
                      </td>

                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => setSelectedIssue(issue)}
                            className="px-5 py-2 bg-blue-600 text-white rounded-md text-[11px] font-bold hover:bg-blue-700 shadow-md transition-all"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setCommentIssue(issue)}
                            className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md border border-transparent transition-all"
                          >
                            <MessageSquare size={16} />
                          </button>

                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === issue.id ? null : issue.id
                                )
                              }
                              className="p-2.5 rounded-md text-slate-400 hover:text-slate-600"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {openMenuId === issue.id && (
                              <div className="absolute right-8 bottom-0 mt-3 w-48 bg-white border border-slate-100 rounded-md shadow-xl z-[50] py-2">
                                {[
                                  "Acknowledged",
                                  "In Progress",
                                  "Ready for QA",
                                ].map((st) => (
                                  <button
                                    key={st}
                                    onClick={() =>
                                      handleInlineStatusUpdate(issue.id, st)
                                    }
                                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-8 py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-wider"
                    >
                      No issues matched requirements.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedIssue && (
        <IssueDetailModal
          isOpen={!!selectedIssue}
          onClose={() => setSelectedIssue(null)}
          issue={selectedIssue}
        />
      )}
      {commentIssue && (
        <CommentsModal
          isOpen={!!commentIssue}
          onClose={() => setCommentIssue(null)}
          issue={commentIssue}
        />
      )}
    </div>
  );
};


const InfoRow = ({ label, value, valueClass = "text-slate-800" }) => (
  <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
    <span className="text-slate-400 font-bold tracking-tight uppercase text-[10px]">
      {label}
    </span>
    <span className={`font-black ${valueClass}`}>{value}</span>
  </div>
);

export default IssuesDashboard;
