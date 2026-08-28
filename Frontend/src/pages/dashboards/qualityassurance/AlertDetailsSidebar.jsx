// import React, { useState, useEffect, useRef } from 'react';
// import { X, Clock, User, MessageSquare, List, History, ShieldAlert, AlertCircle, Send } from 'lucide-react';
// // Hooks import (Aapki routing hierarchy ke mutabiq use karein)
// import { useAddComment } from '../../../hooks/useIssues'; 

// const AlertDetailsSidebar = ({ alert, onClose }) => {
//   const [activeTab, setActiveTab] = useState('Details');

//   if (!alert) return null;

//   // Severity based colors for the sidebar accent
//   const severityColor = alert.severity === 'CRITICAL' ? 'text-red-600' : 
//                        alert.severity === 'HIGH' ? 'text-orange-500' : 'text-blue-500';
  
//   const severityBg = alert.severity === 'CRITICAL' ? 'bg-red-50' : 
//                     alert.severity === 'HIGH' ? 'bg-orange-50' : 'bg-blue-50';

//   // Total comments length safe extraction for the tab badge
//   const totalComments = Array.isArray(alert.comments) ? alert.comments.length : 0;

//   return (
//     <div className="fixed inset-0 z-50 overflow-hidden">
//       {/* Background Overlay */}
//       <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" onClick={onClose} />
      
//       {/* Sidebar Panel */}
//       <div className="absolute inset-y-0 right-0 w-[30%] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
        
//         {/* Header */}
//         <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-white sticky top-0 z-10">
//           <div>
//             <div className="flex items-center gap-2 mb-2">
//               <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${alert.statusStyle}`}>
//                 {alert.status}
//               </span>
//               <span className="text-[10px] text-slate-300 font-bold italic">#{alert.id}</span>
//             </div>
//             <h2 className="font-black text-slate-800 text-lg leading-tight uppercase tracking-tight">
//               {alert.title}
//             </h2>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors group">
//             <X className="text-slate-400 group-hover:text-slate-600" size={20} />
//           </button>
//         </div>

//         {/* Tab Navigation */}
//         <div className="flex px-6 border-b border-slate-100 bg-slate-50/30">
//           {[
//             { name: 'Details', icon: <List size={14}/> },
//             { name: 'Timeline', icon: <History size={14}/> },
//             { name: 'Comments', icon: <MessageSquare size={14}/> }
//           ].map((tab) => (
//             <button 
//               key={tab.name}
//               onClick={() => setActiveTab(tab.name)}
//               className={`flex items-center gap-2 py-4 px-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 relative ${
//                 activeTab === tab.name ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'
//               }`}
//             >
//               {tab.icon}
//               {tab.name}
//               {tab.name === 'Comments' && (
//                 <span className="ml-1 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md text-[8px] font-black">
//                   {totalComments}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>

//         {/* Content Area */}
//         <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
//           {/* TAB 1: DETAILS */}
//           {activeTab === 'Details' && (
//             <div className="space-y-8">
//               {/* Project Info */}
//               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
//                 <div>
//                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Project / Module</p>
//                   <p className="text-xs font-bold text-slate-700">{alert.platform || alert.project?.name} • {alert.module}</p>
//                 </div>
//                 <div className={`p-2 rounded-xl ${severityBg} ${severityColor}`}>
//                   {alert.severity === 'CRITICAL' ? <ShieldAlert size={18}/> : <AlertCircle size={18}/>}
//                 </div>
//               </div>

//               {/* Steps Section */}
//               <div>
//                 <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-[0.15em] flex items-center gap-2">
//                    <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
//                    Steps to Reproduce
//                 </h4>
//                 <div className="space-y-3">
//                   {alert.steps && alert.steps.length > 0 ? alert.steps.map((step, index) => (
//                     <div key={index} className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-slate-200 transition-colors">
//                       <span className="text-[10px] font-black text-blue-400 bg-blue-50 w-5 h-5 flex items-center justify-center rounded-lg shrink-0 italic">
//                         {index + 1}
//                       </span>
//                       <p className="text-[11px] font-bold text-slate-600 leading-relaxed">{step}</p>
//                     </div>
//                   )) : (
//                     <p className="text-[11px] text-slate-400 italic">No specific steps provided.</p>
//                   )}
//                 </div>
//               </div>

