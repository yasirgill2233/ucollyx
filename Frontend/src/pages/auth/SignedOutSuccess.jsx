import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router";

const SignedOutSuccess = () => {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(timer);
          navigate("/login"); // redirect to login
          return 100;
        }
        return old + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0f2f5] p-6 animate-in fade-in duration-700">
      <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
        <div className="bg-green-500 rounded-full p-1">
          <Check size={24} className="text-white" />
        </div>
      </div>

      <h2 className="text-3xl font-black text-gray-800">Signed out successfully</h2>
      <p className="text-gray-400 mt-3 font-medium text-lg">Your session has been cleared</p>

      <div className="mt-12 w-full max-w-[380px]">
        <p className="text-indigo-600 font-semibold mb-4 text-sm animate-pulse">Redirecting to login...</p>
        {/* Progress Bar Container */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-100 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignedOutSuccess;