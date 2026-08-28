import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingsHubService } from '../api/services/meetingsHubService';
import { toast } from 'react-hot-toast';

export const useMeetingsHub = () => {
  const queryClient = useQueryClient();

  // --- GET DATA ---
  const meetingsQuery = useQuery({
    queryKey: ['hub-meetings'],
    queryFn: meetingsHubService.getHubMeetings,
  });

  // --- CREATE MUTATION ---
  const createMeeting = useMutation({
    mutationFn: (data) => meetingsHubService.createHubMeeting(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['hub-meetings']);
      toast.success("New meeting added to hub!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create meeting")
  });

  // --- UPDATE STATUS MUTATION ---
  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => meetingsHubService.updateMeetingStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries(['hub-meetings'])
  });

  return {
    meetings: meetingsQuery.data || [],
    isLoading: meetingsQuery.isLoading,
    error: meetingsQuery.error,
    createMeeting,
    updateStatus,
    isCreating: createMeeting.isLoading
  };
};