//               {/* Results Grid */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
//                   <h5 className="text-[9px] font-black text-emerald-700 uppercase mb-2 tracking-widest">Expected Result</h5>
//                   <p className="text-[10px] font-bold text-slate-600 leading-snug">{alert.expected_result || alert.expected || "Result not defined."}</p>
//                 </div>
//                 <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100">
//                   <h5 className="text-[9px] font-black text-red-700 uppercase mb-2 tracking-widest">Observed Bug</h5>
//                   <p className="text-[10px] font-bold text-slate-600 leading-snug">{alert.actual_result || alert.actual || alert.title}</p>
//                 </div>
//               </div>

//               {/* Current Assignee */}
//               <div>
//                 <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Ownership</h4>
//                 <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center text-[12px] font-black italic uppercase shadow-lg shadow-slate-200">
//                       {(alert.assignee?.full_name || alert.user || 'U').charAt(0)}
//                     </div>
//                     <div>
//                       <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
//                         {alert.assignee?.full_name || alert.user || "Unassigned"}
//                       </p>
//                       <p className="text-[9px] font-bold text-slate-400 uppercase">{alert.module || "General"} Developer</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
//                     <Clock size={12} />
//                     <span className="text-[9px] font-black">{alert.time || "Just now"}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* TAB 2: TIMELINE */}
//           {activeTab === 'Timeline' && (
//             <div className="space-y-6 pt-2">
//                <TimelineItem title="Alert Created" time={alert.time || "Just now"} user={alert.reporter?.full_name || "System"} status="RAISED" isLast={false} />
//                <TimelineItem title="Assigned to Dev" time="Active" user={alert.assignee?.full_name || alert.user} status="ASSIGNED" isLast={true} />
//             </div>
//           )}

//           {/* TAB 3: DYNAMIC COMMENTS SECTION */}
//           {activeTab === 'Comments' && (
//             <CommentsSection alert={alert} />
//           )}

//         </div>
//       </div>
//     </div>
//   );
// };

// // ====================================================================
// // 🛠️ INTERNAL SUB-COMPONENT: COMMENTS ENGINE (Bina Export Ke)
// // ====================================================================
// const CommentsSection = ({ alert }) => {
//   const [newComment, setNewComment] = useState("");
//   const [localComments, setLocalComments] = useState([]);
//   const chatEndRef = useRef(null);

//   const addCommentMutation = useAddComment();

//   // 1. Sync comments array directly from incoming database item structure
//   useEffect(() => {
//     if (alert && Array.isArray(alert.comments)) {
//       setLocalComments(alert.comments);
//     } else {
//       setLocalComments([]);
//     }
//   }, [alert]);

//   // 2. Chat window scrolling anchor
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [localComments]);

//   const handleSendComment = () => {
//     if (!newComment.trim() || addCommentMutation.isPending) return;

//     addCommentMutation.mutate(
//       {
//         issueId: alert.id,
//         comment_text: newComment.trim()
//       },
//       {
//         onSuccess: (response) => {
//           const savedComment = response.data;

//           // Align frontend data elements safely with data structure format
//           const structuredComment = {
//             id: savedComment?.id || Date.now(),
//             comment_text: newComment.trim(),
//             createdAt: savedComment?.createdAt || new Date().toISOString(),
//             user: savedComment?.user || { full_name: "You" }
//           };

//           setLocalComments(prev => [...prev, structuredComment]);
//           setNewComment(""); // Reset target input comment_textarea
//         },
//         onError: (err) => {
//           console.error("Failed to append audit trace:", err);
//           alert("Error syncing discussion parameter back to infrastructure.");
//         }
//       }
//     );
//   };

//   const formatTime = (dateString) => {
//     if (!dateString) return "Just now";
//     const date = new Date(dateString);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   return (
//     <div className="flex flex-col h-full space-y-6">
//       {/* Scrollable feed box wrapper */}
//       <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
//         {localComments.map((c, i) => {
//           const authorName = c?.user?.full_name || "Workspace Member";
//           return (
//             <div key={c.id || i} className="flex gap-3 animate-in fade-in duration-150">
//               <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 border border-slate-200 shrink-0 uppercase">
//                 {authorName.charAt(0)}
//               </div>
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-baseline justify-between mb-1">
//                   <h5 className="text-[11px] font-black text-slate-800 truncate">{authorName}</h5>
//                   <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight shrink-0">
//                     {formatTime(c.createdAt)}
//                   </span>
//                 </div>
//                 <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 text-[11px] font-bold text-slate-600 leading-relaxed break-words shadow-sm">
//                   {c.comment_text}
//                 </div>
//               </div>
//             </div>
//           );
//         })}

