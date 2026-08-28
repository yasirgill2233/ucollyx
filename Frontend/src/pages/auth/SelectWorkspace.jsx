import { useLocation, useNavigate } from "react-router-dom";
import useLocalStorage from "../../hooks/custom/useLocalStorage";
import { useLoginMutation } from "../../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import API from "../../api/axios";

export default function SelectWorkspace() {
  const location = useLocation();
  const [user, setUser] = useLocalStorage('user', null);
  const [token, setToken] = useLocalStorage('token', null);
    const queryClient = useQueryClient();
  const navigate = useNavigate();

  const workspaces = location.state?.workspaces || [];
  const loginMutation = useLoginMutation();

    const email = user.email
    const password = user.password

  
  console.log(":::",user);
  
  const handleEnterWorkspace = async (ws) => {

    try {
      toast.loading("Initializing workspace session...", { id: "ws-auth" });

    const response = await API.post(
        "/auth/select-workspace", 
        {
          workspaceId: ws.id,
          role: ws.role 
        },
      );

      if (response.data && response.data.success) {
        // React Query ka purana cache clear karo taake naye workspace ka data fetch ho ske
        queryClient.clear();
        
        // 1. Naya JWT Token aur user state update karo (Bina password ke)
        setToken(response.data.newToken);
        setUser({
          ...user, 
          workspace_id: ws.id, 
          role: ws.role
        });

        toast.success(`Welcome to ${ws.name}`, { id: "ws-auth" });

    console.log("Selected workspace:", user);
    if (ws.role === "dev") {
      navigate(`/dev/dashboard`);
    } else if (ws.role === "qa") {
      navigate(`/qa/dashboard`);
    } else if (ws.role === "manager") {
      navigate(`/manager/portfolio`);
    } else if (ws.role === "org_admin") {
      navigate(`/org-admin/dashboard`);
    } else if (ws.role === "member") {
      navigate(`/awaiting-role`);
    } else {
      navigate(`/admin/dashboard`);
    }
    }} catch (error) {
      console.error("Login failed:", error);
      toast.error("Failed to enter workspace. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Select your workspace
      </h2>
      <div className="grid gap-4 w-full max-w-md">
        {workspaces.map((ws) => (
          <button
            key={ws.id}
            onClick={() => handleEnterWorkspace(ws)}
            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xl">
              {ws.name.charAt(0)}
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-700 group-hover:text-indigo-600">
                {ws.name}
              </h3>
              <p className="text-xs text-gray-400">ucollyx.com/{ws.slug}</p>
            </div>
          </button>
        ))}
      </div>

    </div>
  );
}