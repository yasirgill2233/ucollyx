// import React, { useState } from "react";
// import { Mail, Lock, Eye, EyeOff, User, UserRoundPlus, Loader2, Sparkles } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { triggerToast } from "../../utils/toastHelper";
// import { useRegisterMutation } from "../../hooks/useAuth";

// export default function Register() {
//   const navigate = useNavigate();
//   const registerMutation = useRegisterMutation();

//   const [formData, setFormData] = useState({
//     full_name: "",
//     email: "",
//     password: "",
//     confirmPassword: ""
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const playErrorSound = () => {
//     const audio = new Audio("/sounds/short_bongo.mp3");
//     audio.volume = 0.5;
//     audio.play().catch(() => {});
//   };

//   const handleSignup = (e) => {
//     e.preventDefault();
    
//     if (formData.password !== formData.confirmPassword) {
//       return triggerToast("Passwords do not match", "error");
//     }

//     // Mutation call
//     registerMutation.mutate({
//       full_name: formData.full_name,
//       email: formData.email,
//       password: formData.password
//     }, {
//       onSuccess: () => {
//         triggerToast("OTP sent to your email!", "success");
//         navigate('/verify', { state: { email: formData.email } });
//       },
//       onError: (err) => {
//         const errorMsg = err.response?.data?.errors
//             ? err.response.data.errors.map((e) => `${e.field}: ${e.message}`).join("\n")
//             : err.response?.data?.message || "Registration failed";
//           triggerToast(errorMsg, "error");
//       }
//     });
//   };

//   // UI helpers
//   const isLoading = registerMutation.isPending;

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-[#f3f5fa] p-4 relative overflow-hidden font-sans">
      
//       {/* Dynamic Aura Background Colors (Image pattern layout compatibility) */}
//       <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-gradient-to-tr from-[#3b59ff]/20 to-[#00f2fe]/30 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[6s]" />
//       <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-bl from-[#9d4edd]/20 to-[#00f2fe]/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8s]" />
//       <div className="absolute top-[35%] left-[40%] w-[350px] h-[350px] bg-[#9d4edd]/15 rounded-full blur-[90px] pointer-events-none" />

//       {/* Main Container: Light Mode Translucent Glassmorphism */}
//       <div className="flex flex-row w-full max-w-[1050px] h-[720px] bg-white/70 backdrop-blur-2xl rounded-[32px] border border-white/60 shadow-[0_20px_50px_rgba(31,38,135,0.08)] overflow-hidden z-10">
        
//         {/* Left Side: Register Form Panel */}
//         <div className="w-full md:w-1/2 p-12 flex flex-col justify-center relative bg-white/40 overflow-y-auto custom-scrollbar">
          
//           {/* Logo Brand Title */}
//           <div className="absolute top-8 left-12 flex items-center gap-2.5">
//             <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3b59ff] to-[#00f2fe] flex items-center justify-center font-black text-white shadow-[0_4px_12px_rgba(59,89,255,0.3)] text-sm">
//               U
//             </div>
//             <span className="text-xl font-black text-[#1e2238] tracking-wider">UCollyx</span>
//           </div>

//           <div className="mb-6 mt-10">
//             <h1 className="text-3xl font-black text-[#1a1d2f] tracking-tight mb-1.5 flex items-center gap-2">
//               Create Account <Sparkles size={22} className="text-[#3b59ff]" />
//             </h1>
//             <p className="text-gray-500 text-xs font-medium">Join UCollyx to collaborate with your team</p>
//           </div>

//           <form className="flex flex-col gap-4" onSubmit={handleSignup}>
//             {/* Full Name */}
//             <div>
//               <label className="text-[#565d7a] text-[11px] mb-1.5 block font-bold uppercase tracking-wider">
//                 Full Name
//               </label>
//               <div className="relative group">
//                 <input
//                   name="full_name"
//                   type="text"
//                   value={formData.full_name}
//                   onChange={handleChange}
//                   className="w-full bg-[#f8fafc]/90 border border-gray-200/80 rounded-xl p-3 pl-11 text-sm text-[#1e2238] placeholder-gray-400 focus:bg-white focus:border-[#3b59ff] focus:ring-4 focus:ring-[#3b59ff]/10 outline-none transition-all duration-300 shadow-inner"
//                   placeholder="John Doe"
                  
//                 />
//                 <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3b59ff] transition-colors" />
//               </div>
//             </div>

//             {/* Email Address */}
//             <div>
//               <label className="text-[#565d7a] text-[11px] mb-1.5 block font-bold uppercase tracking-wider">
//                 Email Address
//               </label>
//               <div className="relative group">
//                 <input
//                   name="email"
//                   type="text"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="w-full bg-[#f8fafc]/90 border border-gray-200/80 rounded-xl p-3 pl-11 text-sm text-[#1e2238] placeholder-gray-400 focus:bg-white focus:border-[#3b59ff] focus:ring-4 focus:ring-[#3b59ff]/10 outline-none transition-all duration-300 shadow-inner"
//                   placeholder="name@company.com"
               
//                 />
//                 <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3b59ff] transition-colors" />
//               </div>
//             </div>

//             {/* Password */}
//             <div>
//               <label className="text-[#565d7a] text-[11px] mb-1.5 block font-bold uppercase tracking-wider">
//                 Password
//               </label>
//               <div className="relative group">
//                 <input
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="w-full bg-[#f8fafc]/90 border border-gray-200/80 rounded-xl p-3 pl-11 pr-11 text-sm text-[#1e2238] placeholder-gray-400 focus:bg-white focus:border-[#9d4edd] focus:ring-4 focus:ring-[#9d4edd]/10 outline-none transition-all duration-300 shadow-inner"
//                   placeholder="••••••••••••"
                
//                 />
//                 <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#9d4edd] transition-colors" />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             {/* Confirm Password */}
//             <div>
//               <label className="text-[#565d7a] text-[11px] mb-1.5 block font-bold uppercase tracking-wider">
//                 Confirm Password
//               </label>
//               <div className="relative group">
//                 <input
//                   name="confirmPassword"
//                   type={showConfirmPassword ? "text" : "password"}
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   className="w-full bg-[#f8fafc]/90 border border-gray-200/80 rounded-xl p-3 pl-11 pr-11 text-sm text-[#1e2238] placeholder-gray-400 focus:bg-white focus:border-[#9d4edd] focus:ring-4 focus:ring-[#9d4edd]/10 outline-none transition-all duration-300 shadow-inner"
//                   placeholder="••••••••••••"
                
//                 />
//                 <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#9d4edd] transition-colors" />
//                 <button
//                   type="button"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
//                 >
//                   {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full relative overflow-hidden bg-gradient-to-r from-[#3b59ff] to-[#8a2be2] hover:opacity-95 text-white font-bold py-3.5 rounded-xl transition-all duration-300 mt-2 flex justify-center items-center gap-2 shadow-[0_6px_20px_rgba(59,89,255,0.25)] active:scale-[0.99]"
//             >
//               {isLoading ? (
//                 <Loader2 size={18} className="animate-spin text-white" />
//               ) : (
//                 <>
//                   <UserRoundPlus size={18} />
//                   <span>Create Account</span>
//                 </>
//               )}
//             </button>
//           </form>

//           {/* Footer Navigation Link */}
//           <div className="mt-6 flex flex-col items-center">
//             <p className="text-xs text-gray-500 font-medium">
//               Already have an account?{" "}
//               <span
//                 onClick={() => navigate("/login")}
//                 className="text-[#3b59ff] font-extrabold cursor-pointer hover:underline tracking-wide transition-all"
//               >
//                 Sign In
//               </span>
//             </p>
//           </div>
//         </div>

//         {/* Right Side: Showcase Side-Panel Matching Layout Consistency */}
//         <div className="hidden md:flex w-1/2 bg-gradient-to-b from-[#f8fafc]/90 to-[#edf2f7]/90 border-l border-gray-100 flex-col items-center justify-center p-12 text-center relative">
          
//           {/* Light Grid Lines Overlay */}
//           <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:30px_30px] opacity-100 pointer-events-none" />
          
//           <div className="relative mb-6 transform hover:scale-[1.02] transition-transform duration-700">
//             <div className="absolute inset-0 bg-gradient-to-tr from-[#00f2fe]/30 to-[#3b59ff]/10 rounded-full blur-3xl opacity-70" />
            
//             {/* Login screen aur register screen me symmetry barqarar rakhne ke liye common presentation asset image stack layout hook kiya hai */}
//             <img
//               src="/image.png"
//               alt="UCollyx Ecosystem"
//               className="w-[340px] relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
//             />
//           </div>

//           <h2 className="text-2xl font-black text-[#1a1d2f] mb-3 z-10 leading-snug">
//             Your Digital Second Brain <br /> For Software Engineering
//           </h2>
//           <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-[280px] z-10">
//             Unifying multi-user IDE environments, automated tracking, context-switching optimization, and continuous delivery pipelines.
//           </p>

//           {/* Carousel Slider Active States Indicator */}
//           <div className="flex gap-2.5 mt-8 z-10">
//             <div className="w-2 h-1.5 bg-gray-300 rounded-full"></div>
//             <div className="w-6 h-1.5 bg-[#3b59ff] rounded-full shadow-[0_2px_8px_rgba(59,89,255,0.4)]"></div>
//             <div className="w-2 h-1.5 bg-gray-300 rounded-full"></div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }



import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  UserRoundPlus,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { triggerToast } from "../../utils/toastHelper";
import { useRegisterMutation } from "../../hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const playErrorSound = () => {
    const audio = new Audio("/sounds/short_bongo.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const handleSignup = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return triggerToast("Passwords do not match", "error");
    }

    // Mutation call
    registerMutation.mutate(
      {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
      },
      {
        onSuccess: () => {
          triggerToast("OTP sent to your email!", "success");
          navigate("/verify", { state: { email: formData.email } });
        },
        onError: (err) => {
          const errorMsg = err.response?.data?.errors
            ? err.response.data.errors
                .map((e) => `${e.field}: ${e.message}`)
                .join("\n")
            : err.response?.data?.message || "Registration failed";
          triggerToast(errorMsg, "error");
        },
      }
    );
  };

  // UI helpers
  const isLoading = registerMutation.isPending;

  return (
    <div className="w-full min-h-screen bg-white md:bg-[#f3f5fa] md:p-4 flex justify-center items-center font-sans relative overflow-x-hidden">
      {/* Desktop Background Glow Effects */}
      <div className="hidden md:block absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-gradient-to-tr from-[#3b59ff]/20 to-[#00f2fe]/30 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[6s]" />
      <div className="hidden md:block absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-bl from-[#9d4edd]/20 to-[#00f2fe]/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8s]" />
      <div className="hidden md:block absolute top-[35%] left-[40%] w-[350px] h-[350px] bg-[#9d4edd]/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Container: Mobile = Fullscreen Edge-to-Edge, Desktop = Card Box */}
      <div className="w-full min-h-screen md:min-h-0 md:max-w-[1050px] md:h-[720px] bg-white md:bg-white/70 md:backdrop-blur-2xl md:rounded-[32px] md:border md:border-white/60 md:shadow-[0_20px_50px_rgba(31,38,135,0.08)] overflow-hidden z-10 flex flex-col md:flex-row justify-between">
        
        {/* Left Side / Mobile Fullscreen Panel */}
        <div className="w-full md:w-1/2 px-6 py-8 sm:p-10 md:p-12 flex flex-col justify-center min-h-screen md:min-h-0 relative bg-white md:bg-white/40 overflow-y-auto custom-scrollbar">
          
          <div>
            {/* Logo Brand Title */}
            

            {/* Mobile Mascot/Icon (Mobile Only) */}
            <div className="flex md:hidden justify-center my-4">
              <div className="rounded-3xl flex items-center justify-center relative">
                <div className="rounded-2xl mb-4 flex items-center justify-center text-white font-black text-xl">
                  <img src="/wb.png" alt="" className="w-16"/>
                </div>
              </div>
            </div>

            {/* Header Title */}
            <div className="mb-5 md:mb-6 md:mt-10 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-black text-[#1a1d2f] tracking-tight mb-1.5 flex items-center justify-center md:justify-start gap-2">
                Create Account <Sparkles size={22} className="text-[#3b59ff]" />
              </h1>
              <p className="text-gray-500 text-xs font-medium">
                Join UCollyx to collaborate with your team
              </p>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-3.5 md:gap-4" onSubmit={handleSignup}>
              {/* Full Name */}
              <div>
                <label className="text-[#565d7a] text-[11px] mb-1.5 block font-bold uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative group">
                  <input
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full bg-[#f8fafc] md:bg-[#f8fafc]/90 border border-gray-200/80 rounded-2xl md:rounded-xl p-3.5 p-3 pl-11 text-sm text-[#1e2238] placeholder-gray-400 focus:bg-white focus:border-[#3b59ff] focus:ring-4 focus:ring-[#3b59ff]/10 outline-none transition-all duration-300"
                    placeholder="John Doe"
                  />
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3b59ff] transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="text-[#565d7a] text-[11px] mb-1.5 block font-bold uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    name="email"
                    type="text"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#f8fafc] md:bg-[#f8fafc]/90 border border-gray-200/80 rounded-2xl md:rounded-xl p-3.5 p-3 pl-11 text-sm text-[#1e2238] placeholder-gray-400 focus:bg-white focus:border-[#3b59ff] focus:ring-4 focus:ring-[#3b59ff]/10 outline-none transition-all duration-300"
                    placeholder="name@company.com"
                  />
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3b59ff] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-[#565d7a] text-[11px] mb-1.5 block font-bold uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-[#f8fafc] md:bg-[#f8fafc]/90 border border-gray-200/80 rounded-2xl md:rounded-xl p-3.5 p-3 pl-11 pr-11 text-sm text-[#1e2238] placeholder-gray-400 focus:bg-white focus:border-[#9d4edd] focus:ring-4 focus:ring-[#9d4edd]/10 outline-none transition-all duration-300"
                    placeholder="••••••••••••"
                  />
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#9d4edd] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-[#565d7a] text-[11px] mb-1.5 block font-bold uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative group">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-[#f8fafc] md:bg-[#f8fafc]/90 border border-gray-200/80 rounded-2xl md:rounded-xl p-3.5 p-3 pl-11 pr-11 text-sm text-[#1e2238] placeholder-gray-400 focus:bg-white focus:border-[#9d4edd] focus:ring-4 focus:ring-[#9d4edd]/10 outline-none transition-all duration-300"
                    placeholder="••••••••••••"
                  />
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#9d4edd] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-[#3b59ff] to-[#8a2be2] hover:opacity-95 active:scale-[0.98] text-white font-bold py-4 md:py-3.5 rounded-2xl md:rounded-xl transition-all duration-300 mt-2 flex justify-center items-center gap-2 shadow-[0_6px_20px_rgba(59,89,255,0.25)] touch-manipulation cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin text-white" />
                ) : (
                  <>
                    <UserRoundPlus size={18} />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Navigation Link */}
          <div className="pt-6 pb-2 text-center">
            <p className="text-xs text-gray-500 font-medium">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-[#3b59ff] font-extrabold cursor-pointer hover:underline tracking-wide transition-all"
              >
                Sign In
              </span>
            </p>
          </div>
        </div>

        {/* Right Side: Showcase Side-Panel (Desktop Only) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-b from-[#f8fafc]/90 to-[#edf2f7]/90 border-l border-gray-100 flex-col items-center justify-center p-12 text-center relative">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:30px_30px] opacity-100 pointer-events-none" />

          <div className="relative mb-6 transform hover:scale-[1.02] transition-transform duration-700">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00f2fe]/30 to-[#3b59ff]/10 rounded-full blur-3xl opacity-70" />

            <img
              src="/image.png"
              alt="UCollyx Ecosystem"
              className="w-[340px] relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
            />
          </div>

          <h2 className="text-2xl font-black text-[#1a1d2f] mb-3 z-10 leading-snug">
            Your Digital Second Brain <br /> For Software Engineering
          </h2>
          <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-[280px] z-10">
            Unifying multi-user IDE environments, automated tracking, context-switching optimization, and continuous delivery pipelines.
          </p>

          <div className="flex gap-2.5 mt-8 z-10">
            <div className="w-2 h-1.5 bg-gray-300 rounded-full"></div>
            <div className="w-6 h-1.5 bg-[#3b59ff] rounded-full shadow-[0_2px_8px_rgba(59,89,255,0.4)]"></div>
            <div className="w-2 h-1.5 bg-gray-300 rounded-full"></div>
          </div>
        </div>

      </div>
    </div>
  );
}