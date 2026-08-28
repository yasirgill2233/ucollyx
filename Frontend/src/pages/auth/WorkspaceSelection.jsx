// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { LayoutGrid, Users, Loader2, Sparkles, Check } from "lucide-react"; 
// import { useAvailableWorkspaces } from "../../hooks/useWorkspace";

// export default function WorkspaceSelection() {
//   const navigate = useNavigate();
//   const { data: workspaceRes, isLoading } = useAvailableWorkspaces(); 
//   const workspaces = workspaceRes?.data || [];
//   if (isLoading) {
//     return (
//       <div className="flex h-screen items-center justify-center bg-[#f3f5fa]">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2 className="animate-spin text-[#3b59ff]" size={44} />
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Workspaces...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-[#f3f5fa] p-6 relative overflow-hidden font-sans">
      
//       <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-gradient-to-tr from-[#3b59ff]/20 to-[#00f2fe]/30 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[6s]" />
//       <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-bl from-[#9d4edd]/20 to-[#00f2fe]/20 rounded-full blur-[20px] pointer-events-none animate-pulse duration-[8s]" />
//       <div className="absolute top-[-47%] right-[-20%] w-[600px] h-[600px] bg-gradient-to-bl from-[#FFB733]/20 to-[#FF7B00]/20 rounded-full blur-[50px] pointer-events-none animate-pulse duration-[8s]" />

//       <div className="flex flex-col w-full max-w-[950px] bg-white/70 backdrop-blur-2xl rounded-[32px] border border-white/60 shadow-[0_20px_50px_rgba(31,38,135,0.08)] p-10 md:p-14 items-center z-10 relative">

//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-black text-[#1a1d2f] tracking-tight mb-3 flex items-center justify-center gap-2">
//             How would you like to start? <Sparkles size={24} className="text-[#3b59ff]" />
//           </h1>
//           <p className="text-gray-500 text-sm font-medium">Choose an option to begin setting up your collaboration environment</p>
//         </div>

//         <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl">
            
//           <div 
//             onClick={() => navigate("/workspace-setup")} 
//             className="flex-1 border border-gray-200/60 rounded-[24px] p-8 flex flex-col items-center text-center transition-all duration-300 cursor-pointer bg-white/50 hover:bg-white hover:border-[#3b59ff] hover:shadow-[0_15px_35px_rgba(59,89,255,0.08)] hover:-translate-y-1 group relative overflow-hidden"
//           >
//             <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#3b59ff] to-[#00f2fe] opacity-0 group-hover:opacity-100 transition-opacity" />
            
//             <div className="w-16 h-16 bg-[#3b59ff]/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#3b59ff]/10 group-hover:scale-105 transition-all duration-300 text-[#3b59ff] shadow-inner">
//               <LayoutGrid size={30} strokeWidth={2} />
//             </div>
//             <h3 className="text-xl font-black text-[#1a1d2f] mb-3">Create a workspace</h3>
//             <p className="text-gray-500 font-medium leading-relaxed text-xs max-w-[240px]">
//               Set up a new dedicated space for your team or organization from scratch.
//             </p>
//           </div>

//           <div 
//             onClick={() => navigate("/join-workspace")} 
//             className="flex-1 border border-gray-200/60 rounded-[24px] p-8 flex flex-col items-center text-center transition-all duration-300 cursor-pointer bg-white/50 hover:bg-white hover:border-[#9d4edd] hover:shadow-[0_15px_35px_rgba(157,78,221,0.08)] hover:-translate-y-1 group relative overflow-hidden"
//           >
//             <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#9d4edd] to-[#00f2fe] opacity-0 group-hover:opacity-100 transition-opacity" />

//             <div className="w-16 h-16 bg-[#9d4edd]/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#9d4edd]/10 group-hover:scale-105 transition-all duration-300 text-[#9d4edd] shadow-inner">
//               <Users size={30} strokeWidth={2} />
//             </div>
//             <h3 className="text-xl font-black text-[#1a1d2f] mb-3">
//               {workspaces.length > 1 ? "Select a workspace" : "Join a workspace"}
//             </h3>
//             <p className="text-gray-500 font-medium leading-relaxed text-xs max-w-[240px]">
//               {workspaces.length > 1 
//                 ? `You are a member of ${workspaces.length} workspaces. Click to choose one.` 
//                 : "Connect with your team by entering a workspace invite code."}
//             </p>
//           </div>

//         </div>

//       </div>
//     </div>
//   );
// }



import React from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, Users, Loader2, Sparkles } from "lucide-react"; 
import { useAvailableWorkspaces } from "../../hooks/useWorkspace";

export default function WorkspaceSelection() {
  const navigate = useNavigate();
  const { data: workspaceRes, isLoading } = useAvailableWorkspaces(); 
  const workspaces = workspaceRes?.data || [];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white md:bg-[#f3f5fa]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#3b59ff]" size={44} />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Loading Workspaces...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white md:bg-[#f3f5fa] md:p-6 flex justify-center items-center font-sans relative overflow-x-hidden">
      
      {/* Desktop Dynamic Aura Glow Effects */}
      <div className="hidden md:block absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-gradient-to-tr from-[#3b59ff]/20 to-[#00f2fe]/30 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[6s]" />
      <div className="hidden md:block absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-bl from-[#9d4edd]/20 to-[#00f2fe]/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8s]" />
      <div className="hidden md:block absolute top-[-47%] right-[-20%] w-[600px] h-[600px] bg-gradient-to-bl from-[#FFB733]/20 to-[#FF7B00]/20 rounded-full blur-[50px] pointer-events-none animate-pulse duration-[8s]" />

      {/* Main Responsive Container: Mobile = Fullscreen Edge-to-Edge, Desktop = Glass Card */}
      <div className="w-full min-h-screen md:min-h-0 md:max-w-[950px] bg-white md:bg-white/70 md:backdrop-blur-2xl md:rounded-[32px] md:border md:border-white/60 md:shadow-[0_20px_50px_rgba(31,38,135,0.08)] px-6 py-8 sm:p-10 md:p-14 flex flex-col justify-center md:justify-center items-center z-10 relative">
        
        {/* Top Content Area */}
        <div className="w-full flex flex-col items-center">

          {/* Header Section */}
          <div className="text-center mb-8 md:mb-12 mt-2 md:mt-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1a1d2f] tracking-tight mb-2.5 flex items-center justify-center gap-2">
              How would you like to start? <Sparkles size={24} className="text-[#3b59ff]" />
            </h1>
            <p className="text-gray-500 text-xs md:text-sm font-medium max-w-md mx-auto">
              Choose an option to begin setting up your collaboration environment
            </p>
          </div>

          {/* Action Cards Grid/Flex */}
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 w-full max-w-3xl">
            
            {/* Create Workspace Option */}
            <div 
              onClick={() => navigate("/workspace-setup")} 
              className="flex-1 border border-gray-200/80 md:border-gray-200/60 rounded-2xl md:rounded-[24px] p-6 sm:p-8 flex flex-col items-center text-center transition-all duration-300 cursor-pointer bg-[#f8fafc]/60 md:bg-white/50 hover:bg-white hover:border-[#3b59ff] hover:shadow-[0_15px_35px_rgba(59,89,255,0.08)] active:scale-[0.98] md:hover:-translate-y-1 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#3b59ff] to-[#00f2fe] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[#3b59ff]/10 md:bg-[#3b59ff]/5 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-[#3b59ff]/10 group-hover:scale-105 transition-all duration-300 text-[#3b59ff]">
                <LayoutGrid size={28} strokeWidth={2} />
              </div>
              
              <h3 className="text-lg md:text-xl font-black text-[#1a1d2f] mb-2 md:mb-3">
                Create a workspace
              </h3>
              
              <p className="text-gray-500 font-medium leading-relaxed text-xs max-w-[260px]">
                Set up a new dedicated space for your team or organization from scratch.
              </p>
            </div>

            {/* Join / Select Workspace Option */}
            <div 
              onClick={() => navigate("/join-workspace")} 
              className="flex-1 border border-gray-200/80 md:border-gray-200/60 rounded-2xl md:rounded-[24px] p-6 sm:p-8 flex flex-col items-center text-center transition-all duration-300 cursor-pointer bg-[#f8fafc]/60 md:bg-white/50 hover:bg-white hover:border-[#9d4edd] hover:shadow-[0_15px_35px_rgba(157,78,221,0.08)] active:scale-[0.98] md:hover:-translate-y-1 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#9d4edd] to-[#00f2fe] opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="w-14 h-14 md:w-16 md:h-16 bg-[#9d4edd]/10 md:bg-[#9d4edd]/5 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-[#9d4edd]/10 group-hover:scale-105 transition-all duration-300 text-[#9d4edd]">
                <Users size={28} strokeWidth={2} />
              </div>
              
              <h3 className="text-lg md:text-xl font-black text-[#1a1d2f] mb-2 md:mb-3">
                {workspaces.length > 1 ? "Select a workspace" : "Join a workspace"}
              </h3>
              
              <p className="text-gray-500 font-medium leading-relaxed text-xs max-w-[260px]">
                {workspaces.length > 1 
                  ? `You are a member of ${workspaces.length} workspaces. Click to choose one.` 
                  : "Connect with your team by entering a workspace invite code."}
              </p>
            </div>

          </div>
        </div>

        {/* Footer Info / Space Holder */}
        <div className="pt-6 pb-2 text-center text-xs text-gray-400 font-medium">
          Need help? Contact workspace administrator
        </div>

      </div>
    </div>
  );
}