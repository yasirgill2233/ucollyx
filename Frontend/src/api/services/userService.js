import API from '../axios';

export const userService = {
  getUsers: () => API.get("/users/all").then(res => res.data),
  
  updateStatus: ({ userId, status }) => 
    API.post(`/users/${userId}/status`, { status }).then(res => res.data),
    
  updateRole: ({ userId, role, workspaceId }) => 
    API.post(`/workspace/member/${userId}/${workspaceId}/role`, { role }).then(res => res.data),
    
  sendInvites: (payload) => 
    API.post("/workspace/invite-members", payload).then(res => res.data),
};