import API from "../axios";

export const issueService = {
  getProjectMembers: async (projectId) => {
    if (!projectId) return [];
    const response = await API.get(`/issues/project/${projectId}/members`);
    return response.data.data;
  },

  createIssue: async (issueData) => {
    const response = await API.post(`/issues/create`, issueData);
    return response.data.data;
  },

  getIssues: async (projectFilter) => {
    const url =
      projectFilter === "All Projects"
        ? "/issues"
        : `/issues/project/${projectFilter}`;

    const response = await API.get(url);
    console.log("CHeck fromm service:::::::::::::::::",response.data.data)
    return response.data.success ? response.data.data : response.data;
  },

getPriorityIssues: async (status) => {
  
  const response = await API.get("/issues"); 
  const data = response.data.success ? response.data.data : response.data;

  return Array.isArray(data)
    ? data.filter((bug) => {
        const target1 = status?.st1 || "New";
        const target2 = status?.st2 || "Acknowledged";
        return [target1, target2].includes(bug.status || "");
      })
    : [];
},

  getAssignedIssues: async () => {
    const response = await API.get("/issues/assigned-to-me");
    return response.data.success ? response.data.data : response.data;
  },


  updateIssueStatus: async ({ issueId, status, note }) => {
    const response = await API.patch(`/issues/${issueId}/status`, { status, note });
    return response.data;
  },

  getReadyForQAIssues: async () => {
    const response = await API.get("/issues/qa-ready");
    return response.data.success ? response.data.data : response.data;
  },

  verifyIssueVerdict: async ({ issueId, status, failComment }) => {
    const response = await API.patch(`/issues/${issueId}/verify`, {
      status,
      comment: failComment || undefined
    });
    return response.data;
  },

  addIssueComment: async (issueId, comment_text) => {
    const response = await API.post(`/issues/${issueId}/comments`, { comment_text });
    return response.data;
  },
};