//         {localComments.length === 0 && (
//           <div className="bg-blue-50/30 border border-blue-100 p-4 rounded-2xl text-center py-8">
//             <MessageSquare size={20} className="mx-auto text-blue-300 mb-2 animate-pulse" />
//             <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">No Activity Logs</p>
//             <p className="text-[11px] font-bold text-slate-400 italic mt-0.5">Be the first to provide log feedback.</p>
//           </div>
//         )}
//         <div ref={chatEndRef} />
//       </div>

//       {/* Embedded Submission Form Box */}
//       <div className="border-t border-slate-100 pt-4 relative">
//         <textarea 
//           value={newComment}
//           onChange={(e) => setNewComment(e.target.value)}
//           disabled={addCommentMutation.isPending}
//           placeholder={addCommentMutation.isPending ? "Syncing..." : "Write a message to the developer..."}
//           className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500/10 outline-none resize-none transition-all placeholder:text-slate-300 disabled:opacity-50"
//           onKeyDown={(e) => {
//             if (e.key === 'Enter' && !e.shiftKey) {
//               e.preventDefault();
//               handleSendComment();
//             }
//           }}
//         />
//         <div className="flex gap-3 mt-2">
//           <button 
//             onClick={handleSendComment}
//             disabled={!newComment.trim() || addCommentMutation.isPending}
//             className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-black transition-all shadow-lg shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
//           >
//             <Send size={12} /> {addCommentMutation.isPending ? "Sending..." : "Send Comment"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ====================================================================
// // 🕒 TIMELINE SUB-COMPONENT
// // ====================================================================
// const TimelineItem = ({ title, time, user, status, isLast }) => (
//   <div className="relative pl-10">
//     {!isLast && <div className="absolute left-[11px] top-6 bottom-[-24px] w-[1.5px] bg-slate-100" />}
//     <div className={`absolute left-0 top-1 w-6 h-6 rounded-lg border-2 border-white shadow-md flex items-center justify-center z-10 ${status === 'RAISED' ? 'bg-red-500' : 'bg-blue-500'}`}>
//        <div className="w-1.5 h-1.5 bg-white rounded-full" />
//     </div>
//     <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm group hover:border-slate-300 transition-colors">
//       <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${status === 'RAISED' ? 'text-red-500' : 'text-blue-500'}`}>{title}</h4>
//       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
//         {time} <span className="mx-1 text-slate-200">•</span> BY <span className="text-slate-600 font-black italic">{user || "System"}</span>
//       </p>
//     </div>
//   </div>
// );

// export default AlertDetailsSidebar;



import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, MessageSquare, List, History, ShieldAlert, AlertCircle, Send } from 'lucide-react';
// Hooks import (Aapki routing hierarchy ke mutabiq use karein)
import { useAddComment } from '../../../hooks/useIssues'; 

