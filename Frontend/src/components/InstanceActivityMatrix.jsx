import React from 'react';
import { 
  History, 
  ArrowRight, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  PlusCircle, 
  Trash2, 
  RefreshCw 
} from 'lucide-react';

// Helper function to format ISO string (e.g., "2026-08-14T11:15:00Z") to relative time
const getRelativeTime = (timestamp) => {
  if (!timestamp) return 'JUST NOW';
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}S AGO`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}M AGO`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}H AGO`;
  return `${Math.floor(diffInSeconds / 86400)}D AGO`;
};

// Helper function to choose dynamic icons based on log action / severity level
const getLogBadge = (level, actionType = '') => {
  const type = actionType.toLowerCase();

  if (level === 'error') {
    return <AlertCircle size={14} className="text-red-500" />;
  }
  if (type.includes('create') || type.includes('add')) {
    return <PlusCircle size={14} className="text-emerald-500" />;
  }
  if (type.includes('delete') || type.includes('remove')) {
    return <Trash2 size={14} className="text-rose-500" />;
  }
  if (type.includes('update') || type.includes('change')) {
    return <RefreshCw size={14} className="text-amber-500" />;
  }
  return <Info size={14} className="text-[#3b59ff]" />;
};

export default function InstanceActivityMatrix({ logs = [], onQueryFullLogs }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-md shadow-sm border-gray-100 p-8 border lg:col-span-2 flex flex-col justify-between">
      <div>
        <div className="space-y-1 mb-8">
          <h3 className="text-base font-black text-[#1a1d2f] flex items-center gap-2">
            <History size={16} className="text-gray-700" /> Instance Activity Matrix
          </h3>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
            Real-time tracking of infrastructure mutations
          </p>
        </div>

        <div className="space-y-5 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
          {logs && logs.length > 0 ? (
            logs.map((item, index) => {
              const logId = item.id || item._id || index;
              const actor = item.actor || item.email || 'System';
              const actionText = item.message || item.description || item.action || 'Performed an operation';
              const timeDisplay = getRelativeTime(item.timestamp || item.created_at);

              return (
                <div 
                  key={logId} 
                  className="flex gap-4.5 items-start relative z-10 animate-in fade-in duration-200"
                >
                  <div className="w-8 h-8 bg-white border border-gray-100 rounded-md shadow-sm flex items-center justify-center text-xs shrink-0">
                    {getLogBadge(item.level, item.action_type || item.message)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-700 leading-tight">
                      <span className="text-[#3b59ff] font-black">{actor}</span>{' '}
                      {actionText}
                    </p>
                    <span className="text-[9px] font-bold text-gray-400 mt-0.5 block uppercase tracking-wider font-mono">
                      {timeDisplay}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-xs font-bold text-gray-400">
              No recent activity recorded.
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={onQueryFullLogs}
        className="mt-10 text-xs font-black text-[#3b59ff] hover:text-[#2a44d4] flex items-center gap-1.5 border-t border-gray-100/70 pt-4 cursor-pointer"
      >
        <span>Query Full Activity Logs</span> <ArrowRight size={14} />
      </button>
    </div>
  );
}