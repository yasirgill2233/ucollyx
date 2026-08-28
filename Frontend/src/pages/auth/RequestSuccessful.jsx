import React from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  Clock, 
  Inbox, 
  ShieldCheck,
  Cpu
} from "lucide-react";
import { useNavigate } from "react-router";

export default function RequestSuccessful() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc] font-sans overflow-hidden">
    
      <div className="w-full lg:w-[55%] flex flex-col justify-between p-8 md:p-14 lg:p-20 bg-white relative z-10 overflow-y-auto">

        <div className="w-full max-w-xl mx-auto my-auto py-10 animate-in fade-in zoom-in-95 duration-500 space-y-8">
          
          {/* Main Informative Block */}
          <div className="space-y-4">
            <div className="bg-emerald-500/10 w-16 h-16 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner border border-emerald-500/10 mb-2">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>
            
            <h1 className="text-3xl font-black text-[#1a1d2f] tracking-tight">
              Access Request Transmitted!
            </h1>
            
            <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
              Your decentralized handshake identity cluster packet has been safely transmitted directly to the master workspace administrator queue for verification controls.
            </p>
          </div>

          {/* Interactive Info Meta Rows */}
          <div className="space-y-3">
            {/* Warning / Pending State Alert Card */}
            <div className="w-full bg-[#fffbeb] border border-amber-200/60 rounded-xl p-4.5 flex gap-4 text-left shadow-sm">
              <span className="text-xl shrink-0 mt-0.5">⌛</span>
              <div className="space-y-1">
                <h5 className="text-amber-900 font-black text-xs uppercase tracking-wider">Awaiting Root Signature</h5>
                <p className="text-amber-800/80 text-xs leading-relaxed font-medium">
                  Meanwhile, you can request the instance owner to bypass this step by dispatching a direct email invite target onto your account profile for instant authorization.
                </p>
              </div>
            </div>

            {/* Email Notification Metadata Box */}
            <div className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl p-4 flex items-center gap-4 text-left">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                <Inbox size={16} />
              </div>
              <div>
                <h5 className="text-[#1a1d2f] font-bold text-xs">Email Telemetry Notification</h5>
                <p className="text-gray-400 text-xs mt-0.5">A secure approval status link will be dispatched to your login mailbox context.</p>
              </div>
            </div>
          </div>

          {/* Action Navigation Controls */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button 
              onClick={() => navigate('/workspace-selection')} 
              className="px-6 py-3.5 bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all duration-200 order-2 sm:order-1"
            >
              <ArrowLeft size={16} /> Change Gateway Target
            </button>
            
            <button 
              onClick={() => navigate('/login')}
              className="flex-1 py-3.5 bg-gradient-to-r from-[#3b59ff] to-[#8a2be2] hover:opacity-95 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg order-1 sm:order-2"
            >
              <span>Return to Core Base</span> <ArrowRight size={16} />
            </button>
          </div>

        </div>

        {/* Footer Meta */}
        <p className="text-center lg:text-left text-xs text-gray-400 font-medium">
          Protected handshake encryption. Powered by UCollyx Identity Manager.
        </p>
      </div>

      {/* RIGHT SIDE PANEL: Interactive Security Handshake Simulation Logger */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#121424] relative flex-col justify-between p-16 overflow-hidden border-l border-white/5">
        
        {/* Lights Background Auras */}
        <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-[#00f2fe]/20 rounded-full blur-[110px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] bg-[#3b59ff]/15 rounded-full blur-[100px]" />

        {/* Top Header Label */}
        <div className="relative z-10 flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
          <Cpu size={14} className="text-[#00f2fe]" /> Handshake Status Stream
        </div>

        {/* Live Simulation Matrix Logger Box */}
        <div className="relative z-10 w-full max-w-sm mx-auto bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="border-b border-white/5 pb-3.5">
            <h4 className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Packet Analysis</h4>
            <div className="text-white font-black text-base tracking-tight flex items-center gap-2">
              Telemetry Status <Sparkles size={14} className="text-[#00f2fe]" />
            </div>
          </div>

          {/* Activity Process Sequence Timeline */}
          <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
            
            {/* Log Step 1: Dispatched */}
            <div className="flex items-start gap-4 text-xs relative z-10">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[9px] shadow-sm shadow-emerald-400 font-black shrink-0">
                ✓
              </div>
              <div className="space-y-0.5">
                <span className="text-white font-bold block">Payload Dispatched</span>
                <span className="text-white/40 text-[10px] font-mono">Status code: 202 - Accepted</span>
              </div>
            </div>

            {/* Log Step 2: Pending Approval */}
            <div className="flex items-start gap-4 text-xs relative z-10">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-[9px] font-black shrink-0 animate-pulse shadow-sm shadow-amber-400">
                <Clock size={10} strokeWidth={3} />
              </div>
              <div className="space-y-0.5">
                <span className="text-amber-400 font-bold block">Awaiting Authorization Signature</span>
                <span className="text-white/40 text-[10px] font-mono">Polling node cluster admin queue...</span>
              </div>
            </div>

            {/* Log Step 3: Deployment Route */}
            <div className="flex items-start gap-4 text-xs relative z-10 opacity-40">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                3
              </div>
              <div className="space-y-0.5">
                <span className="text-white font-medium block">Cluster Pipeline Initialization</span>
                <span className="text-white/40 text-[10px] font-mono">Binds localized system variables</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Panel Overview */}
        <div className="relative z-10 space-y-2">
          <h3 className="text-white font-black text-xl tracking-tight flex items-center gap-2">
            Secure Vector Processing <ShieldCheck size={18} className="text-[#3b59ff]" />
          </h3>
          <p className="text-white/50 text-xs leading-relaxed max-w-xs">
            Once verified by your organization cluster controller admin, your global operational dashboard workspace gets mapped on this device session context instantaneously.
          </p>
        </div>

      </div>

    </div>
  );
}