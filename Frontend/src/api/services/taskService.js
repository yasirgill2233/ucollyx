import API from "../axios";

export const taskService = {
  getBoard: async (projectId) => {
    const res = await API.get(`/tasks/board/${projectId}`);
    return res.data;
  },

  getAssignedBoard: async (projectId) => {
    const res = await API.get(`/tasks/board/assigned/${projectId}`);
    return res.data;
  },

  getTodayTasks: async () => {
    const res = await API.get(`/tasks/board/today-tasks`);
    return res.data; 
  },

  updateTaskPosition: async (taskId, data, socket, projectId) => {
    const res = await API.patch(`/tasks/${taskId}/position`, data);
    
    if (socket) {
      socket.emit("board:task_moved", {
        project_id: projectId,
        task_id: taskId,
        source_data: data
      });
    }
    return res.data;
  },

  createTask: async (taskData, socket) => {
    const res = await API.post(`/tasks/create`, taskData);
    
    if (socket && res.data) {
      socket.emit("board:task_created", {
        project_id: taskData.project_id,
        task: res.data
      });
    }
    return res.data;
  },

  updateTask: async (taskId, updatedFields, socket) => {
    const res = await API.put(`/tasks/${taskId}`, updatedFields);
    
    if (socket) {
      socket.emit("board:task_updated", {
        project_id: updatedFields.project_id,
        task_id: taskId,
        updatedFields
      });
    }
    return res.data;
  },

  getComments: async (taskId) => {
    const res = await API.get(`/tasks/${taskId}/comments`);
    return res.data;
  },

  postComment: async (taskId, commentText, socket, projectId) => {
    const res = await API.post(`/tasks/${taskId}/comments`, {
      comment_text: commentText,
    });
    
    if (socket && res.data) {
      socket.emit("task:new_comment", {
        project_id: projectId,
        task_id: taskId,
        comment: res.data
      });
    }
    return res.data;
  },

  getSubtasks: async (taskId) => {
    const res = await API.get(`/tasks/${taskId}/subtasks`);
    return res.data;
  },

  createSubtask: async (taskId, subtaskData) => {
    const res = await API.post(`/tasks/${taskId}/subtasks`, subtaskData);
    return res.data;
  },

  toggleSubtask: async (subtaskId) => {
    const res = await API.put(`/tasks/subtasks/${subtaskId}/toggle`);
    return res.data;
  },

  getTaskAssignees: async (taskId) => {
    const res = await API.get(`/tasks/${taskId}/assignees`);
    return res.data;
  },

  toggleAssignee: async (taskId, userId) => {
    const res = await API.post(`/tasks/${taskId}/assignees/toggle`, {
      user_id: userId,
    });
    return res.data;
  },

  getProjectEpics: async (projectId) => {
    const res = await API.get(`/tasks/projects/${projectId}/epics`);
    return res.data;
  },

  updateTaskEpic: async (taskId, epicId) => {
    const res = await API.put(`/tasks/${taskId}/epic`, { epic_id: epicId });
    return res.data;
  },

  getTaskMessages: async (taskId) => {
    const response = await API.get(`/tasks/${taskId}/messages`);
    return response.data; 
  },

  sendTaskMessage: async (taskId, text, socket, roomName) => {
    const response = await API.post(`/tasks/${taskId}/messages`, { text });
    
    if (socket && response.data) {
      socket.emit("chat:send_message", {
        roomName,
        message: response.data
      });
    }
    return response.data;
  },
};
