import React, { useMemo } from 'react';
import { X, Mail, AlertTriangle, ListTodo } from 'lucide-react';

const TeamMemberModal = ({ member, onClose, projectData }) => {
  console.log("TeamMemberModal Active Member Data:", member);
  
  if (!member) return null;

  // --- 🔥 FIX: DYNAMICALLY EXTRACT LIVE TASKS FOR THIS ASSIGNEE FROM CONTROLLER DATA ---
  const memberTasks = useMemo(() => {
    // Agar parent se direct projectData structure pass ho raha ho (Jo humne set kiya tha)
    if (projectData && projectData.Tasks) {
      return projectData.Tasks.filter(task => 
        task.assignees && task.assignees.some(assignee => assignee.id === member.id)
      ).map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority
      }));
    }
    
    // Fallback logic: Agar parent components se explicit format na aaye tab bhi blank list crash se bachaegi
    return [];
  }, [projectData, member.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header - Dynamic Color Based on Workload Status */}
        <div className={`p-8 ${member.color} relative`}>
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all">
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-6">
            {/* Dynamic Avatar Block: Image Check */}
            {member.avatar ? (
<img
                    src={member?.avatar}
                    alt="Avatar"
                    crossOrigin="anonymous"
                    className="w-20 h-20 rounded-2xl object-cover border border-white/30 bg-white shadow-md"
                  />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl font-black text-white shadow-md">
                {member.name.split(" ").map(n => n[0]).join("")}
              </div>
            )}
            
            <div className="text-white">
              <h2 className="text-2xl font-black tracking-tight">{member.name}</h2>
              <p className="text-white/80 text-xs font-bold mt-1 flex items-center gap-1.5">
                <Mail size={12} /> {member.email}
              </p>
              <span className="inline-block mt-2 text-[9px] font-black uppercase bg-white/20 text-white px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10">
                {member.role}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 bg-[#fcfcfc] max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Stats Left */}
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Current Projects</h4>
                <div className="flex flex-wrap gap-2">
                  {member.projects && member.projects.map((p, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600 shadow-sm uppercase">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Tasks (Done/Total)</p>
                  <p className="text-lg font-black text-slate-800">{member.tasks}</p>
                </div>
                <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Weekly Hours</p>
                  <p className="text-lg font-black text-slate-800">{member.hours}</p>
                </div>
              </div>
            </div>

            {/* Capacity Right */}
            <div className='flex flex-col gap-2'>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm self-start w-full">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Workload Status ({member.status})</h4>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                    <div className={`${member.color} h-full transition-all duration-1000`} style={{ width: `${Math.min(member.percentage, 100)}%` }} />
                 </div>
                 <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    {member.status === 'Overloaded' 
                      ? "Warning: Capacity critical. High risk of burnout or timeline delay." 
                      : member.status === 'Underutilized' 
                      ? "Available: Member has free buffers to pick pending tickets." 
                      : "Optimal: Member is cruising at healthy sustainable limits."}
                 </p>
              </div>

              {member.status === "Overloaded" && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 items-start animate-pulse">
                  <AlertTriangle className="text-red-500 shrink-0" size={18} />
                  <div>
                    <p className="text-xs font-black text-red-600 uppercase">Attention Required</p>
                    <p className="text-[10px] text-red-500 font-medium mt-1 leading-relaxed">
                      Member is exceeding safe capacity. Consider offloading a few tickets to maintain code review quality.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- DYNAMIC ACTIVE TASKS LIST WORKSPACE --- */}
          <div>
            <div className="flex justify-between items-center mb-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <ListTodo size={14} /> Assigned Active Tasks ({memberTasks.length})
               </h4>
            </div>
            <div className="space-y-2">
              {memberTasks.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-white text-xs text-slate-400 font-bold">
                  No active tasks found inside this current sprint.
                </div>
              ) : (
                memberTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-4 max-w-[70%]">
                      <span className="text-[9px] font-black text-slate-300 group-hover:text-blue-500 truncate shrink-0 max-w-[120px]">
                        {task.id}
                      </span>
                      <p className="text-xs font-bold text-slate-700 truncate">{task.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${
                        task.priority === 'High' ? 'bg-orange-50 text-orange-600' : 
                        task.priority === 'Medium' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
                      }`}>
                        {task.priority || "Low"}
                      </span>
                      <span className={`text-[9px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase tracking-tighter ${
                        task.status === 'inprogress' ? 'bg-blue-50 text-blue-600' :
                        task.status === 'done' ? 'bg-green-50 text-green-600' : 'text-slate-500'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-slate-50 flex justify-end">
          <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg shadow-slate-200 hover:scale-95 transition-all uppercase tracking-widest">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberModal;