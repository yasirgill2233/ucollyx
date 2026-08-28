import { useState } from "react";

export const TranscriptWrapper = ({ transcript }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all duration-300">
      <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">
        Meeting Transcript & Summary
      </p>
      
      {/* 
        isExpanded true hone par 'line-clamp-none' call hoga jo poora text dikhayega, 
        aur italic ke bajaye normal read ho sakega jab open ho.
      */}
      <p className={`text-xs text-slate-600 transition-all duration-300 ${
        isExpanded ? "line-clamp-none whitespace-pre-line" : "line-clamp-2 italic"
      }`}>
        "{transcript}"
      </p>

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-[#3b59ff] text-[10px] font-black hover:underline uppercase tracking-wide block cursor-pointer"
      >
        {isExpanded ? "▲ SHOW LESS" : "▼ READ FULL SUMMARY"}
      </button>
    </div>
  );
};