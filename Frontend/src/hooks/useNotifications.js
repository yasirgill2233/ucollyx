import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../api/services/notificationService";

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.getNotifications,
    refetchInterval: 30000,
    staleTime: 0,
  });

  const markRead = useMutation({
    mutationFn: (id) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  return {
    ...notificationsQuery,
    markRead: markRead.mutate,
    markAllRead: markAllRead.mutate,
    isProcessing: markRead.isLoading || markAllRead.isLoading,
  };
};
