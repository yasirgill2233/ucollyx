import React, { useState } from "react";
import {
  Link2,
  ArrowLeft,
  ArrowRight,
  Check,
  Code,
  Search,
  ShieldCheck,
  Layers,
  Sparkles,
  Terminal,
  Fingerprint,
  UserCheck,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router";
import { triggerToast } from "../../utils/toastHelper";
import { useAvailableWorkspaces, useJoinWorkspaceMutation } from "../../hooks/useWorkspace";

export default function JoinWorkspaceFlow() {
  const roles = [
    {
      id: "dev",
      label: "Developer",
      icon: <Code size={18} />,
      color: "text-[#3b59ff]",
      bg: "bg-[#3b59ff]/5",
      border: "hover:border-[#3b59ff]/40",
      activeBg: "border-[#3b59ff] bg-[#3b59ff]/5",
      desc: "Write clean systems code and deploy microservices infrastructure."
    },
    {
      id: "qa",
      label: "QA Engineer",
      icon: <Search size={18} />,
      color: "text-[#00f2fe]",
      bg: "bg-[#00f2fe]/5",
      border: "hover:border-[#00f2fe]/40",
      activeBg: "border-[#00f2fe] bg-[#00f2fe]/5",
      desc: "Perform automated environment telemetry and logic assert checking."
    },
    {
      id: "manager",
      label: "Project Manager",
      icon: <ShieldCheck size={18} />,
      color: "text-[#9d4edd]",
      bg: "bg-[#9d4edd]/5",
      border: "hover:border-[#9d4edd]/40",
      activeBg: "border-[#9d4edd] bg-[#9d4edd]/5",
      desc: "Supervise active milestone cycles, scrum points, and deployment scopes."
    },
  ];

  const navigate = useNavigate();
  
  // React Query Hooks
  const { data: workspaceRes } = useAvailableWorkspaces();
  const joinMutation = useJoinWorkspaceMutation();

  // UI States
  const [tab, setTab] = useState("invite");
  const [inviteCode, setInviteCode] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [role, setRole] = useState("");
  const [step, setStep] = useState("role-selection");

  const workspaces = workspaceRes?.data || [];

  const handleJoinAction = () => {
    if (tab === "invite" && !inviteCode) {
      new Audio("/sounds/short_bongo.mp3").play().catch(() => {});
      return triggerToast("Please enter an invite code!", "error");
    }
    
    if (tab === "request" && !selectedWorkspace) {
      return triggerToast("Please select a workspace!", "error");
    }

    const payload = tab === "invite" 
      ? { role, inviteCode: inviteCode.toUpperCase(), type: "code" }
      : { role, workspaceId: selectedWorkspace.id, type: "request" };

    joinMutation.mutate(payload, {
      onSuccess: () => {
        if (tab === "invite") {
          triggerToast("Success! Welcome to the workspace.", "success");
          navigate("/login");
        } else {
          navigate("/request-pending");
        }
      },
      onError: (err) => {
        triggerToast(err.response?.data?.message || "Something went wrong", "error");
      }
    });
  };

  const isJoining = joinMutation.isPending;
  const activeRoleLabel = roles.find(r => r.id === role)?.label || "Not Configured";

  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc] font-sans overflow-hidden">
      <div className="w-full lg:w-[55%] flex flex-col justify-between p-8 md:p-14 lg:p-20 bg-white relative z-10 overflow-y-auto">

        <div className="w-full max-w-xl mx-auto my-auto py-10">
          <div className="flex items-center gap-4 mb-10 text-xs font-bold uppercase tracking-widest text-gray-400">
            <span className={`transition-colors ${step === "role-selection" ? "text-[#3b59ff]" : "text-gray-400 font-medium"}`}>01. Profile Role</span>
            <div className={`h-[2px] w-12 rounded ${step === "join-method" ? "bg-[#9d4edd]" : "bg-gray-200"}`} />
            <span className={`transition-colors ${step === "join-method" ? "text-[#9d4edd]" : "text-gray-400 font-medium"}`}>02. Instance Gateway</span>
          </div>
          {step === "role-selection" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-7">
              <div>
                <h1 className="text-3xl font-black text-[#1a1d2f] tracking-tight mb-2">
                  Select your profile role
                </h1>
                <p className="text-gray-500 text-sm">Specify your structural operational context for targeted authorization permissions.</p>
              </div>

              <div className="space-y-3.5">
                {roles.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`group p-4.5 border border-gray-200 rounded-2xl cursor-pointer transition-all duration-200 flex items-start gap-4 ${
                      role === r.id ? r.activeBg : `bg-white ${r.border}`
                    }`}
                  >
                    <div className={`w-11 h-11 ${r.bg} ${r.color} rounded-xl flex items-center justify-center shadow-inner shrink-0 mt-0.5`}>
                      {r.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-black text-sm tracking-tight ${role === r.id ? "text-[#1a1d2f]" : "text-gray-700"}`}>
                          {r.label}
                        </span>
                        {role === r.id && (
                          <div className="w-5 h-5 bg-[#3b59ff] rounded-lg flex items-center justify-center text-white shadow-sm shadow-blue-200 animate-in zoom-in-50 duration-200">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => role ? setStep("join-method") : triggerToast("Please select a role", "error")}
                className="w-full py-4 bg-gradient-to-r from-[#3b59ff] to-[#8a2be2] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg active:scale-[0.99]"
              >
                <span>Continue Configuration</span> <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === "join-method" && (
            <div className="animate-in fade-in slide-in-from-right duration-300 space-y-6">
              <div>
                <h1 className="text-3xl font-black text-[#1a1d2f] tracking-tight mb-2">
                  Connect to a workspace
                </h1>
                <p className="text-gray-500 text-sm">Provide your cryptographical invite target code or request authorization credentials.</p>
              </div>

              <div className="flex bg-[#f1f5f9] p-1.5 rounded-xl w-full">
                <button
                  onClick={() => setTab("invite")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    tab === "invite" ? "bg-white shadow-sm text-[#3b59ff]" : "text-gray-400"
                  }`}
                >
                  🔑 Invite Gateway
                </button>
                <button
                  onClick={() => { setTab("request"); setSelectedWorkspace(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    tab === "request" ? "bg-white shadow-sm text-[#9d4edd]" : "text-gray-400"
                  }`}
                >
                  🔍 Query Clusters
                </button>
              </div>

              {tab === "invite" ? (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <label className="block text-[#565d7a] text-xs font-bold uppercase tracking-wider">
                    Secure Workspace Invite Code
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="e.g. UCOLLYX-DEV-X94"
                    className="w-full bg-[#f8fafc] border border-gray-200 rounded-xl p-4 text-sm font-bold tracking-widest text-[#3b59ff] uppercase placeholder-gray-400 placeholder:normal-case focus:bg-white focus:border-[#3b59ff] focus:ring-4 focus:ring-[#3b59ff]/10 outline-none transition-all duration-200 shadow-inner"
                  />
                  <p className="text-[11px] text-gray-400 font-medium px-0.5">
                    Code signatures are case-insensitive and binded to single-user allocations.
                  </p>
                </div>
              ) : (

                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 animate-in fade-in duration-200">
                  <label className="block text-[#565d7a] text-xs font-bold uppercase tracking-wider mb-1">
                    Select Available Corporate Node
                  </label>
                  {workspaces.length > 0 ? (
                    workspaces.map((ws) => (
                      <div
                        key={ws.id}
                        onClick={() => setSelectedWorkspace(ws)}
                        className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedWorkspace?.id === ws.id 
                            ? "border-[#9d4edd] bg-[#9d4edd]/5 shadow-sm" 
                            : "border-gray-100 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0 shadow-sm ${ws.color || 'bg-gradient-to-tr from-indigo-500 to-purple-500'}`}>
                          {ws.letter || ws.name?.substring(0,1).toUpperCase()}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <h4 className="font-bold text-sm text-[#1a1d2f] truncate">{ws.name}</h4>
                          <p className="text-xs text-gray-400 truncate">
                            {ws.members || 0} active members · {ws.type || "Public Cloud"}
                          </p>
                        </div>
                        {selectedWorkspace?.id === ws.id && (
                          <div className="w-5 h-5 bg-[#9d4edd] rounded-lg flex items-center justify-center text-white">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs font-medium text-gray-400 text-center py-6 bg-[#f8fafc] border border-dashed border-gray-200 rounded-xl">
                      No discovered active workspace instances found.
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep("role-selection")}
                  className="px-6 py-3.5 bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all duration-200"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={handleJoinAction}
                  disabled={isJoining}
                  className={`flex-1 py-3.5 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                    tab === "invite" ? "bg-gradient-to-r from-[#3b59ff] to-[#00f2fe]" : "bg-gradient-to-r from-[#9d4edd] to-[#3b59ff]"
                  }`}
                >
                  {isJoining ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    <>
                      <span>{tab === "invite" ? "Verify & Enter Workspace" : "Transmit Access Request"}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center lg:text-left text-xs text-gray-400 font-medium">
          Protected handshake encryption. Powered by UCollyx Identity Manager.
        </p>
      </div>

      <div className="hidden lg:flex lg:w-[45%] bg-[#121424] relative flex-col justify-between p-16 overflow-hidden border-l border-white/5">
        
        <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-[#3b59ff]/25 rounded-full blur-[110px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] bg-[#9d4edd]/15 rounded-full blur-[100px]" />

        <div className="relative z-10 flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
          <Layers size={14} className="text-[#00f2fe]" /> Session Handshake Parameters
        </div>

        <div className="relative z-10 w-full max-w-sm mx-auto bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="border-b border-white/5 pb-3.5">
            <h4 className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Target Configuration</h4>
            <div className="text-white font-black text-base tracking-tight flex items-center gap-2">
              Gateway Request <Sparkles size={14} className="text-[#00f2fe]" />
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
              <div className="flex items-center gap-2.5 text-white/70">
                <UserCheck size={14} className="text-[#3b59ff]" />
                <span>Identity Context</span>
              </div>
              <span className={`font-bold text-[11px] px-2.5 py-0.5 rounded-md ${role ? 'text-[#3b59ff] bg-[#3b59ff]/10 border border-[#3b59ff]/20' : 'text-white/30'}`}>
                {activeRoleLabel}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
              <div className="flex items-center gap-2.5 text-white/70">
                <Fingerprint size={14} className="text-[#9d4edd]" />
                <span>Access Vector</span>
              </div>
              <span className="text-white font-bold font-mono text-[11px] uppercase tracking-wider">
                {tab === "invite" ? "Invite Token" : "Cluster Route"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
              <div className="flex items-center gap-2.5 text-white/70">
                <Terminal size={14} className="text-[#00f2fe]" />
                <span>Vector Payload</span>
              </div>
              <span className="text-emerald-400 font-bold font-mono text-[11px] max-w-[150px] truncate">
                {tab === "invite" 
                  ? (inviteCode ? inviteCode.toUpperCase() : "NULL_TOKEN") 
                  : (selectedWorkspace ? selectedWorkspace.name : "NULL_SELECTION")}
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-2">
          <h3 className="text-white font-black text-xl tracking-tight">
            Seamless Infrastructure Binding
          </h3>
          <p className="text-white/50 text-xs leading-relaxed max-w-xs">
            Joining an active instance binds your localized engineering workspace setup configurations onto the target organizational cryptographic security keys instantly.
          </p>
        </div>

      </div>

    </div>
  );
}