import API from "../axios";

export const channelService = {
  getChannelMembers: (prefixedId) => {
    const numericId = prefixedId.toString().split("-").pop();
    return API.get(`/channels/${numericId}/members`).then((res) => res.data);
  },
  getMyChannels: () => API.get("/channels/my-channels").then((res) => res.data),
  createChannel: (payload) => API.post("/channels/create", payload).then((res) => res.data),
  addMember:     (payload) => API.post("/channels/add-member", payload).then((res) => res.data),
};
