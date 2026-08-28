const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
      {/* Outer Glowing Ring */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-20 h-20 border-4 border-blue-500/20 rounded-2xl animate-pulse"></div>
        
        {/* Main Spinning Square (Modern Look) */}
        <div className="w-12 h-12 border-4 border-t-blue-600 border-r-blue-600 border-l-slate-100 border-b-slate-100 rounded-xl animate-spin shadow-lg shadow-blue-200"></div>
      </div>

      {/* Text Animation */}
      <div className="mt-8 text-center">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] animate-pulse">
          Loading
        </h3>
        <p className="text-[10px] font-bold text-slate-400 mt-2 italic uppercase tracking-widest">
          Preparing your workspace...
        </p>
      </div>

      {/* Bottom Progress Bar (Fake but smooth) */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50 overflow-hidden">
        <div className="h-full bg-blue-600 animate-[loading_2s_ease-in-out_infinite] w-1/3"></div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;