const AlertDetailsSidebar = ({ alert, onClose }) => {
  const [activeTab, setActiveTab] = useState('Details');

  if (!alert) return null;

  // Severity based colors for the sidebar accent
  const severityColor = alert.severity === 'CRITICAL' ? 'text-red-600' : 
                       alert.severity === 'HIGH' ? 'text-orange-500' : 'text-blue-500';
  
  const severityBg = alert.severity === 'CRITICAL' ? 'bg-red-50 border-red-200' : 
                    alert.severity === 'HIGH' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200';

  const totalComments = Array.isArray(alert.comments) ? alert.comments.length : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Dynamic Backdrop with Fade */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px] transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      {/* 📱 Mobile Native Drawer Panel: Full Width on Mobile, Adaptive Sheet on Desktop */}
      <div className="relative w-full sm:max-w-md lg:max-w-lg bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300 border-l border-slate-200">
        
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-5 border-b border-slate-100 flex items-start justify-between bg-white sticky top-0 z-20 shrink-0">
          <div className="pr-3 min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${alert.statusStyle || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                {alert.status || 'NEW'}
              </span>
              <span className="text-[10px] text-slate-400 font-extrabold italic">#{alert.id}</span>
            </div>
            <h2 className="font-black text-slate-800 text-base sm:text-lg leading-tight uppercase tracking-tight break-words">
              {alert.title}
            </h2>
          </div>

          {/* Touch-optimized Close Button */}
          <button 
            onClick={onClose} 
            className="p-2 -mr-1 -mt-1 rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0 text-slate-400 hover:text-slate-600"
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Responsive Tab Bar (Touch Scrollable) */}
        <div className="flex px-2 sm:px-6 border-b border-slate-100 bg-slate-50/60 overflow-x-auto no-scrollbar shrink-0">
          {[
            { name: 'Details', icon: <List size={15}/> },
            { name: 'Timeline', icon: <History size={15}/> },
            { name: 'Comments', icon: <MessageSquare size={15}/> }
          ].map((tab) => (
            <button 
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 py-3 px-3.5 sm:py-3.5 sm:px-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 shrink-0 select-none ${
                activeTab === tab.name ? 'text-blue-600 border-blue-600 bg-white/50' : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
              {tab.name === 'Comments' && (
                <span className="ml-0.5 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-[8px] font-black">
                  {totalComments}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          
          {/* TAB 1: DETAILS */}
          {activeTab === 'Details' && (
            <div className="space-y-6">
              
              {/* Project / Module Badge */}
              <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="min-w-0 pr-2">
                  <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Project / Module</p>
                  <p className="text-xs font-bold text-slate-700 truncate mt-0.5">
                    {alert.platform || alert.project?.name || "System"} • {alert.module || "General"}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl border ${severityBg} ${severityColor} shrink-0`}>
                  {alert.severity === 'CRITICAL' ? <ShieldAlert size={18}/> : <AlertCircle size={18}/>}
                </div>
              </div>

              {/* Steps Section */}
              <div>
                <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.15em] flex items-center gap-2">
                   <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                   Steps to Reproduce
                </h4>
                <div className="space-y-2.5">
                  {alert.steps && alert.steps.length > 0 ? alert.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2.5 p-3 bg-white border border-slate-100 rounded-xl shadow-2xs">
                      <span className="text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 w-5 h-5 flex items-center justify-center rounded-lg shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-[11px] font-semibold text-slate-600 leading-relaxed break-words min-w-0 flex-1">{step}</p>
                    </div>
                  )) : (
                    <p className="text-[11px] text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                      No specific steps provided.
                    </p>
                  )}
                </div>
              </div>

              {/* Results Section Grid (Stacks vertically on extra small screens) */}
              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <h5 className="text-[8px] sm:text-[9px] font-black text-emerald-700 uppercase mb-1 tracking-widest">Expected Result</h5>
                  <p className="text-[10px] font-semibold text-slate-600 leading-snug break-words">
                    {alert.expected_result || alert.expected || "Result not defined."}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-100">
                  <h5 className="text-[8px] sm:text-[9px] font-black text-red-700 uppercase mb-1 tracking-widest">Observed Bug</h5>
                  <p className="text-[10px] font-semibold text-slate-600 leading-snug break-words">
                    {alert.actual_result || alert.actual || alert.title}
                  </p>
                </div>
              </div>

              {/* Ownership Card */}
              <div>
                <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase mb-2.5 tracking-widest">Ownership</h4>
                <div className="flex items-center justify-between p-3.5 border border-slate-100 rounded-2xl bg-white shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-9 h-9 bg-slate-800 text-white rounded-xl flex items-center justify-center text-[11px] font-black italic uppercase shrink-0 shadow-xs">
                      {(alert.assignee?.full_name || alert.user || 'U').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">
                        {alert.assignee?.full_name || alert.user || "Unassigned"}
                      </p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase truncate">
                        {alert.module || "General"} Developer
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 shrink-0">
                    <Clock size={11} />
                    <span className="text-[9px] font-black">{alert.time || "Just now"}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'Timeline' && (
            <div className="space-y-4 pt-1">
               <TimelineItem title="Alert Created" time={alert.time || "Just now"} user={alert.reporter?.full_name || "System"} status="RAISED" isLast={false} />
               <TimelineItem title="Assigned to Dev" time="Active" user={alert.assignee?.full_name || alert.user} status="ASSIGNED" isLast={true} />
            </div>
          )}

          {/* TAB 3: COMMENTS */}
          {activeTab === 'Comments' && (
            <CommentsSection alert={alert} />
          )}

        </div>
      </div>
    </div>
  );
};

// ====================================================================
// 💬 INTERNAL SUB-COMPONENT: MOBILE-NATIVE COMMENTS CHAT
// ====================================================================
const CommentsSection = ({ alert }) => {
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState([]);
  const chatEndRef = useRef(null);

  const addCommentMutation = useAddComment();

  useEffect(() => {
    if (alert && Array.isArray(alert.comments)) {
      setLocalComments(alert.comments);
    } else {
      setLocalComments([]);
    }
  }, [alert]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localComments]);

  const handleSendComment = () => {
    if (!newComment.trim() || addCommentMutation.isPending) return;

    addCommentMutation.mutate(
      {
        issueId: alert.id,
        comment_text: newComment.trim()
      },
      {
        onSuccess: (response) => {
          const savedComment = response.data;

          const structuredComment = {
            id: savedComment?.id || Date.now(),
            comment_text: newComment.trim(),
            createdAt: savedComment?.createdAt || new Date().toISOString(),
            user: savedComment?.user || { full_name: "You" }
          };

          setLocalComments(prev => [...prev, structuredComment]);
          setNewComment("");
        },
        onError: (err) => {
          console.error("Failed to append audit trace:", err);
        }
      }
    );
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Scrollable Chat Feed */}
      <div className="space-y-3 max-h-[380px] sm:max-h-[440px] overflow-y-auto pr-1 custom-scrollbar pb-2">
        {localComments.map((c, i) => {
          const authorName = c?.user?.full_name || "Workspace Member";
          return (
            <div key={c.id || i} className="flex gap-2.5 animate-in fade-in duration-150">
              <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-600 border border-slate-200 shrink-0 uppercase">
                {authorName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                  <h5 className="text-[10px] font-black text-slate-800 truncate pr-2">{authorName}</h5>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight shrink-0">
                    {formatTime(c.createdAt)}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-3.5 py-2 text-[11px] font-semibold text-slate-600 leading-relaxed break-words shadow-2xs">
                  {c.comment_text}
                </div>
              </div>
            </div>
          );
        })}

        {localComments.length === 0 && (
          <div className="bg-blue-50/40 border border-blue-100 p-5 rounded-2xl text-center py-8">
            <MessageSquare size={20} className="mx-auto text-blue-300 mb-2 animate-pulse" />
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">No Activity Logs</p>
            <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">Be the first to leave feedback.</p>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Sticky Bottom Textarea & Action */}
      <div className="border-t border-slate-100 pt-3 relative bg-white sticky bottom-0">
        <textarea 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={addCommentMutation.isPending}
          placeholder={addCommentMutation.isPending ? "Syncing..." : "Type your update..."}
          className="w-full h-20 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all placeholder:text-slate-400 disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendComment();
            }
          }}
        />
        <button 
          onClick={handleSendComment}
          disabled={!newComment.trim() || addCommentMutation.isPending}
          className="w-full mt-2 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] active:scale-[0.98] hover:bg-black transition-all shadow-md disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Send size={12} /> 
          <span>{addCommentMutation.isPending ? "Syncing..." : "Send Comment"}</span>
        </button>
      </div>
    </div>
  );
};

// ====================================================================
// 🕒 TIMELINE ITEM
// ====================================================================
const TimelineItem = ({ title, time, user, status, isLast }) => (
  <div className="relative pl-8 sm:pl-9">
    {!isLast && <div className="absolute left-[11px] top-5 bottom-[-20px] w-[1.5px] bg-slate-100" />}
    <div className={`absolute left-0 top-1 w-5 h-5 rounded-lg border-2 border-white shadow-xs flex items-center justify-center z-10 ${status === 'RAISED' ? 'bg-red-500' : 'bg-blue-500'}`}>
       <div className="w-1 h-1 bg-white rounded-full" />
    </div>
    <div className="bg-white border border-slate-100 rounded-2xl p-3 sm:p-3.5 shadow-2xs">
      <h4 className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${status === 'RAISED' ? 'text-red-500' : 'text-blue-500'}`}>{title}</h4>
      <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
        {time} <span className="mx-1 text-slate-200">•</span> BY <span className="text-slate-600 font-black italic">{user || "System"}</span>
      </p>
    </div>
  </div>
);

export default AlertDetailsSidebar;