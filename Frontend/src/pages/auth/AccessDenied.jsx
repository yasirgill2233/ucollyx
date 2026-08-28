import { XCircle, ArrowLeft, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router";

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f0f2f5] p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-[480px] p-10 border border-gray-100 min-h-[550px] flex flex-col justify-between">
        
        <div className="animate-in slide-in-from-top-4 duration-500 flex flex-col items-center text-center">
          <div className="bg-red-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8">
            <XCircle size={48} className="text-red-500" />
          </div> 
          
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Access Denied</h2>
          <p className="text-slate-400 mt-4 px-6 leading-relaxed font-medium">
            Your request to join was not approved by the administrator.
          </p>

          <div className="w-full bg-red-50/50 border border-red-100 rounded-3xl p-6 mt-10 flex gap-4 text-left">
            <ShieldAlert className="text-red-500 shrink-0" size={20} />
            <div className="space-y-1">
              <h5 className="text-red-800 font-black text-sm uppercase tracking-wider">What happened?</h5>
              <p className="text-red-700/70 text-xs leading-relaxed font-bold">
                The admin might have reached the team limit or the request was marked as invalid.
              </p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/workspace-selection')}
            className="w-full mt-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
          >
            Find Another Workspace <ArrowLeft size={20} />
          </button>
          
          <button className="mt-6 text-slate-400 text-xs font-bold hover:text-indigo-600 transition-all uppercase tracking-widest">
            Contact Support
          </button>
        </div>

        <p className="text-[10px] text-center font-black text-slate-300 uppercase tracking-[0.3em]">
          UCollyx Security Protocol
        </p>
      </div>
    </div>
  );
}