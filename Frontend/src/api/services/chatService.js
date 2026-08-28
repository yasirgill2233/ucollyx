import API from '../axios';

export const chatService = {

    getConversations: () => API.get("/messages/conversations").then(res => res.data),
    
    getChatMessages: ({ queryKey }) => {
      const [_, type, id] = queryKey;
      if (!id) return []; 
      const numericId = id.toString().includes("-") ? id.split("-")[1] : id;
      const endpoint = type === "channel" ? `/messages/channel/${numericId}` : `/messages/dm/${numericId}`;
      return API.get(endpoint).then(res => res.data); 
    },

    sendMessage: (formData) => API.post("/messages/send", formData).then(res => res.data),
};