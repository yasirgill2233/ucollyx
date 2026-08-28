import API from '../axios';

export const workspaceService = {
  getWorkspaceMembers: () => API.get('/workspace/members').then(res => res.data),
  getDashboardStats: (workspaceId) => 
    API.get(`/workspace/${workspaceId}/dashboard-stats`).then(res => res.data),
  checkInvite: (token) => API.get(`/workspace/check-invite/${token}`).then(res => res.data),
  acceptInvite: (payload) => API.post("/workspace/accept-invite", payload).then(res => res.data),
  getAvailableWorkspaces: () => API.get("/workspace/workspaces").then(res => res.data),
  joinWorkspace: (payload) => API.post("/workspace/join", payload).then(res => res.data),
  updatePassword: (password) => API.post("/auth/update-password", { password }).then(res => res.data),
  createWorkspace: (formData) => 
    API.post("/workspace/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data),

  inviteMembers: (inviteData) => 
    API.post("/workspace/invite-members", inviteData).then(res => res.data),
  handleJoinRequest: (data) => 
    API.post('/workspace/handle-join-request', data).then(res => res.data),
};