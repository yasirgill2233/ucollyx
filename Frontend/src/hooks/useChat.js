import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "../api/services/chatService";

export const useMessages = (type, id) => {
  return useQuery({
    queryKey: ["messages", type, id],
    queryFn: chatService.getChatMessages,
    enabled: !!id,
    staleTime: 0,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatService.sendMessage,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["messages"]);
      queryClient.invalidateQueries(["channels"]);
    },
  });
};

export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: chatService.getConversations,
    staleTime: 0,
  });
};