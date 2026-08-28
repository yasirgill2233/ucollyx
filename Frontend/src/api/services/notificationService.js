import API from "../axios";

export const notificationService = {
  getNotifications: () => API.get("/notifications").then((res) => res.data),

  markRead: (id) =>
    API.put("/notifications/mark-read", { id }).then((res) => res.data),

  markAllRead: () =>
    API.put("/notifications/mark-all-read").then((res) => res.data),
};
