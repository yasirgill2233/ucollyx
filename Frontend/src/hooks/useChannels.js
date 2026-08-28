import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { channelService } from '../api/services/channelService';

export const useChannelMembers = (activeChatId, isChannel) => {
  return useQuery({
    queryKey: ['channel-members', activeChatId],
    queryFn: () => channelService.getChannelMembers(activeChatId),
    enabled: !!activeChatId && isChannel,
    staleTime: 0,
    refetchInterval: 30000,
  });
};

export const useChannels = (onFirstLoad) => {
  return useQuery({
    queryKey: ["channels"],
    queryFn: channelService.getMyChannels,
    onSuccess: (data) => {
      if (onFirstLoad && data?.data?.length > 0) {
        onFirstLoad(data.data[0]);
      }
    },
  });
};

export const useAddMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: channelService.addMember,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([
        "messages",
        "channel",
        variables.channelId,
      ]);
    },
  });
};

export const useCreateChannel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: channelService.createChannel,
    onSuccess: () => queryClient.invalidateQueries(["channels"]),
  });
};
