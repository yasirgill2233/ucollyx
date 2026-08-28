import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceService } from "../api/services/workspaceService";

export const useWorkspaceMembers = () => {
  return useQuery({
    queryKey: ["workspace-members"],
    queryFn: workspaceService.getWorkspaceMembers,
    staleTime: 0,
    select: (data) => data.data,
  });
};

export const useDashboardStats = (workspaceId) => {
  return useQuery({
    queryKey: ['dashboard-stats', workspaceId],
    queryFn: () => workspaceService.getDashboardStats(workspaceId),
    staleTime: 0, // 5 minutes cache
    refetchOnWindowFocus: true, // Jab user tab par wapis aaye to refresh ho
  });
};

export const useCheckInvite = (token) => {
  return useQuery({
    queryKey: ['check-invite', token],
    queryFn: () => workspaceService.checkInvite(token),
    enabled: !!token, // Sirf tab chale jab token ho
    retry: false,
  });
};

export const useAcceptInviteMutation = () => {
  return useMutation({
    mutationFn: workspaceService.acceptInvite,
  });
};

export const useAvailableWorkspaces = () => {
  return useQuery({
    queryKey: ['available-workspaces'],
    queryFn: workspaceService.getAvailableWorkspaces,
  });
};

export const useJoinWorkspaceMutation = () => {
  return useMutation({
    mutationFn: workspaceService.joinWorkspace,
  });
};

export const useCreateWorkspaceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.createWorkspace,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['available-workspaces']);
      queryClient.invalidateQueries(['my-workspaces']);
    }
  });
};
export const useInviteMutation = () => {
  return useMutation({
    mutationFn: workspaceService.inviteMembers,
  });
};

export const useHandleRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.handleJoinRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['workspace-members']);
      queryClient.invalidateQueries(['pending-requests']); 
    }
  });
};