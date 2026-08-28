import API from '../axios'; // Aapka axios instance
import toast from 'react-hot-toast';

export const meetingService = {

  // Dashboard/Hub ke liye saari meetings lana
    getAllMeetingsApi: async () => {
        const response = await API.get('/meetings'); // Backend controller ka route
        return response.data;
    },
    // Instant call start karne ke liye
    startCallApi: async (callData) => {
        const response = await API.post('/messages/start-call', callData);
        return response.data;
    },

    // Call khatam hone par duration update karne ke liye
    endCallApi: async (messageId) => {
        const response = await API.patch(`/messages/end-call/${messageId}`);
        return response.data;
    },

    // Future meeting schedule karne ke liye
    scheduleCallApi: async (scheduleData) => {
        const response = await API.post('/messages/schedule-call', scheduleData);
        return response.data;
    },

    updateStatusApi: async (messageId, status) => {
        const response = await API.patch(`/messages/update-status/${messageId}`, { status });
        return response.data;
    }
};

export const finalizeMeetingApi = async (audioBlob, messageId) => {

  console.log("Finalizing meeting with audio blob:", audioBlob, "and messageId:", messageId);
  
  const formData = new FormData();
  formData.append('audio', audioBlob, 'meeting-rec.webm');

  try {
    const response = await API(`/meetings/finalize/${messageId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    // Success Notification (Optional)
    toast.success("Meeting transcript generated!");
    return response.data;
  } catch (error) {
    console.error("Failed to process meeting:", error);
  }
};