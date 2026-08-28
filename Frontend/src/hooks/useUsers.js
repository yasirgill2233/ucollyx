import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../api/services/userService';
import { triggerToast } from '../utils/toastHelper';

export const useUsersData = () => {
  return useQuery({
    queryKey: ['users-list'],
    queryFn: userService.getUsers,
    staleTime: 0,
  });
};
export const useUserMutations = () => {
  const queryClient = useQueryClient();

  // Status Mutation
  const statusMutation = useMutation({
    mutationFn: userService.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['users-list']);
    }
  });

  // Role Mutation
  const roleMutation = useMutation({
    mutationFn: userService.updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries(['users-list']);
    }
  });

  // Invite Mutation
  const inviteMutation = useMutation({
    mutationFn: userService.sendInvites,
    onSuccess: () => {
      triggerToast("Invitations sent successfully!", "success");
    },
    onError: (err) => {
      triggerToast(err.response?.data?.message || "Failed to send invites", "error");
    }
  });

  return { statusMutation, roleMutation, inviteMutation };
};