import API from '../axios';

export const projectService = {
  getProjects: () => API.get("/projects/get").then(res => res.data),
  getUsersForProject: () => API.get("/users/proj").then(res => res.data),
  getMyProjects: () => API.get("/projects/my-projects").then(res => res.data),
  createProject: (payload) => API.post("/projects/create", payload).then(res => res.data),
  saveTeam: (projectId, members) => API.post(`/projects/${projectId}/team`, { members }).then(res => res.data),
  archiveProject: (projectId) => API.patch(`/projects/${projectId}/archive`).then(res => res.data),
  activeProject: (projectId) => API.patch(`/projects/${projectId}/active`).then(res => res.data),
};