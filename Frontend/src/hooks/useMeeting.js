import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { meetingService } from '../api/services/meetingService';
import { toast } from 'react-hot-toast'; // Agar aap toast use kar rahe hain

export const useMeeting = (channelId) => {
  const queryClient = useQueryClient();

  // --- 1. Fetch All Meetings (Hub ke liye) ---
  const { data: meetings = [], isLoading: isLoadingMeetings } = useQuery({
    queryKey: ['meetings'],
    queryFn: () => meetingService.getAllMeetingsApi(),
    refetchOnWindowFocus: false,
    enabled: true // Ye hamesha fetch karega jab hook use hoga
  });

  // Common Success Handler
  const handleSuccess = () => {
    if (channelId) queryClient.invalidateQueries(['messages', channelId]);
    queryClient.invalidateQueries(['meetings']); // Meetings list refresh krain
  };

  // 1. Start Call Mutation
  const startCall = useMutation({
    mutationFn: (data) => meetingService.startCallApi(data),
    onSuccess: (res) => {
      // Messages list refresh krain taake naya 'call' card show ho jaye
      queryClient.invalidateQueries(['messages', channelId]);
    },
    onError: () => toast.error("Could not start meeting")
  });

  // 2. End Call Mutation
  const endCall = useMutation({
    mutationFn: (id) => meetingService.endCallApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', channelId]);
    }
  });

  // 3. Schedule Call Mutation
  const scheduleCall = useMutation({
    mutationFn: (data) => meetingService.scheduleCallApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', channelId]);
      toast.success("Meeting scheduled successfully!", 'success');
    }
  });

  const updateStatus = useMutation({
  mutationFn: ({ id, status }) => meetingService.updateStatusApi(id, status),
  onSuccess: () => queryClient.invalidateQueries(['messages', channelId])
});

  return {
    startCall,
    endCall,
    scheduleCall,
    updateStatus,
    isStarting: startCall.isLoading,
    isScheduling: scheduleCall.isLoading,
    meetings, // Meetings Page ke liye
    isLoadingMeetings,
  };
};